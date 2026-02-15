-- ============================================
-- 验证和修复触发器
-- ============================================
--
-- 使用方法:
-- 1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
-- 2. 复制此文件全部内容
-- 3. 粘贴到 SQL Editor
-- 4. 点击 Run 按钮
--
-- ============================================

-- 检查触发器是否存在
SELECT
  tgname as trigger_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- 检查函数是否存在
SELECT
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 如果触发器不存在，重新创建
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 重新创建函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 为现有用户手动创建 profiles（如果不存在）
INSERT INTO public.profiles (id, email, full_name, credits)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name',
  10
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 验证结果
SELECT
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.credits
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
