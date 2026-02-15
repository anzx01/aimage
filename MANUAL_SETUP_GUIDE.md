# 🚀 Supabase 手动配置指南（5 分钟完成）

## 步骤 1: 执行数据库迁移 (2 分钟)

### 1.1 打开 SQL Editor
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new

### 1.2 复制并执行完整迁移 SQL

**方法 A: 一次性执行（推荐）**

1. 打开文件: `supabase/complete_migration.sql`
2. 全选复制 (Ctrl+A, Ctrl+C)
3. 粘贴到 SQL Editor
4. 点击右下角 **Run** 按钮
5. 等待执行完成（约 10-15 秒）

**方法 B: 如果方法 A 失败，分批执行**

依次执行以下文件（按顺序）:
1. `supabase/migrations/20260215120000_create_profiles_table.sql`
2. `supabase/migrations/20260215120100_create_credit_transactions_table.sql`
3. `supabase/migrations/20260215120200_create_projects_table.sql`
4. `supabase/migrations/20260215120300_create_assets_table.sql`
5. `supabase/migrations/20260215120400_create_project_assets_table.sql`
6. `supabase/migrations/20260215120500_create_generation_tasks_table.sql`
7. `supabase/migrations/20260215120600_create_showcase_cases_table.sql`
8. `supabase/migrations/20260215120700_create_user_favorites_table.sql`
9. `supabase/migrations/20260215120800_create_digital_humans_table.sql`
10. `supabase/migrations/20260215120900_create_tiktok_accounts_table.sql`
11. `supabase/migrations/20260215121000_create_publish_tasks_table.sql`
12. `supabase/migrations/20260215121100_create_activity_logs_table.sql`
13. `supabase/migrations/20260215121200_seed_showcase_cases.sql`

### 1.3 验证表创建

访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/editor

确认以下表已创建:
- ✅ profiles
- ✅ credit_transactions
- ✅ projects
- ✅ assets
- ✅ project_assets
- ✅ generation_tasks
- ✅ showcase_cases (应有 5 条数据)
- ✅ user_favorites
- ✅ digital_humans
- ✅ tiktok_accounts
- ✅ publish_tasks
- ✅ activity_logs

---

## 步骤 2: 配置认证 (30 秒)

### 2.1 打开认证设置
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers

### 2.2 配置 Email 提供商

1. 找到 **Email** 提供商
2. 确保以下设置:
   - ✅ **Enable Email provider** (勾选)
   - ✅ **Enable Email Signup** (勾选)
   - ❌ **Confirm email** (取消勾选 - 开发阶段)
3. 点击 **Save** 保存

---

## 步骤 3: 创建存储桶 (1 分钟)

### 3.1 打开存储设置
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/storage/buckets

### 3.2 创建 4 个存储桶

#### 存储桶 1: avatars
- 点击 **New bucket**
- Name: `avatars`
- ✅ Public bucket (勾选)
- 点击 **Create bucket**

#### 存储桶 2: assets
- 点击 **New bucket**
- Name: `assets`
- ❌ Public bucket (不勾选)
- 点击 **Create bucket**

#### 存储桶 3: videos
- 点击 **New bucket**
- Name: `videos`
- ✅ Public bucket (勾选)
- 点击 **Create bucket**

#### 存储桶 4: thumbnails
- 点击 **New bucket**
- Name: `thumbnails`
- ✅ Public bucket (勾选)
- 点击 **Create bucket**

---

## 步骤 4: 配置存储桶策略 (1 分钟)

### 4.1 打开 SQL Editor
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new

### 4.2 复制并执行以下 SQL

```sql
-- ============================================
-- 存储桶策略配置
-- ============================================

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
```

点击 **Run** 执行

---

## 步骤 5: 测试应用 (2 分钟)

### 5.1 测试注册
1. 访问: http://localhost:3000/signup
2. 填写信息:
   - 姓名: 测试用户
   - 邮箱: test@example.com
   - 密码: test123456
3. 点击 **免费注册**
4. 应该跳转到登录页

### 5.2 测试登录
1. 访问: http://localhost:3000/login
2. 使用刚注册的账户登录
3. 应该跳转到 Dashboard

### 5.3 验证数据

#### 检查用户
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/users
- 应该看到新注册的用户

#### 检查 Profile
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/editor/profiles
- 应该有一条记录
- `credits` 字段应该是 10
- `subscription_tier` 应该是 'free'

### 5.4 测试功能

#### Dashboard
访问: http://localhost:3000/dashboard
- 应该显示用户信息
- 积分显示为 10
- 可以看到快速操作卡片

#### 案例库
访问: http://localhost:3000/showcase
- 应该显示 5 个案例
- 可以按分类筛选
- 鼠标悬停显示播放按钮

#### 一键成片
访问: http://localhost:3000/generate
- 填写表单
- 选择风格和时长
- 点击 **开始生成**
- 应该创建项目并扣除积分

---

## ✅ 配置完成检查清单

- [ ] 数据库迁移已执行（12 个表 + 种子数据）
- [ ] Email 认证已启用
- [ ] 4 个存储桶已创建
- [ ] 存储桶策略已配置
- [ ] 用户注册测试通过
- [ ] 用户登录测试通过
- [ ] Dashboard 显示正常
- [ ] 案例库显示正常
- [ ] 一键成片功能正常

---

## 🐛 常见问题

### Q: 执行迁移时出现 "already exists" 错误
**A**: 这是正常的，表示表已经存在。继续执行下一个文件即可。

### Q: 注册后没有自动创建 profile
**A**: 检查触发器是否创建成功。在 SQL Editor 执行:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Q: 登录后显示 "积分: undefined"
**A**: 检查 profiles 表:
```sql
SELECT * FROM profiles;
```
如果没有数据，手动插入:
```sql
INSERT INTO profiles (id, email, full_name, credits)
SELECT id, email, raw_user_meta_data->>'full_name', 10
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

### Q: 案例库显示为空
**A**: 检查 showcase_cases 表:
```sql
SELECT COUNT(*) FROM showcase_cases;
```
如果为 0，重新执行种子数据文件。

---

## 📞 需要帮助？

如果遇到问题:
1. 检查浏览器控制台 (F12) 的错误信息
2. 检查 Supabase Dashboard 的 Logs
3. 确认环境变量配置正确

---

**预计总时间**: 5-10 分钟
**难度**: ⭐⭐☆☆☆ (简单)

配置完成后，您的 AIMAGE 平台就可以正常使用了！🎉
