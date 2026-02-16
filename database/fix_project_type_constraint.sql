-- 修复 projects 表的 project_type 检查约束
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 查看当前的约束定义
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.projects'::regclass
AND conname LIKE '%project_type%';

-- 2. 删除旧的 project_type 检查约束
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_type_check;

-- 3. 添加新的检查约束，允许 'basic' 和 'advanced'
ALTER TABLE public.projects
ADD CONSTRAINT projects_project_type_check
CHECK (project_type IN ('basic', 'advanced'));

-- 4. 验证约束已更新
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.projects'::regclass
AND conname LIKE '%project_type%';

-- 5. 查看 projects 表的完整结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;
