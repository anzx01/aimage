# Supabase 项目设置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 使用您的 Google 账户 (liuzx3000@gmail.com) 登录
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - **Project Name**: aimage-production
   - **Database Password**: 设置一个强密码（请记住此密码）
   - **Region**: 选择 Northeast Asia (Tokyo) - 最接近中国
   - **Pricing Plan**: 选择 Free（免费版）

5. 等待项目创建完成（约 2-3 分钟）

## 步骤 2: 获取项目凭证

项目创建完成后：

1. 进入项目 Dashboard
2. 点击左侧菜单的 "Settings" → "API"
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 步骤 3: 配置环境变量

将获取的凭证填入 `frontend/.env.local` 文件：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 步骤 4: 运行数据库迁移

在 Supabase Dashboard 中：

1. 点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 依次执行 `supabase/migrations/` 目录下的所有 SQL 文件（按文件名顺序）：

### 执行顺序：

```sql
-- 1. 创建 profiles 表
-- 复制 supabase/migrations/20260215120000_create_profiles_table.sql 的内容并执行

-- 2. 创建 credit_transactions 表
-- 复制 supabase/migrations/20260215120100_create_credit_transactions_table.sql 的内容并执行

-- 3. 创建 projects 表
-- 复制 supabase/migrations/20260215120200_create_projects_table.sql 的内容并执行

-- 4. 创建 assets 表
-- 复制 supabase/migrations/20260215120300_create_assets_table.sql 的内容并执行

-- 5. 创建 project_assets 表
-- 复制 supabase/migrations/20260215120400_create_project_assets_table.sql 的内容并执行

-- 6. 创建 generation_tasks 表
-- 复制 supabase/migrations/20260215120500_create_generation_tasks_table.sql 的内容并执行

-- 7. 创建 showcase_cases 表
-- 复制 supabase/migrations/20260215120600_create_showcase_cases_table.sql 的内容并执行

-- 8. 创建 user_favorites 表
-- 复制 supabase/migrations/20260215120700_create_user_favorites_table.sql 的内容并执行

-- 9. 创建 digital_humans 表
-- 复制 supabase/migrations/20260215120800_create_digital_humans_table.sql 的内容并执行

-- 10. 创建 tiktok_accounts 表
-- 复制 supabase/migrations/20260215120900_create_tiktok_accounts_table.sql 的内容并执行

-- 11. 创建 publish_tasks 表
-- 复制 supabase/migrations/20260215121000_create_publish_tasks_table.sql 的内容并执行

-- 12. 创建 activity_logs 表
-- 复制 supabase/migrations/20260215121100_create_activity_logs_table.sql 的内容并执行

-- 13. 插入种子数据
-- 复制 supabase/migrations/20260215121200_seed_showcase_cases.sql 的内容并执行
```

## 步骤 5: 配置认证

在 Supabase Dashboard 中：

1. 点击左侧菜单的 "Authentication" → "Providers"
2. 启用 "Email" 提供商
3. 配置设置：
   - ✅ Enable Email provider
   - ✅ Enable Email Signup
   - ❌ Confirm email（开发阶段关闭，生产环境建议开启）

### 可选：配置 Google OAuth

1. 在 "Authentication" → "Providers" 中找到 "Google"
2. 点击 "Enable"
3. 填入 Google OAuth 凭证（需要先在 Google Cloud Console 创建）

## 步骤 6: 配置存储桶

在 Supabase Dashboard 中：

1. 点击左侧菜单的 "Storage"
2. 创建以下存储桶：
   - **avatars** (Public) - 用户头像
   - **assets** (Private) - 用户上传的素材
   - **videos** (Public) - 生成的视频
   - **thumbnails** (Public) - 视频缩略图

3. 为每个存储桶配置策略：

```sql
-- avatars 存储桶策略
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- assets 存储桶策略
CREATE POLICY "Users can view their own assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- videos 存储桶策略
CREATE POLICY "Public videos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- thumbnails 存储桶策略
CREATE POLICY "Public thumbnails are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 步骤 7: 验证设置

1. 重启前端开发服务器：
   ```bash
   cd frontend
   npm run dev
   ```

2. 访问 http://localhost:3000/signup
3. 尝试注册一个新账户
4. 检查 Supabase Dashboard 的 "Authentication" → "Users" 是否显示新用户
5. 检查 "Table Editor" → "profiles" 表是否自动创建了用户资料

## 故障排除

### 问题 1: 注册失败 "Invalid API key"
- 检查 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
- 确保重启了开发服务器

### 问题 2: 数据库表不存在
- 确保按顺序执行了所有迁移文件
- 在 SQL Editor 中检查是否有错误信息

### 问题 3: RLS 策略阻止访问
- 在开发阶段，可以临时禁用 RLS：
  ```sql
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  ```
- 生产环境务必启用 RLS 保护数据安全

## 下一步

设置完成后，您可以：
1. 访问 http://localhost:3000 查看 Landing Page
2. 注册新账户并登录
3. 访问 Dashboard 查看用户信息
4. 开始使用一键成片功能

## 有用的链接

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase 文档](https://supabase.com/docs)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage 指南](https://supabase.com/docs/guides/storage)
