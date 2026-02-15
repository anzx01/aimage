-- ============================================
-- AIMAGE 数据库清理和重建脚本
-- ============================================
--
-- 警告：此脚本会删除所有现有数据！
-- 仅在开发环境使用
--
-- 使用方法:
-- 1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
-- 2. 复制此文件全部内容
-- 3. 粘贴到 SQL Editor
-- 4. 点击 Run 按钮
--
-- ============================================

-- 步骤 1: 删除所有现有表（按依赖顺序）
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS publish_tasks CASCADE;
DROP TABLE IF EXISTS tiktok_accounts CASCADE;
DROP TABLE IF EXISTS digital_humans CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS showcase_cases CASCADE;
DROP TABLE IF EXISTS generation_tasks CASCADE;
DROP TABLE IF EXISTS project_assets CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 步骤 2: 删除所有函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS deduct_credits_on_task_creation() CASCADE;
DROP FUNCTION IF EXISTS update_favorite_count() CASCADE;

-- 步骤 3: 删除存储桶策略
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Public thumbnails are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own thumbnails" ON storage.objects;
