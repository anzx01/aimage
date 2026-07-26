-- ============================================================================
-- 修复迁移：projects 表 project_type 枚举值对齐 + 清理遗留列
-- 日期：2026-07-26
--
-- 问题：
--   1. projects.project_type 的 CHECK 约束只允许旧值 (basic/advanced/...)，
--      与代码中的 ProjectType enum (one_click_basic/one_click_advanced/...) 不一致。
--   2. 现有数据使用旧值 'advanced'/'basic'，导致 ProjectResponse 反序列化失败。
--   3. 遗留的 mode 和 credits_used 列不再使用（P0-3 已改为显式扣费）。
--
-- 本迁移幂等，可在已执行过旧迁移的库上安全重复运行。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 先查看当前 CHECK 约束名（不同项目可能不同）
--    在 Supabase Dashboard SQL Editor 中运行以下语句查看：
--    SELECT conname, pg_get_constraintdef(oid)
--    FROM pg_constraint
--    WHERE conrelid = 'projects'::regclass AND contype = 'c';
--
--    常见约束名：projects_project_type_check
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- 2. 先删除旧 CHECK 约束（必须先删，否则 UPDATE 会被拦截）
-- ----------------------------------------------------------------------------
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_type_check;

-- ----------------------------------------------------------------------------
-- 3. 更新现有数据：旧值 -> 新值
-- ----------------------------------------------------------------------------
UPDATE projects SET project_type = 'one_click_basic'    WHERE project_type = 'basic';
UPDATE projects SET project_type = 'one_click_advanced' WHERE project_type = 'advanced';
UPDATE projects SET project_type = 'digital_human'      WHERE project_type = 'digital_human';
UPDATE projects SET project_type = 'viral_clone'        WHERE project_type = 'viral_clone';
UPDATE projects SET project_type = 'reverse_prompt'     WHERE project_type = 'reverse_prompt';

-- ----------------------------------------------------------------------------
-- 4. 创建新的 CHECK 约束
-- ----------------------------------------------------------------------------
ALTER TABLE projects ADD CONSTRAINT projects_project_type_check
  CHECK (project_type IN (
    'one_click_basic',
    'one_click_advanced',
    'digital_human',
    'viral_clone',
    'reverse_prompt'
  ));

-- ----------------------------------------------------------------------------
-- 4. 清理遗留列（可选但推荐）
--    mode 列：P0-3 已删除前端的 mode 字段，后端也不再使用
--    credits_used 列：P0-3 改为显式扣费后不再使用
-- ----------------------------------------------------------------------------
ALTER TABLE projects DROP COLUMN IF EXISTS mode;
ALTER TABLE projects DROP COLUMN IF EXISTS credits_used;
