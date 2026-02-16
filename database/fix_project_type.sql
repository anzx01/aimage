-- 修复 projects 表的 project_type 字段问题
-- 在 Supabase SQL Editor 中执行此脚本

-- 方案 1: 如果 project_type 列存在但不需要，删除它
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_type'
    ) THEN
        ALTER TABLE public.projects DROP COLUMN project_type;
    END IF;
END $$;

-- 方案 2: 或者将 project_type 设置为可空并添加默认值
-- DO $$
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM information_schema.columns
--         WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_type'
--     ) THEN
--         ALTER TABLE public.projects ALTER COLUMN project_type DROP NOT NULL;
--         ALTER TABLE public.projects ALTER COLUMN project_type SET DEFAULT 'basic';
--     END IF;
-- END $$;

-- 验证 projects 表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;
