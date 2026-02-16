# AIMAGE - AI视频生成平台

<div align="center">

![1771251713958](image/README/1771251713958.png)

**一键生成专业级产品视频的AI平台**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)

</div>

## 📖 项目简介

AIMAGE 是一个基于 AI 的视频生成平台，专注于为电商、品牌和内容创作者提供快速、专业的产品视频生成服务。通过简单的文字描述或上传素材，即可生成高质量的产品展示视频。

### ✨ 核心功能

- 🎬 **一键成片** - 基础模式和高级模式，满足不同需求
- 📁 **项目管理** - 完整的项目生命周期管理
- 🎭 **数字人管理** - 自定义数字人形象和声音
- 🎨 **案例库** - 精选优秀案例，获取创作灵感
- 💳 **积分系统** - 灵活的积分充值和消费机制
- 👤 **用户中心** - 个人信息管理和账户设置

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本
- Supabase 账号

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/aimage.git
cd aimage
```

2. **安装依赖**

```bash
cd frontend
pnpm install
```

3. **配置环境变量**

在 `frontend` 目录下创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **配置数据库**

在 Supabase 中执行以下 SQL 文件：

- `supabase/complete_migration.sql` - 完整的数据库结构
- `supabase/migrations/20260215121200_seed_showcase_cases.sql` - 示例数据

5. **配置 Storage**

按照 `SUPABASE_STORAGE_SETUP.md` 文档配置 Supabase Storage。

6. **启动开发服务器**

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
aimage/
├── frontend/                 # 前端应用
│   ├── app/                 # Next.js 应用目录
│   │   ├── dashboard/       # 工作台
│   │   ├── projects/        # 项目管理
│   │   ├── showcase/        # 案例库
│   │   ├── generate/        # 一键成片
│   │   ├── digital-humans/  # 数字人管理
│   │   ├── credits/         # 积分充值
│   │   ├── settings/        # 用户设置
│   │   ├── login/           # 登录
│   │   └── signup/          # 注册
│   ├── components/          # 通用组件
│   │   ├── Header.tsx       # 导航栏
│   │   ├── Modal.tsx        # 模态框
│   │   ├── FileUpload.tsx   # 文件上传
│   │   ├── Loading.tsx      # 加载组件
│   │   └── ErrorBoundary.tsx # 错误边界
│   ├── lib/                 # 工具库
│   │   ├── supabase.ts      # Supabase 客户端
│   │   └── store.ts         # 状态管理
│   └── public/              # 静态资源
├── supabase/                # 数据库配置
│   ├── migrations/          # 数据库迁移文件
│   └── complete_migration.sql # 完整数据库结构
├── PROGRESS_2026-02-15.md   # 开发进度
├── QUICK_START_TESTING.md   # 快速测试指南
├── SUPABASE_STORAGE_SETUP.md # Storage 配置指南
└── README.md                # 项目文档
```

## 🛠️ 技术栈

### 前端

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript 5.0
- **样式**: Tailwind CSS 4.0
- **状态管理**: Zustand
- **UI组件**: 自定义组件库

### 后端

- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **实时**: Supabase Realtime

### 部署

- **前端**: Vercel
- **数据库**: Supabase Cloud

## 📊 数据库结构

### 核心表

- **users** - 用户信息
- **projects** - 项目管理
- **generation_tasks** - 生成任务
- **assets** - 素材管理
- **project_assets** - 项目素材关联
- **showcase_cases** - 案例库
- **credit_transactions** - 积分交易记录

详细的数据库结构请查看 `supabase/complete_migration.sql`。

## 🎯 功能模块

### 1. 一键成片 (`/generate`)

支持两种生成模式：

**基础模式**

- 文字描述生成
- 消耗 10 积分
- 适合快速生成

**高级模式**

- 支持上传图片/视频素材
- 更多自定义选项
- 消耗 20 积分
- 适合专业需求

### 2. 项目管理 (`/projects`)

- 项目列表查看
- 项目详情展示
- 视频预览和下载
- 项目删除
- 分享链接生成

### 3. 数字人管理 (`/digital-humans`)

- 数字人列表
- 添加自定义数字人
- 选择声音类型（男声/女声）
- 数字人预览

### 4. 案例库 (`/showcase`)

- 精选案例展示
- 分类筛选
- 案例详情查看
- 获取创作灵感

### 5. 积分系统 (`/credits`)

- 积分余额查看
- 多种套餐选择
- 充值记录
- 消费明细

### 6. 用户中心 (`/settings`)

- 个人信息编辑
- 密码修改
- 账户安全设置

## 🔐 权限和安全

### Row Level Security (RLS)

所有数据表都启用了 RLS 策略，确保：

- 用户只能访问自己的数据
- 管理员有特殊权限
- 公开数据（如案例库）对所有人可见

### 文件上传安全

- 文件类型验证
- 文件大小限制
- 安全的文件命名
- 私有存储桶配置

## 📝 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式编程

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

### 分支管理

- `main` - 生产环境
- `develop` - 开发环境
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复

## 🧪 测试

### 运行测试

```bash
pnpm test
```

### 测试覆盖率

```bash
pnpm test:coverage
```

详细的测试指南请查看 `TESTING_GUIDE.md`。

## 📦 部署

### Vercel 部署

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### 环境变量配置

在 Vercel 中配置以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目主页: [https://github.com/yourusername/aimage](https://github.com/yourusername/aimage)
- 问题反馈: [Issues](https://github.com/yourusername/aimage/issues)
- 邮箱: your.email@example.com

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)

---

<div align="center">

**Made with ❤️ by AIMAGE Team**

[官网](https://aimage.example.com) · [文档](https://docs.aimage.example.com) · [博客](https://blog.aimage.example.com)

</div>
