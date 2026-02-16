-- 数据库性能优化 SQL
-- 为常用查询添加索引

-- ============================================
-- 用户表索引
-- ============================================

-- 邮箱索引（用于登录查询）
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 创建时间索引（用于排序）
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================
-- 项目表索引
-- ============================================

-- 用户ID索引（用于查询用户的所有项目）
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- 状态索引（用于筛选项目状态）
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 创建时间索引（用于排序）
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 复合索引：用户ID + 创建时间（优化用户项目列表查询）
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON projects(user_id, created_at DESC);

-- 复合索引：用户ID + 状态（优化按状态筛选）
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);

-- ============================================
-- 生成任务表索引
-- ============================================

-- 项目ID索引（用于查询项目的所有任务）
CREATE INDEX IF NOT EXISTS idx_generation_tasks_project_id ON generation_tasks(project_id);

-- 状态索引（用于筛选任务状态）
CREATE INDEX IF NOT EXISTS idx_generation_tasks_status ON generation_tasks(status);

-- 创建时间索引（用于排序）
CREATE INDEX IF NOT EXISTS idx_generation_tasks_created_at ON generation_tasks(created_at DESC);

-- 复合索引：项目ID + 创建时间
CREATE INDEX IF NOT EXISTS idx_generation_tasks_project_created ON generation_tasks(project_id, created_at DESC);

-- ============================================
-- 素材表索引
-- ============================================

-- 用户ID索引
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);

-- 类型索引（用于按类型筛选）
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- 创建时间索引
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);

-- 复合索引：用户ID + 类型
CREATE INDEX IF NOT EXISTS idx_assets_user_type ON assets(user_id, type);

-- ============================================
-- 项目素材关联表索引
-- ============================================

-- 项目ID索引
CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);

-- 素材ID索引
CREATE INDEX IF NOT EXISTS idx_project_assets_asset_id ON project_assets(asset_id);

-- 复合索引：项目ID + 素材ID（防止重复关联）
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_assets_unique ON project_assets(project_id, asset_id);

-- ============================================
-- 案例库表索引
-- ============================================

-- 分类索引（用于按分类筛选）
CREATE INDEX IF NOT EXISTS idx_showcase_cases_category ON showcase_cases(category);

-- 是否精选索引
CREATE INDEX IF NOT EXISTS idx_showcase_cases_featured ON showcase_cases(is_featured);

-- 创建时间索引
CREATE INDEX IF NOT EXISTS idx_showcase_cases_created_at ON showcase_cases(created_at DESC);

-- 复合索引：分类 + 创建时间
CREATE INDEX IF NOT EXISTS idx_showcase_cases_category_created ON showcase_cases(category, created_at DESC);

-- ============================================
-- 积分交易记录表索引
-- ============================================

-- 用户ID索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

-- 类型索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

-- 创建时间索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- 复合索引：用户ID + 创建时间
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON credit_transactions(user_id, created_at DESC);

-- ============================================
-- 查询性能分析
-- ============================================

-- 启用查询统计
ALTER DATABASE postgres SET track_activities = on;
ALTER DATABASE postgres SET track_counts = on;

-- 查看慢查询（执行时间超过1秒的查询）
-- SELECT query, calls, total_time, mean_time
-- FROM pg_stat_statements
-- WHERE mean_time > 1000
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- ============================================
-- 定期维护任务
-- ============================================

-- 更新表统计信息（建议每天执行）
-- ANALYZE users;
-- ANALYZE projects;
-- ANALYZE generation_tasks;
-- ANALYZE assets;
-- ANALYZE project_assets;
-- ANALYZE showcase_cases;
-- ANALYZE credit_transactions;

-- 清理无用数据（建议每周执行）
-- VACUUM ANALYZE;

-- ============================================
-- 性能监控查询
-- ============================================

-- 查看表大小
-- SELECT
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看索引使用情况
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- 查看未使用的索引
-- SELECT
--   schemaname,
--   tablename,
--   indexname
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
--   AND schemaname = 'public';
