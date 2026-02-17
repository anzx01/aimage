-- ============================================
-- Supabase Storage RLS 策略配置
-- ============================================
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 创建 assets bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;

-- 3. 创建新的 Storage RLS 策略

-- 允许认证用户上传文件到 assets bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- 允许公开读取 assets bucket 中的文件
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

-- 允许用户删除自己上传的文件
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允许用户更新自己上传的文件
CREATE POLICY "Allow users to update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. 验证策略
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
