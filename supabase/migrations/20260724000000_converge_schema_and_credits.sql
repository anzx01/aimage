-- ============================================================================
-- 收敛迁移：统一数据层 + 积分安全
-- 日期：2026-07-24
--
-- 目的：
--   1. 锁死积分安全漏洞——收紧 profiles 的列级 UPDATE 权限，禁止用户直接改
--      credits / subscription_tier / is_admin（此前 RLS 允许更新自己 profile 的
--      任意列，导致可在浏览器端刷积分）。
--   2. 新增 profiles.is_admin，用于管理后台鉴权。
--   3. 移除隐晦的"插入任务即自动扣费"触发器，改为显式、带余额检查、原子的
--      deduct/refund RPC，仅允许后端 service_role 调用。
--
-- 本迁移幂等，可在已执行过旧迁移的库上安全重复运行。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles: 新增 is_admin，保证 avatar_url 存在（修复历史迁移遗留）
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- ----------------------------------------------------------------------------
-- 2. 收紧 profiles 更新权限（列级）
--    RLS 是行级的，无法限制"能改哪些列"，因此用列级 GRANT 兜底：
--    撤销 authenticated 对整表的 UPDATE，只放开非敏感列。
--    credits / subscription_tier / is_admin 只能由 service_role（RPC）修改。
-- ----------------------------------------------------------------------------
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, phone) ON profiles TO authenticated;

-- 行级策略保持：仅能操作自己的行
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 3. 移除"插入 generation_tasks 即自动扣费"的隐式触发器
--    扣费改由后端服务层显式调用 RPC，避免副作用式扣费、且能做余额检查。
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS deduct_credits_on_generation_task ON generation_tasks;
DROP FUNCTION IF EXISTS deduct_credits_on_task_creation();

-- ----------------------------------------------------------------------------
-- 4. 显式扣费 RPC：原子（行锁）+ 余额检查 + 写流水
--    返回扣费后的新余额。仅 service_role 可执行。
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- 行锁，保证并发下的原子读改
  SELECT credits INTO v_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_balance, p_amount;
  END IF;

  v_balance := v_balance - p_amount;
  UPDATE profiles SET credits = v_balance WHERE id = p_user_id;

  INSERT INTO credit_transactions
    (user_id, amount, balance_after, transaction_type, description, reference_id, reference_type)
  VALUES
    (p_user_id, -p_amount, v_balance, 'spend', p_description, p_reference_id, p_reference_type);

  RETURN v_balance;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. 显式退款 RPC：原子 + 写流水，返回退款后的新余额。仅 service_role 可执行。
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refund_user_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT credits INTO v_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  v_balance := v_balance + p_amount;
  UPDATE profiles SET credits = v_balance WHERE id = p_user_id;

  INSERT INTO credit_transactions
    (user_id, amount, balance_after, transaction_type, description, reference_id, reference_type)
  VALUES
    (p_user_id, p_amount, v_balance, 'refund', p_description, p_reference_id, p_reference_type);

  RETURN v_balance;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. RPC 执行权限：禁止匿名/登录用户直接调用，只允许后端 service_role
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION deduct_user_credits(uuid, integer, text, uuid, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION refund_user_credits(uuid, integer, text, uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION deduct_user_credits(uuid, integer, text, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION refund_user_credits(uuid, integer, text, uuid, text) TO service_role;
