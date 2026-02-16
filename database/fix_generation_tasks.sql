-- 修复 generation_tasks 表，添加缺失的列
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 添加 config 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'config'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN config JSONB;
    END IF;
END $$;

-- 2. 添加 result_url 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'result_url'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN result_url TEXT;
    END IF;
END $$;

-- 3. 添加 error_message 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'error_message'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- 4. 添加 updated_at 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 5. 验证 generation_tasks 表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'generation_tasks'
ORDER BY ordinal_position;
