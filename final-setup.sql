-- ============================================
-- AIMAGE 最后配置步骤 - SQL 脚本
-- ============================================
--
-- 使用方法:
-- 1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
-- 2. 复制此文件全部内容
-- 3. 粘贴到 SQL Editor
-- 4. 点击 Run 按钮
--
-- ============================================

-- ============================================
-- 步骤 2: 存储桶策略配置
-- ============================================

-- 先删除已存在的策略（如果有）
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

-- avatars 存储桶策略
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- assets 存储桶策略
CREATE POLICY "Users can view their own assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- videos 存储桶策略
CREATE POLICY "Public videos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- thumbnails 存储桶策略
CREATE POLICY "Public thumbnails are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 步骤 3: 案例库种子数据
-- ============================================

INSERT INTO showcase_cases (title, description, category, video_url, thumbnail_url, duration, views, likes) VALUES
('美食探店 - 火锅篇', '展示成都火锅店的热闹氛围和美味佳肴', 'food', 'https://example.com/videos/hotpot.mp4', 'https://example.com/thumbnails/hotpot.jpg', 30, 15234, 892),
('旅行 Vlog - 云南大理', '记录大理古城的美丽风光和人文风情', 'travel', 'https://example.com/videos/dali.mp4', 'https://example.com/thumbnails/dali.jpg', 60, 28456, 1523),
('产品开箱 - 最新款手机', '详细展示新手机的外观设计和核心功能', 'product', 'https://example.com/videos/phone.mp4', 'https://example.com/thumbnails/phone.jpg', 45, 45678, 2341),
('知识分享 - AI 入门指南', '用简单易懂的方式讲解 AI 基础概念', 'education', 'https://example.com/videos/ai-guide.mp4', 'https://example.com/thumbnails/ai-guide.jpg', 90, 67890, 3456),
('生活记录 - 我的一天', '记录普通人的日常生活点滴', 'lifestyle', 'https://example.com/videos/daily.mp4', 'https://example.com/thumbnails/daily.jpg', 30, 12345, 678)
ON CONFLICT DO NOTHING;

-- ============================================
-- 验证配置
-- ============================================

-- 检查案例库数据
SELECT COUNT(*) as showcase_cases_count FROM showcase_cases;

-- 检查存储桶策略
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
