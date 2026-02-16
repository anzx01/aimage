# 添加 credits 字段到 users 表

## 问题
users 表缺少 credits 字段，导致无法查询和更新用户积分。

## 解决方案

请在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL：

```sql
-- 1. 添加 credits 字段到 users 表
ALTER TABLE users
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100 NOT NULL;

-- 2. 为现有用户设置初始积分（如果需要）
UPDATE users
SET credits = 100
WHERE credits IS NULL OR credits = 0;

-- 3. 添加注释
COMMENT ON COLUMN users.credits IS '用户积分余额';

-- 4. 验证字段是否添加成功
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'credits';
```

## 执行步骤

1. 打开 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 创建新查询
5. 复制上面的 SQL
6. 点击 "Run" 执行
7. 确认看到成功消息
8. 刷新浏览器页面，重试购买功能

## 验证

执行完成后，可以运行以下查询验证：

```sql
-- 查看 users 表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 查看当前用户的积分
SELECT id, email, credits
FROM users
LIMIT 5;
```

## 完整的数据库设置

如果你想一次性设置所有必要的表和字段，执行以下完整 SQL：

```sql
-- 1. 确保 users 表有 credits 字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100 NOT NULL;

-- 2. 创建积分交易记录表
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'deduct', 'refund')),
    description TEXT,
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
    ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
    ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type
    ON credit_transactions(type);

-- 4. 启用 RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 5. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON credit_transactions;

-- 6. 创建新策略
CREATE POLICY "Users can view own transactions"
    ON credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
    ON credit_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 7. 为现有用户设置初始积分
UPDATE users
SET credits = 100
WHERE credits IS NULL OR credits = 0;
```

执行完成后，刷新页面即可使用积分功能！
