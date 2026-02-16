# 检查和创建必要的数据库表

## 问题
数据库中没有 `users` 表，需要先创建完整的表结构。

## 解决方案

请在 Supabase Dashboard 的 SQL Editor 中**按顺序**执行以下 SQL：

### 步骤 1: 检查现有表

```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 步骤 2: 创建 users 表（如果不存在）

```sql
-- 创建 users 表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- 创建触发器函数：自动创建 user 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：当 auth.users 有新用户时自动创建 public.users 记录
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 步骤 3: 创建 projects 表（如果不存在）

```sql
-- 创建 projects 表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- 启用 RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);
```

### 步骤 4: 创建 credit_transactions 表

```sql
-- 创建积分交易记录表
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'deduct', 'refund')),
    description TEXT,
    related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);

-- 启用 RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.credit_transactions;

CREATE POLICY "Users can view own transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
    ON public.credit_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### 步骤 5: 为当前登录用户创建记录

```sql
-- 为当前已存在的 auth.users 创建 public.users 记录
INSERT INTO public.users (id, email, full_name, credits)
SELECT
    id,
    email,
    raw_user_meta_data->>'full_name',
    100
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
```

### 步骤 6: 验证

```sql
-- 验证表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'projects', 'credit_transactions')
ORDER BY table_name;

-- 查看当前用户
SELECT id, email, credits, subscription_tier, created_at
FROM public.users;
```

## 执行步骤

1. 打开 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. **按顺序**执行上面的每个步骤
5. 确认每个步骤都成功执行
6. 刷新浏览器页面
7. 重试购买功能

## 注意事项

- 必须按顺序执行，因为表之间有依赖关系
- 如果某个步骤失败，查看错误信息并解决后再继续
- 执行完成后，所有现有的 auth.users 都会自动获得 100 积分
