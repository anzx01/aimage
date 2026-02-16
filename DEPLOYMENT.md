# AIMAGE 部署指南

本文档提供了 AIMAGE 项目的完整部署指南。

## 📋 前置要求

### 必需
- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本
- Supabase 账号
- Vercel 账号（推荐）或其他 Next.js 托管平台

### 可选
- 自定义域名
- CDN 服务

---

## 🗄️ 数据库设置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 记录项目 URL 和 anon key

### 2. 执行数据库迁移

在 Supabase SQL Editor 中依次执行以下文件：

```sql
-- 1. 完整数据库结构
supabase/complete_migration.sql

-- 2. 示例数据（可选）
supabase/migrations/20260215121200_seed_showcase_cases.sql

-- 3. 头像支持
supabase/migrations/20260216000000_add_avatar_support.sql
```

### 3. 配置 Storage

#### 创建 Buckets

在 Supabase Storage 中创建以下 buckets：

1. **assets** - 用户上传的素材
   - Public: No
   - File size limit: 100MB
   - Allowed MIME types: image/*, video/*

2. **avatars** - 用户头像
   - Public: Yes
   - File size limit: 2MB
   - Allowed MIME types: image/*

#### 设置 CORS

在 Supabase Storage Settings 中添加：

```json
{
  "allowedOrigins": ["*"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAgeSeconds": 3600
}
```

---

## 🚀 Vercel 部署

### 方法一：通过 Vercel Dashboard

1. **连接 GitHub**
   - 登录 [Vercel](https://vercel.com/)
   - 点击 "New Project"
   - 导入 GitHub 仓库

2. **配置项目**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **环境变量**
   
   在 Vercel 项目设置中添加：
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd frontend
vercel

# 生产环境部署
vercel --prod
```

---

## 🌐 域名配置

### 1. 添加自定义域名

在 Vercel 项目设置中：
1. 进入 "Domains"
2. 添加域名
3. 按照提示配置 DNS

### 2. DNS 配置示例

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3. SSL 证书

Vercel 会自动配置 SSL 证书，无需手动操作。

---

## 🔧 环境变量

### 开发环境

创建 `frontend/.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 生产环境

在 Vercel Dashboard 中配置相同的环境变量。

---

## 📊 监控和日志

### Vercel Analytics

1. 在项目设置中启用 Analytics
2. 查看实时访问数据
3. 监控性能指标

### Supabase Logs

1. 访问 Supabase Dashboard
2. 查看 Database Logs
3. 监控 API 请求

---

## 🔄 持续部署

### 自动部署

Vercel 会自动部署：
- `main` 分支 → 生产环境
- 其他分支 → 预览环境

### 手动部署

```bash
# 触发重新部署
vercel --prod

# 回滚到上一个版本
vercel rollback
```

---

## ✅ 部署检查清单

### 部署前

- [ ] 所有环境变量已配置
- [ ] 数据库迁移已执行
- [ ] Storage buckets 已创建
- [ ] 本地构建成功 (`npm run build`)
- [ ] 所有测试通过

### 部署后

- [ ] 网站可以访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 文件上传功能正常
- [ ] 数据库连接正常
- [ ] 图片加载正常
- [ ] 移动端显示正常

---

## 🐛 常见问题

### 1. 构建失败

**问题**: TypeScript 类型错误

**解决**:
```bash
cd frontend
npm run build
# 查看错误信息并修复
```

### 2. 环境变量未生效

**问题**: Supabase 连接失败

**解决**:
- 检查环境变量名称是否正确
- 确保以 `NEXT_PUBLIC_` 开头
- 重新部署项目

### 3. 图片加载失败

**问题**: 外部图片无法显示

**解决**:
在 `next.config.ts` 中添加域名：
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-domain.com',
    },
  ],
}
```

### 4. Storage 上传失败

**问题**: 文件上传返回 403

**解决**:
- 检查 Storage bucket 权限
- 确认 RLS 策略正确
- 验证用户认证状态

---

## 📈 性能优化

### 1. 图片优化

- 使用 Next.js Image 组件
- 启用懒加载
- 配置图片 CDN

### 2. 代码分割

- 使用动态导入
- 按路由分割代码
- 优化 bundle 大小

### 3. 缓存策略

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

---

## 🔒 安全建议

### 1. 环境变量

- 不要提交 `.env.local` 到 Git
- 使用 Vercel 环境变量管理
- 定期轮换密钥

### 2. API 安全

- 启用 Supabase RLS
- 验证用户输入
- 限制 API 请求频率

### 3. HTTPS

- 强制使用 HTTPS
- 配置 HSTS
- 使用安全的 Cookie

---

## 📞 支持

如有问题，请：
1. 查看 [文档](./README.md)
2. 提交 [Issue](https://github.com/yourusername/aimage/issues)
3. 联系技术支持

---

**最后更新**: 2026-02-16
**版本**: 1.0.0
