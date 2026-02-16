# AIMAGE 部署指南

## Vercel 部署

### 前置条件

1. GitHub 账号
2. Vercel 账号
3. Supabase 项目已配置

### 部署步骤

#### 1. 准备代码

确保所有代码已提交到 GitHub：

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 选择 `aimage` 项目

#### 3. 配置项目

**Framework Preset**: Next.js
**Root Directory**: `frontend`
**Build Command**: `pnpm build`
**Output Directory**: `.next`

#### 4. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

获取这些值：
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 Settings > API
4. 复制 Project URL 和 anon public key

#### 5. 部署

点击 "Deploy" 按钮，Vercel 将自动：
- 安装依赖
- 构建项目
- 部署到全球 CDN

#### 6. 配置自定义域名（可选）

1. 在 Vercel 项目设置中选择 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 环境变量说明

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_APP_URL` | 应用 URL | Vercel 自动生成 |

## 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 项目创建功能正常
- [ ] 文件上传功能正常
- [ ] 数据库连接正常
- [ ] 所有页面路由正常

## 常见问题

### 1. 构建失败

**问题**: 构建时出现依赖错误

**解决方案**:
```bash
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### 2. 环境变量未生效

**问题**: 应用无法连接到 Supabase

**解决方案**:
1. 检查环境变量是否正确配置
2. 确保变量名以 `NEXT_PUBLIC_` 开头
3. 重新部署项目

### 3. 文件上传失败

**问题**: 上传文件时出现 CORS 错误

**解决方案**:
1. 在 Supabase Storage 设置中配置 CORS
2. 添加你的 Vercel 域名到允许列表

### 4. 数据库连接超时

**问题**: 页面加载缓慢或超时

**解决方案**:
1. 检查 Supabase 项目状态
2. 优化数据库查询
3. 添加适当的索引

## 性能优化

### 1. 启用 Edge Functions

在 `next.config.ts` 中配置：

```typescript
export const runtime = 'edge';
```

### 2. 图片优化

使用 Next.js Image 组件：

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  width={800}
  height={600}
  alt="Description"
/>
```

### 3. 代码分割

使用动态导入：

```tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'));
```

## 监控和日志

### Vercel Analytics

1. 在项目设置中启用 Analytics
2. 查看实时访问数据
3. 分析用户行为

### Vercel Logs

1. 在项目仪表板查看日志
2. 过滤错误和警告
3. 设置日志告警

## 回滚部署

如果新部署出现问题：

1. 进入 Vercel 项目仪表板
2. 选择 "Deployments"
3. 找到之前的稳定版本
4. 点击 "Promote to Production"

## 自动部署

Vercel 会自动部署：
- `main` 分支的每次推送 → 生产环境
- 其他分支的推送 → 预览环境
- Pull Request → 预览环境

## 安全建议

1. **不要提交敏感信息**
   - 使用环境变量存储密钥
   - 添加 `.env.local` 到 `.gitignore`

2. **启用 HTTPS**
   - Vercel 自动提供 SSL 证书
   - 强制使用 HTTPS

3. **配置 CSP**
   - 在 `next.config.ts` 中配置内容安全策略

4. **定期更新依赖**
   ```bash
   pnpm update
   ```

## 支持

如有问题，请：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 查看 [Next.js 文档](https://nextjs.org/docs)
3. 提交 [GitHub Issue](https://github.com/yourusername/aimage/issues)

---

**部署成功后，记得更新 README.md 中的演示链接！**
