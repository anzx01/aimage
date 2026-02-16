-- ============================================
-- 终极完整数据库修复脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- 一次性解决所有字段和约束问题
-- ============================================

-- ========================================
-- 1. 修复 projects 表
-- ========================================

-- 添加所有可能缺失的列
DO $$
BEGIN
    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'user_id') THEN
        ALTER TABLE public.projects ADD COLUMN user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'title') THEN
        ALTER TABLE public.projects ADD COLUMN title TEXT NOT NULL DEFAULT '';
    END IF;

    -- description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE public.projects ADD COLUMN description TEXT;
    END IF;

    -- mode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'mode') THEN
        ALTER TABLE public.projects ADD COLUMN mode TEXT NOT NULL DEFAULT 'basic';
    END IF;

    -- project_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_type') THEN
        ALTER TABLE public.projects ADD COLUMN project_type TEXT NOT NULL DEFAULT 'basic';
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'status') THEN
        ALTER TABLE public.projects ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;

    -- credits_used
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'credits_used') THEN
        ALTER TABLE public.projects ADD COLUMN credits_used INTEGER DEFAULT 0;
    END IF;

    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'created_at') THEN
        ALTER TABLE public.projects ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE public.projects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 删除并重建所有约束
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_mode_check;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects ADD CONSTRAINT projects_project_type_check CHECK (project_type IN ('basic', 'advanced'));
ALTER TABLE public.projects ADD CONSTRAINT projects_mode_check CHECK (mode IN ('basic', 'advanced'));
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'processing', 'completed', 'failed'));

-- ========================================
-- 2. 修复 generation_tasks 表
-- ========================================

-- 添加所有可能缺失的列
DO $$
BEGIN
    -- project_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'project_id') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;

    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'user_id') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- model_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'model_name') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN model_name TEXT NOT NULL DEFAULT 'veo3.1-fast';
    END IF;

    -- model_version (新增)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'model_version') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN model_version TEXT DEFAULT 'v1';
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'status') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    -- config
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'config') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN config JSONB;
    END IF;

    -- result_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'result_url') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN result_url TEXT;
    END IF;

    -- error_message
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'error_message') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN error_message TEXT;
    END IF;

    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'created_at') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'updated_at') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- credits_cost (新增)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'credits_cost') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN credits_cost INTEGER DEFAULT 0;
    END IF;

    -- credits_used (新增，可能的别名)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'credits_used') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN credits_used INTEGER DEFAULT 0;
    END IF;

    -- duration (新增，可能需要)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'duration') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN duration INTEGER DEFAULT 15;
    END IF;

    -- style (新增，可能需要)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'style') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN style TEXT;
    END IF;

    -- prompt (新增，可能需要)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'prompt') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN prompt TEXT;
    END IF;

    -- task_id (新增，可能需要)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generation_tasks' AND column_name = 'task_id') THEN
        ALTER TABLE public.generation_tasks ADD COLUMN task_id TEXT;
    END IF;
END $$;

-- 如果某些列存在但有 NOT NULL 约束，修改为可空
DO $$
BEGIN
    -- model_version
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks'
        AND column_name = 'model_version' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.generation_tasks ALTER COLUMN model_version DROP NOT NULL;
        ALTER TABLE public.generation_tasks ALTER COLUMN model_version SET DEFAULT 'v1';
    END IF;

    -- credits_cost
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks'
        AND column_name = 'credits_cost' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.generation_tasks ALTER COLUMN credits_cost DROP NOT NULL;
        ALTER TABLE public.generation_tasks ALTER COLUMN credits_cost SET DEFAULT 0;
    END IF;

    -- credits_used
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks'
        AND column_name = 'credits_used' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.generation_tasks ALTER COLUMN credits_used DROP NOT NULL;
        ALTER TABLE public.generation_tasks ALTER COLUMN credits_used SET DEFAULT 0;
    END IF;

    -- duration
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'generation_tasks'
        AND column_name = 'duration' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.generation_tasks ALTER COLUMN duration DROP NOT NULL;
        ALTER TABLE public.generation_tasks ALTER COLUMN duration SET DEFAULT 15;
    END IF;
END $$;

-- 删除并重建约束
ALTER TABLE public.generation_tasks DROP CONSTRAINT IF EXISTS generation_tasks_status_check;
ALTER TABLE public.generation_tasks ADD CONSTRAINT generation_tasks_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- ========================================
-- 3. 修复 assets 表
-- ========================================

-- 添加所有可能缺失的列
DO $$
BEGIN
    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'user_id') THEN
        ALTER TABLE public.assets ADD COLUMN user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'type') THEN
        ALTER TABLE public.assets ADD COLUMN type TEXT NOT NULL DEFAULT 'image';
    END IF;

    -- asset_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'asset_type') THEN
        ALTER TABLE public.assets ADD COLUMN asset_type TEXT NOT NULL DEFAULT 'image';
    END IF;

    -- file_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'file_url') THEN
        ALTER TABLE public.assets ADD COLUMN file_url TEXT NOT NULL DEFAULT '';
    END IF;

    -- file_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'file_name') THEN
        ALTER TABLE public.assets ADD COLUMN file_name TEXT NOT NULL DEFAULT '';
    END IF;

    -- file_size
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'file_size') THEN
        ALTER TABLE public.assets ADD COLUMN file_size BIGINT;
    END IF;

    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'created_at') THEN
        ALTER TABLE public.assets ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 删除并重建约束
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_type_check;
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_asset_type_check;

ALTER TABLE public.assets ADD CONSTRAINT assets_type_check CHECK (type IN ('image', 'video', 'audio'));
ALTER TABLE public.assets ADD CONSTRAINT assets_asset_type_check CHECK (asset_type IN ('image', 'video', 'audio'));

-- ========================================
-- 4. 修复 credit_transactions 表
-- ========================================

-- 添加所有可能缺失的列
DO $$
BEGIN
    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'user_id') THEN
        ALTER TABLE public.credit_transactions ADD COLUMN user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'amount') THEN
        ALTER TABLE public.credit_transactions ADD COLUMN amount INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- type (代码中实际使用的字段名)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'type') THEN
        ALTER TABLE public.credit_transactions ADD COLUMN type TEXT NOT NULL DEFAULT 'purchase';
    END IF;

    -- transaction_type (可能的别名)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'transaction_type') THEN
        ALTER TABLE public.credit_transactions ADD COLUMN transaction_type TEXT DEFAULT 'purchase';
    END IF;

    -- description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'description') THEN
        ALTER TABLE public.credit_transactions ADD COLUMN description TEXT;
    END IF;

    -- related_project_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'related_project_id') THEN
        ALTER TABLE public.credit_transactions ADD COLUMN related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
    END IF;

    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'created_at') THEN
        ALTER TABLE public.credit_transactions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 删除所有可能的旧约束
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;

-- 添加新约束（使用 type 字段，这是代码中实际使用的）
ALTER TABLE public.credit_transactions ADD CONSTRAINT credit_transactions_type_check CHECK (type IN ('purchase', 'deduct', 'refund'));

-- ========================================
-- 5. 修复 users 表
-- ========================================

-- 添加 credits 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'credits') THEN
        ALTER TABLE public.users ADD COLUMN credits INTEGER DEFAULT 100 NOT NULL;
    END IF;
END $$;

-- 为现有用户设置初始积分
UPDATE public.users SET credits = 100 WHERE credits IS NULL OR credits = 0;

-- ========================================
-- 6. 验证所有表结构
-- ========================================

SELECT 'projects' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;
