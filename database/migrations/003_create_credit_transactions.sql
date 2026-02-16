-- 积分交易记录表
-- 如果表已存在，先删除
DROP TABLE IF EXISTS credit_transactions;

-- 创建积分交易记录表
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

-- 创建索引
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);

-- 添加注释
COMMENT ON TABLE credit_transactions IS '积分交易记录表';
COMMENT ON COLUMN credit_transactions.id IS '交易ID';
COMMENT ON COLUMN credit_transactions.user_id IS '用户ID';
COMMENT ON COLUMN credit_transactions.amount IS '积分变动数量（正数为增加，负数为扣除）';
COMMENT ON COLUMN credit_transactions.type IS '交易类型：purchase-购买, deduct-扣除, refund-退款';
COMMENT ON COLUMN credit_transactions.description IS '交易描述';
COMMENT ON COLUMN credit_transactions.related_project_id IS '关联的项目ID（如果有）';
COMMENT ON COLUMN credit_transactions.created_at IS '创建时间';
COMMENT ON COLUMN credit_transactions.updated_at IS '更新时间';

-- 启用 RLS (Row Level Security)
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能查看自己的交易记录
CREATE POLICY "Users can view their own transactions"
    ON credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- 创建 RLS 策略：用户可以创建自己的交易记录
CREATE POLICY "Users can create their own transactions"
    ON credit_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 确保 users 表有 credits 字段
-- 如果没有，添加它
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'credits'
    ) THEN
        ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0 NOT NULL;
        COMMENT ON COLUMN users.credits IS '用户积分余额';
    END IF;
END $$;

-- 创建触发器函数：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_credit_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_credit_transactions_updated_at_trigger ON credit_transactions;
CREATE TRIGGER update_credit_transactions_updated_at_trigger
    BEFORE UPDATE ON credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_transactions_updated_at();
