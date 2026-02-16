-- ============================================
-- AIMAGE 数据库完整初始化脚本
-- ============================================
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    credits INTEGER DEFAULT 100 NOT NULL,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 2. 创建触发器：自动创建用户记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. 创建 projects 表
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    mode TEXT NOT NULL CHECK (mode IN ('basic', 'advanced')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- 4. 创建 credit_transactions 表
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'deduct', 'refund')),
    description TEXT,
    related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.credit_transactions;

CREATE POLICY "Users can view own transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 为现有的 auth.users 创建 public.users 记录
INSERT INTO public.users (id, email, full_name, credits)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    100
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 6. 创建其他必要的表（如果需要）

-- generation_tasks 表
CREATE TABLE IF NOT EXISTS public.generation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    config JSONB,
    result_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generation_tasks_project_id ON public.generation_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_user_id ON public.generation_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_status ON public.generation_tasks(status);

ALTER TABLE public.generation_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON public.generation_tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON public.generation_tasks;

CREATE POLICY "Users can view own tasks" ON public.generation_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON public.generation_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- assets 表
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can create own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;

CREATE POLICY "Users can view own assets" ON public.assets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assets" ON public.assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON public.assets
    FOR DELETE USING (auth.uid() = user_id);

-- project_assets 关联表
CREATE TABLE IF NOT EXISTS public.project_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON public.project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_asset_id ON public.project_assets(asset_id);

ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project assets" ON public.project_assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- 7. 验证表创建
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'projects', 'credit_transactions', 'generation_tasks', 'assets', 'project_assets')
ORDER BY table_name;
