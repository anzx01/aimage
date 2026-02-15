# ✅ Supabase 配置完成清单

## 当前状态

- ✅ Supabase 项目已创建: `aimage-production`
- ✅ 环境变量已配置: `frontend/.env.local`
- ✅ 前端服务器运行中: http://localhost:3000
- ⏳ 数据库迁移待执行
- ⏳ 认证配置待完成
- ⏳ 存储桶待创建

---

## 立即执行步骤

### 步骤 1: 执行数据库迁移 (5 分钟)

1. 打开浏览器访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new

2. 复制文件内容: `supabase/complete_migration.sql`

3. 粘贴到 SQL Editor 并点击 **Run**

4. 等待执行完成（应显示 "Success"）

### 步骤 2: 验证表创建 (1 分钟)

访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/editor

确认以下 12 个表已创建：
- profiles
- credit_transactions
- projects
- assets
- project_assets
- generation_tasks
- showcase_cases
- user_favorites
- digital_humans
- tiktok_accounts
- publish_tasks
- activity_logs

### 步骤 3: 配置认证 (2 分钟)

1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/providers

2. 找到 **Email** 提供商，确保：
   - ✅ Enable Email provider
   - ✅ Enable Email Signup
   - ❌ Confirm email（取消勾选，开发阶段）

3. 点击 **Save**

### 步骤 4: 创建存储桶 (3 分钟)

访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/storage/buckets

创建 4 个存储桶：

1. **avatars** (Public) - 用户头像
2. **assets** (Private) - 用户素材
3. **videos** (Public) - 生成的视频
4. **thumbnails** (Public) - 视频缩略图

### 步骤 5: 配置存储桶策略 (2 分钟)

1. 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new

2. 复制并执行以下 SQL:

\`\`\`sql
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
\`\`\`

---

## 测试应用 (5 分钟)

### 1. 测试注册
- 访问: http://localhost:3000/signup
- 填写信息并注册
- 应自动跳转到登录页

### 2. 测试登录
- 访问: http://localhost:3000/login
- 使用刚注册的账户登录
- 应跳转到 Dashboard

### 3. 验证数据
- 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/users
- 确认新用户已创建
- 访问: https://supabase.com/project/oogqdhxkznhbkehkfexe/editor/profiles
- 确认用户资料已创建，credits = 10

### 4. 测试功能
- Dashboard: http://localhost:3000/dashboard
- 案例库: http://localhost:3000/showcase
- 一键成片: http://localhost:3000/generate

---

## 快速链接

### Supabase Dashboard
- 项目首页: https://supabase.com/project/oogqdhxkznhbkehkfexe
- SQL Editor: https://supabase.com/project/oogqdhxkznhbkehkfexe/sql/new
- Table Editor: https://supabase.com/project/oogqdhxkznhbkehkfexe/editor
- Authentication: https://supabase.com/project/oogqdhxkznhbkehkfexe/auth/users
- Storage: https://supabase.com/project/oogqdhxkznhbkehkfexe/storage/buckets
- API Docs: https://supabase.com/project/oogqdhxkznhbkehkfexe/api

### 本地应用
- 前端: http://localhost:3000
- 后端: http://localhost:8000 (待启动)

---

## 故障排除

### 问题: 注册后没有创建 profile
**解决方案**: 检查触发器是否正确创建
\`\`\`sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
\`\`\`

### 问题: 登录后显示 "积分: undefined"
**解决方案**: 检查 profiles 表中是否有该用户记录
\`\`\`sql
SELECT * FROM profiles WHERE email = 'your@email.com';
\`\`\`

### 问题: 案例库显示为空
**解决方案**: 检查 showcase_cases 表是否有数据
\`\`\`sql
SELECT COUNT(*) FROM showcase_cases;
\`\`\`

---

## 完成后的下一步

1. ✅ 测试所有核心功能
2. 🔄 启动后端 FastAPI 服务
3. 🔄 集成 Trigger.dev 异步任务
4. 🔄 实现文件上传功能
5. 🔄 实现视频生成功能

---

**预计总时间**: 15-20 分钟
**当前进度**: 环境变量已配置，待执行数据库迁移
