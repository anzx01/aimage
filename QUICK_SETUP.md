# Supabase 数据库快速配置指南

## 步骤 1: 执行数据库迁移

1. 访问您的 Supabase 项目: https://supabase.com/project/oogqdhxkznhbkehkfexe

2. 点击左侧菜单 **SQL Editor**

3. 点击 **New Query**

4. 复制 `supabase/complete_migration.sql` 文件的全部内容并粘贴到编辑器

5. 点击 **Run** 按钮执行

6. 等待执行完成（应该显示 "Success. No rows returned"）

## 步骤 2: 验证表创建

1. 点击左侧菜单 **Table Editor**

2. 确认以下表已创建：
   - ✅ profiles
   - ✅ credit_transactions
   - ✅ projects
   - ✅ assets
   - ✅ project_assets
   - ✅ generation_tasks
   - ✅ showcase_cases
   - ✅ user_favorites
   - ✅ digital_humans
   - ✅ tiktok_accounts
   - ✅ publish_tasks
   - ✅ activity_logs

3. 点击 `showcase_cases` 表，确认有 5 条种子数据

## 步骤 3: 配置认证

1. 点击左侧菜单 **Authentication** → **Providers**

2. 找到 **Email** 提供商，确保已启用：
   - ✅ Enable Email provider
   - ✅ Enable Email Signup
   - ❌ Confirm email（开发阶段关闭）

3. 点击 **Save** 保存设置

## 步骤 4: 配置存储桶

1. 点击左侧菜单 **Storage**

2. 点击 **New bucket** 创建以下存储桶：

### 创建 avatars 存储桶
- **Name**: avatars
- **Public bucket**: ✅ 勾选
- 点击 **Create bucket**

### 创建 assets 存储桶
- **Name**: assets
- **Public bucket**: ❌ 不勾选
- 点击 **Create bucket**

### 创建 videos 存储桶
- **Name**: videos
- **Public bucket**: ✅ 勾选
- 点击 **Create bucket**

### 创建 thumbnails 存储桶
- **Name**: thumbnails
- **Public bucket**: ✅ 勾选
- 点击 **Create bucket**

## 步骤 5: 配置存储桶策略

1. 在 **SQL Editor** 中创建新查询

2. 复制并执行以下 SQL：

```sql
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

-- thumbnails 存储桶策略
CREATE POLICY "Public thumbnails are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. 点击 **Run** 执行

## 步骤 6: 测试应用

1. 确保前端开发服务器正在运行：
   ```bash
   cd frontend
   npm run dev
   ```

2. 访问 http://localhost:3000

3. 测试注册功能：
   - 访问 http://localhost:3000/signup
   - 填写信息并注册
   - 应该自动跳转到登录页

4. 测试登录功能：
   - 访问 http://localhost:3000/login
   - 使用刚注册的账户登录
   - 应该跳转到 Dashboard

5. 验证用户数据：
   - 在 Supabase Dashboard 的 **Authentication** → **Users** 中查看新用户
   - 在 **Table Editor** → **profiles** 中确认用户资料已创建
   - 确认 `credits` 字段为 10

6. 测试其他功能：
   - 访问 http://localhost:3000/showcase 查看案例库
   - 访问 http://localhost:3000/generate 测试一键成片

## 常见问题

### Q: 执行迁移时出现 "relation already exists" 错误
A: 这表示表已经存在。可以先删除所有表，然后重新执行迁移。

### Q: 注册后没有自动创建 profile
A: 检查 `handle_new_user()` 触发器是否正确创建。在 SQL Editor 中执行：
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Q: 登录后显示 "积分: undefined"
A: 检查 profiles 表中是否有该用户的记录，credits 字段是否有值。

### Q: 案例库显示为空
A: 检查 showcase_cases 表是否有种子数据。如果没有，重新执行 `20260215121200_seed_showcase_cases.sql`。

## 完成！

配置完成后，您的应用应该可以正常使用了。如果遇到问题，请检查：

1. 浏览器控制台是否有错误
2. Supabase Dashboard 的 **Logs** 中是否有错误信息
3. 环境变量是否正确配置

---

**项目地址**: https://supabase.com/project/oogqdhxkznhbkehkfexe
**前端地址**: http://localhost:3000
**后端地址**: http://localhost:8000 (待启动)
