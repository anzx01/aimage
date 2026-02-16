-- ============================================
-- 查询所有表的实际结构
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本，查看所有表的字段
-- ============================================

-- 查看 projects 表的所有列
SELECT 'projects' as table_name,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- 查看 generation_tasks 表的所有列
SELECT 'generation_tasks' as table_name,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'generation_tasks'
ORDER BY ordinal_position;

-- 查看 assets 表的所有列
SELECT 'assets' as table_name,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'assets'
ORDER BY ordinal_position;

-- 查看 credit_transactions 表的所有列
SELECT 'credit_transactions' as table_name,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'credit_transactions'
ORDER BY ordinal_position;

-- 查看 users 表的所有列
SELECT 'users' as table_name,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 查看所有约束
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid IN (
    'public.projects'::regclass,
    'public.generation_tasks'::regclass,
    'public.assets'::regclass,
    'public.credit_transactions'::regclass,
    'public.users'::regclass
)
ORDER BY table_name, constraint_name;
