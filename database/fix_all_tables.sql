-- ============================================
-- 完整数据库修复脚本 - 一次性解决所有字段问题
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- ========================================
-- 1. 修复 projects 表
-- ========================================

-- 添加 mode 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'mode'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN mode TEXT NOT NULL DEFAULT 'basic';
    END IF;
END $$;

-- 添加 project_type 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_type'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN project_type TEXT NOT NULL DEFAULT 'basic';
    END IF;
END $$;

-- 添加 status 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
END $$;

-- 添加 credits_used 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'credits_used'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN credits_used INTEGER DEFAULT 0;
    END IF;
END $$;

-- 删除并重建 project_type 检查约束
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_project_type_check CHECK (project_type IN ('basic', 'advanced'));

-- 删除并重建 mode 检查约束
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_mode_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_mode_check CHECK (mode IN ('basic', 'advanced'));

-- 删除并重建 status 检查约束
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'processing', 'completed', 'failed'));

-- ========================================
-- 2. 修复 generation_tasks 表
-- ========================================

-- 添加 model_name 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'model_name'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN model_name TEXT NOT NULL DEFAULT 'veo3.1-fast';
    END IF;
END $$;

-- 添加 status 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- 添加 config 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'config'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN config JSONB;
    END IF;
END $$;

-- 添加 result_url 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'result_url'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN result_url TEXT;
    END IF;
END $$;

-- 添加 error_message 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'error_message'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- 添加 created_at 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 添加 updated_at 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.generation_tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 删除并重建 status 检查约束
ALTER TABLE public.generation_tasks DROP CONSTRAINT IF EXISTS generation_tasks_status_check;
ALTER TABLE public.generation_tasks ADD CONSTRAINT generation_tasks_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- ========================================
-- 3. 修复 assets 表
-- ========================================

-- 添加 type 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'type'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN type TEXT NOT NULL DEFAULT 'image';
    END IF;
END $$;

-- 添加 asset_type 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'asset_type'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN asset_type TEXT NOT NULL DEFAULT 'image';
    END IF;
END $$;

-- 添加 file_url 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'file_url'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN file_url TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- 添加 file_name 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'file_name'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN file_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- 添加 file_size 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'file_size'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN file_size BIGINT;
    END IF;
END $$;

-- 删除并重建 type 检查约束
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_type_check;
ALTER TABLE public.assets ADD CONSTRAINT assets_type_check CHECK (type IN ('image', 'video', 'audio'));

-- 删除并重建 asset_type 检查约束
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_asset_type_check;
ALTER TABLE public.assets ADD CONSTRAINT assets_asset_type_check CHECK (asset_type IN ('image', 'video', 'audio'));

-- ========================================
-- 4. 修复 credit_transactions 表
-- ========================================

-- 添加 transaction_type 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'transaction_type'
    ) THEN
        ALTER TABLE public.credit_transactions ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'purchase';
    END IF;
END $$;

-- 删除并重建 transaction_type 检查约束
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
ALTER TABLE public.credit_transactions ADD CONSTRAINT credit_transactions_type_check CHECK (transaction_type IN ('purchase', 'deduct', 'refund'));

-- ========================================
-- 5. 验证所有表结构
-- ========================================

-- 验证 projects 表
SELECT 'projects' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- 验证 generation_tasks 表
SELECT 'generation_tasks' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'generation_tasks'
ORDER BY ordinal_position;

-- 验证 assets 表
SELECT 'assets' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'assets'
ORDER BY ordinal_position;

-- 验证 credit_transactions 表
SELECT 'credit_transactions' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'credit_transactions'
ORDER BY ordinal_position;
