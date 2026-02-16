# 快速开始测试

## 步骤 1：检查环境配置

检查 `.env.local` 文件是否存在并包含以下变量：

```bash
cd frontend
cat .env.local
```

应该看到：
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

如果没有，请创建该文件并添加你的 Supabase 配置。

## 步骤 2：安装依赖

```bash
cd frontend
npm install
```

## 步骤 3：启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动。

## 步骤 4：配置 Supabase Storage

在开始测试文件上传功能之前，必须先配置 Supabase Storage：

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单的 **Storage**
4. 点击 **New Bucket**
5. 配置如下：
   - Name: `assets`
   - Public: ✅ (勾选)
   - File size limit: `100 MB`
   - Allowed MIME types: `image/*, video/*`

6. 创建 RLS 策略（在 SQL Editor 中执行）：

```sql
-- 允许认证用户上传文件
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets'
);

-- 允许所有人读取文件
CREATE POLICY "Allow public to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

-- 允许用户删除自己的文件
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assets');
```

## 步骤 5：开始测试

### 5.1 测试用户注册和登录

1. 访问 http://localhost:3000/signup
2. 注册一个新账户：
   - 邮箱：test@example.com
   - 密码：test123456
   - 姓名：测试用户

3. 检查是否自动登录并跳转到 Dashboard

### 5.2 测试基础模式生成

1. 在 Dashboard 点击"一键成片"
2. 填写表单：
   - 标题：测试视频
   - 描述：这是一个测试视频
   - 风格：现代简约
   - 时长：15秒

3. 点击"开始生成"
4. 检查是否跳转到项目详情页

### 5.3 测试高级模式和文件上传

1. 访问 http://localhost:3000/generate
2. 切换到"高级模式"
3. 填写标题
4. 上传测试文件：
   - 准备一张图片（JPG/PNG，< 100MB）
   - 拖拽到上传区域或点击上传
   - 观察上传进度

5. 点击"开始生成"

### 5.4 测试项目管理

1. 访问 http://localhost:3000/projects
2. 查看项目列表
3. 点击项目卡片查看详情
4. 测试删除功能

### 5.5 测试用户设置

1. 访问 http://localhost:3000/settings
2. 修改姓名
3. 修改密码
4. 检查是否保存成功

### 5.6 测试积分充值

1. 访问 http://localhost:3000/credits
2. 查看积分套餐
3. 点击"立即购买"（会显示"即将推出"提示）

## 步骤 6：检查数据库

登录 Supabase Dashboard，检查以下表：

1. **users** - 查看用户记录
2. **projects** - 查看项目记录
3. **generation_tasks** - 查看生成任务
4. **assets** - 查看上传的文件
5. **project_assets** - 查看项目和文件的关联
6. **credit_transactions** - 查看积分交易记录

## 常见问题

### Q1: 启动失败，提示端口被占用
```bash
# 杀死占用 3000 端口的进程
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Q2: 文件上传失败 403 Forbidden
- 检查 Supabase Storage bucket 是否创建
- 检查 RLS 策略是否配置
- 检查用户是否已登录

### Q3: 页面显示空白
- 检查浏览器控制台是否有错误
- 检查 Supabase 配置是否正确
- 检查网络连接

### Q4: 数据库查询失败
- 检查 Supabase 项目是否暂停
- 检查 API Key 是否正确
- 检查表是否存在

## 测试检查清单

使用以下清单跟踪测试进度：

- [ ] 环境配置完成
- [ ] 开发服务器启动成功
- [ ] Supabase Storage 配置完成
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] Dashboard 显示正常
- [ ] 基础模式生成功能正常
- [ ] 高级模式生成功能正常
- [ ] 文件上传功能正常
- [ ] 项目列表显示正常
- [ ] 项目详情显示正常
- [ ] 用户设置功能正常
- [ ] 积分充值页面显示正常
- [ ] 数据库记录正确

## 下一步

测试完成后：
1. 记录发现的问题
2. 查看 `TESTING_GUIDE.md` 了解详细测试步骤
3. 继续开发剩余功能（数字人管理、支付集成等）

---

**需要帮助？** 查看 `TESTING_GUIDE.md` 获取完整的测试指南。
