-- ============================================================================
-- assets Storage bucket 及其 RLS 策略
-- 日期：2026-07-24
--
-- 说明：此前 assets bucket 的策略散落在 database/storage_policies.sql（旧 schema
--   目录）中，从未纳入正式迁移。这里将其收敛为标准迁移，保证全新库可一键建好。
--   本迁移幂等。
-- ============================================================================

-- 创建 assets bucket（公开可读，便于生成视频/分享链接访问）
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 清理旧策略（幂等）
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;

-- 认证用户可上传到 assets bucket
CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'assets');

-- 公开读取
CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'assets');

-- 用户仅能删除自己文件夹（路径首段为 user_id）下的文件
CREATE POLICY "Allow users to delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 用户仅能更新自己文件夹下的文件
CREATE POLICY "Allow users to update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
