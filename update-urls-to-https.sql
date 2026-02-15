-- ============================================
-- 更新案例库 URL 为 HTTPS
-- ============================================
--
-- 使用方法:
-- 1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
-- 2. 复制此文件全部内容
-- 3. 粘贴到 SQL Editor
-- 4. 点击 Run 按钮
--
-- ============================================

-- 更新所有 http:// URL 为 https://
UPDATE showcase_cases
SET
  video_url = REPLACE(video_url, 'http://', 'https://'),
  thumbnail_url = REPLACE(thumbnail_url, 'http://', 'https://')
WHERE
  video_url LIKE 'http://%'
  OR thumbnail_url LIKE 'http://%';

-- 验证更新结果
SELECT
  id,
  title,
  video_url,
  thumbnail_url
FROM showcase_cases;
