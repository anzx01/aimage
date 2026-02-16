# Supabase Storage 配置指南

本文档说明如何配置 Supabase Storage 以支持文件上传功能。

## 1. 创建 Storage Bucket

在 Supabase Dashboard 中：

1. 进入 **Storage** 页面
2. 点击 **New Bucket**
3. 配置如下：

```
Bucket Name: assets
Public: true (允许公开访问)
File size limit: 100 MB
Allowed MIME types: image/*, video/*
```

## 2. 配置访问策略 (RLS Policies)

为 `assets` bucket 创建以下策略：

### 策略 1: 允许认证用户上传文件

```sql
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 策略 2: 允许所有人读取文件

```sql
CREATE POLICY "Allow public to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');
```

### 策略 3: 允许用户删除自己的文件

```sql
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. 文件路径结构

上传的文件将按以下结构存储：

```
assets/
  └── uploads/
      ├── {timestamp}-{random}.jpg
      ├── {timestamp}-{random}.png
      └── {timestamp}-{random}.mp4
```

## 4. 环境变量

确保 `.env.local` 中配置了以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. 测试上传

1. 启动开发服务器：`npm run dev`
2. 登录应用
3. 进入"一键成片"页面
4. 切换到"高级模式"
5. 尝试上传图片或视频文件
6. 检查 Supabase Storage 中是否成功创建文件

## 6. 常见问题

### 上传失败：403 Forbidden
- 检查 RLS 策略是否正确配置
- 确认用户已登录
- 检查 bucket 是否设置为 public

### 文件无法访问
- 确认 bucket 的 public 设置为 true
- 检查读取策略是否正确

### 文件大小限制
- 默认限制为 100MB
- 可在 bucket 设置中调整

## 7. 安全建议

1. **文件类型验证**：前端和后端都应验证文件类型
2. **文件大小限制**：设置合理的文件大小上限
3. **病毒扫描**：生产环境建议集成病毒扫描服务
4. **CDN 加速**：考虑使用 CDN 加速文件访问
5. **定期清理**：删除未使用的文件以节省存储空间

## 8. 监控和维护

- 定期检查存储使用量
- 监控上传失败率
- 清理孤立文件（未关联到任何项目的文件）

---

**配置完成后**，文件上传功能即可正常使用。
