# 修复积分系统数据库表

## 问题
`credit_transactions` 表缺少 `type` 列，导致购买积分时出错。

## 解决方案

请在 Supabase Dashboard 中执行以下 SQL：

### 方法 1：完整重建表（推荐）

```sql
-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS credit_transactions CASCADE;

-- 2. 创建新的积分交易记录表
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'deduct', 'refund')),
    description TEXT,
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);

-- 4. 启用 RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
CREATE POLICY "Users can view their own transactions"
    ON credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
    ON credit_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. 确保 users 表有 credits 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0 NOT NULL;
```

### 方法 2：只添加缺失的列（如果表已有数据）

```sql
-- 添加 type 列
ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'purchase'
CHECK (type IN ('purchase', 'deduct', 'refund'));

-- 添加其他可能缺失的列
ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
```

## 执行步骤

1. 打开 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 创建新查询
5. 复制上面的 SQL（推荐使用方法 1）
6. 点击 "Run" 执行
7. 刷新浏览器页面，重试购买功能

## 验证

执行完成后，可以运行以下查询验证表结构：

```sql
-- 查看表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'credit_transactions'
ORDER BY ordinal_position;
```

应该看到以下列：
- id (uuid)
- user_id (uuid)
- amount (integer)
- type (character varying)
- description (text)
- related_project_id (uuid)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
