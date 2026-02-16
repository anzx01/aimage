-- ============================================
-- 快速修复 credit_transactions 表
-- ============================================

-- 1. 查看当前表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'credit_transactions'
ORDER BY ordinal_position;

-- 2. 查看当前约束
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.credit_transactions'::regclass;

-- 3. 删除所有可能的约束
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;

-- 4. 确保 type 列存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'type'
    ) THEN
        ALTER TABLE public.credit_transactions ADD COLUMN type TEXT;
    END IF;
END $$;

-- 5. 如果 type 列有 NOT NULL 约束，移除它
ALTER TABLE public.credit_transactions ALTER COLUMN type DROP NOT NULL;

-- 6. 设置默认值
ALTER TABLE public.credit_transactions ALTER COLUMN type SET DEFAULT 'purchase';

-- 7. 更新现有的 NULL 值
UPDATE public.credit_transactions SET type = 'purchase' WHERE type IS NULL;

-- 8. 添加新的检查约束
ALTER TABLE public.credit_transactions
ADD CONSTRAINT credit_transactions_type_check
CHECK (type IN ('purchase', 'deduct', 'refund'));

-- 9. 验证修复结果
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'credit_transactions'
ORDER BY ordinal_position;

SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.credit_transactions'::regclass
AND conname LIKE '%type%';
