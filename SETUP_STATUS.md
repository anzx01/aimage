# ✅ AIMAGE Supabase 配置状态

## 已完成 ✅

### 1. 数据库表 (12/12)
所有表已成功创建：
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

### 2. 存储桶 (4/4)
所有存储桶已创建：
- ✅ avatars (Public)
- ✅ assets (Private)
- ✅ videos (Public)
- ✅ thumbnails (Public)

### 3. 环境变量
- ✅ frontend/.env.local 已配置
- ✅ Supabase URL 和 Anon Key 已设置

### 4. 前端页面
- ✅ 登录页面: /login
- ✅ 注册页面: /signup
- ✅ 工作台: /dashboard
- ✅ 案例库: /showcase
- ✅ 一键成片: /generate

---

## 待完成 ⏳

### 1. 配置认证 (30秒)

**步骤：**
1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers
2. 找到 **Email** 提供商
3. 确保以下设置：
   - ✅ **Enable Email provider** (勾选)
   - ✅ **Enable Email Signup** (勾选)
   - ❌ **Confirm email** (取消勾选 - 开发阶段)
4. 点击 **Save**

### 2. 配置存储桶策略 (1分钟)

**步骤：**
1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
2. 复制以下 SQL 并执行：

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

### 3. 插入案例库种子数据 (1分钟)

**步骤：**
1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
2. 复制以下 SQL 并执行：

```sql
INSERT INTO showcase_cases (title, description, category, video_url, thumbnail_url, duration, views, likes) VALUES
('美食探店 - 火锅篇', '展示成都火锅店的热闹氛围和美味佳肴', 'food', 'https://example.com/videos/hotpot.mp4', 'https://example.com/thumbnails/hotpot.jpg', 30, 15234, 892),
('旅行 Vlog - 云南大理', '记录大理古城的美丽风光和人文风情', 'travel', 'https://example.com/videos/dali.mp4', 'https://example.com/thumbnails/dali.jpg', 60, 28456, 1523),
('产品开箱 - 最新款手机', '详细展示新手机的外观设计和核心功能', 'product', 'https://example.com/videos/phone.mp4', 'https://example.com/thumbnails/phone.jpg', 45, 45678, 2341),
('知识分享 - AI 入门指南', '用简单易懂的方式讲解 AI 基础概念', 'education', 'https://example.com/videos/ai-guide.mp4', 'https://example.com/thumbnails/ai-guide.jpg', 90, 67890, 3456),
('生活记录 - 我的一天', '记录普通人的日常生活点滴', 'lifestyle', 'https://example.com/videos/daily.mp4', 'https://example.com/thumbnails/daily.jpg', 30, 12345, 678);
```

---

## 测试应用 (5分钟)

### 1. 测试注册
1. 访问: http://localhost:3000/signup
2. 填写信息：
   - 姓名: 测试用户
   - 邮箱: test@example.com
   - 密码: test123456
3. 点击 **免费注册**
4. 应该跳转到登录页

### 2. 测试登录
1. 访问: http://localhost:3000/login
2. 使用刚注册的账户登录
3. 应该跳转到 Dashboard

### 3. 验证数据

#### 检查用户
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/users
- 应该看到新注册的用户

#### 检查 Profile
访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/editor/profiles
- 应该有一条记录
- `credits` 字段应该是 10
- `subscription_tier` 应该是 'free'

### 4. 测试功能

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

## 快速链接

### Supabase Dashboard
- 项目首页: https://supabase.com/project/oogqdhxkznhbkehkfexe
- SQL Editor: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
- Table Editor: https://supabase.com/project/oogqdhxkznhbkehkfexe/editor
- Authentication: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/users
- Storage: https://supabase.com/project/oogqdhxkznhbkehkfexe/storage/buckets

### 本地应用
- 前端: http://localhost:3000
- 后端: http://localhost:8000 (待启动)

---

## 故障排除

### 问题: 注册后没有创建 profile
**解决方案**: 检查触发器是否正确创建
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### 问题: 登录后显示 "积分: undefined"
**解决方案**: 检查 profiles 表中是否有该用户记录
```sql
SELECT * FROM profiles WHERE email = 'your@email.com';
```

如果没有数据，手动插入:
```sql
INSERT INTO profiles (id, email, full_name, credits)
SELECT id, email, raw_user_meta_data->>'full_name', 10
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

### 问题: 案例库显示为空
**解决方案**: 检查 showcase_cases 表是否有数据
```sql
SELECT COUNT(*) FROM showcase_cases;
```

如果为 0，执行上面的种子数据 SQL。

---

## 总结

✅ **已完成**: 数据库表、存储桶、前端页面
⏳ **待完成**: 认证配置、存储桶策略、种子数据（3个步骤，约3分钟）

完成这3个步骤后，您的 AIMAGE 平台就可以正常使用了！🎉
