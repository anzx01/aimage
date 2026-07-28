# AIMAGE - AI视频生成平台

**一键生成专业级产品视频的AI平台**

## 项目简介

AIMAGE 是一个基于 AI 的视频生成平台，专注于为电商、品牌和内容创作者提供快速、专业的产品视频生成服务。通过简单的文字描述或上传素材，即可生成高质量的产品展示视频。

### 核心功能

- 一键成片 - 上传图片 + 文字描述，AI 自动生成视频
- 项目管理 - 完整的项目生命周期管理
- 数字人 - 基于 AI 口播/文生视频（非真人对口型）
- 案例库 - 精选优秀案例展示
- 积分系统 - 灵活的积分充值和消费机制
- 管理后台 - 管理员可查看平台统计数据和用户列表
- GitHub 登录 - 支持 GitHub OAuth + 邮箱密码登录

## 快速开始

### 环境要求

- Node.js 18.0+
- Python 3.10+
- pnpm 8.0+
- Supabase 账号
- 阿里云百炼 API Key（DashScope）

### 一键启动

```bash
# Windows
scripts\start.bat

# Unix/macOS
chmod +x scripts/start.sh
./scripts/start.sh
```

启动后：
- 前端: http://localhost:3002
- 后端: http://localhost:8001
- 健康检查: http://localhost:8001/health

> **注意**: 默认使用 3002/8001 端口，避免与常见开发服务冲突。如需修改，编辑 `scripts/start.bat` 和 `frontend/.env.local`。

停止服务：
```bash
# Windows
scripts\stop.bat

# Unix/macOS
./scripts/stop.sh
```

### 手动安装

#### 1. 前端

```bash
cd frontend
pnpm install
```

创建 `frontend/.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8001
```

启动：`pnpm dev -p 3002`

#### 2. 后端

```bash
cd backend
pip install -r requirements.txt
```

创建 `backend/.env`（参考 `backend/.env.example`）：
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Models
DASHSCOPE_API_KEY=your_dashscope_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Environment (development/production)
ENVIRONMENT=development
```

启动：`python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload`

#### 3. 数据库迁移

在 Supabase Dashboard 的 SQL Editor 中按顺序执行 `supabase/migrations/` 下的所有 SQL 文件：

1. `20260724000000_converge_schema_and_credits.sql` - 统一数据层 + 积分安全 RPC
2. `20260724000100_create_assets_bucket.sql` - Storage bucket 及 RLS 策略
3. `20260726000000_fix_projects_type_and_cleanup.sql` - 修复 project_type 枚举 + 清理遗留列

#### 4. Supabase Authentication 配置

- 在 Authentication -> URL Configuration 中添加 `http://localhost:3002/**` 到 Redirect URLs
- 在 Authentication -> Providers 中启用 GitHub OAuth（如需 GitHub 登录）

## 项目结构

```
aimage/
├── frontend/                  # 前端 (Next.js)
│   ├── app/                   # 页面
│   │   ├── dashboard/         # 工作台
│   │   ├── generate/          # 一键成片
│   │   ├── projects/          # 项目管理
│   │   ├── digital-humans/    # 数字人
│   │   ├── showcase/          # 案例库
│   │   ├── credits/           # 积分充值
│   │   ├── admin/             # 管理后台
│   │   ├── settings/          # 用户设置
│   │   ├── login/             # 登录（支持 GitHub OAuth）
│   │   └── signup/            # 注册（支持 GitHub OAuth）
│   ├── components/            # 通用组件
│   │   ├── AuthProvider.tsx   # 全局 Auth 状态监听
│   │   ├── FileUpload.tsx     # 文件上传（含尺寸校验）
│   │   └── ...
│   └── lib/                   # supabase 客户端、状态管理
├── backend/                   # 后端 (FastAPI)
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py        # 统一鉴权依赖
│   │   │   └── v1/
│   │   │       ├── auth.py    # 认证
│   │   │       ├── projects.py # 项目
│   │   │       ├── generate.py # 视频生成
│   │   │       ├── digital_humans.py # 数字人
│   │   │       ├── credits.py # 积分（只读+购买）
│   │   │       └── admin.py   # 管理后台
│   │   ├── core/config.py     # 配置
│   │   ├── db/supabase.py     # Supabase 客户端
│   │   ├── services/
│   │   │   ├── ai_service.py  # DashScope + DeepSeek
│   │   │   └── credits_service.py # 积分 RPC 封装
│   │   └── schemas/           # Pydantic 模型
│   ├── scripts/               # 运维脚本
│   │   ├── add_credits.py     # 批量加积分
│   │   └── test_digital_human.py # 诊断脚本
│   ├── logs/                  # 运行日志
│   └── main.py               # 入口
├── supabase/migrations/       # 数据库迁移文件
├── scripts/                   # 启停脚本
│   ├── start.bat / start.sh
│   └── stop.bat / stop.sh
└── README.md
```

## 技术栈

### 前端
- Next.js 16 (App Router, Turbopack)
- TypeScript 5.0
- Tailwind CSS 4.0
- Zustand (状态管理)
- Supabase JS (Auth + Storage)

### 后端
- FastAPI
- Supabase (PostgreSQL + Auth + Storage)
- 阿里云 DashScope (Wan2.6 图生视频)
- DeepSeek API (提示词优化)
- slowapi (限流)

## 架构要点

- **鉴权**: 统一使用 Supabase 原生 session token，后端通过 `supabase_admin.auth.get_user(token)` 验证，不使用自建 JWT。前端通过 `AuthProvider` 组件全局监听 auth 状态变化。
- **积分**: 所有积分变动通过 Supabase RPC（`deduct_user_credits` / `refund_user_credits`）执行，SECURITY DEFINER + 行锁，仅 service_role 可调用。前端无法直接修改积分。
- **数据表**: 用户信息存储在 `profiles` 表（非 `users`），积分流水在 `credit_transactions`（字段: `transaction_type`, `balance_after`）。
- **文件上传**: 前端直传 Supabase Storage `assets` bucket，图片尺寸限制 240-8000 像素，文件大小限制 100MB。

## 数据库结构

核心表：
- `profiles` - 用户信息（含 `credits`, `is_admin`）
- `projects` - 项目（`project_type`: one_click_basic / one_click_advanced / digital_human / viral_clone / reverse_prompt）
- `generation_tasks` - 生成任务
- `digital_humans` - 数字人
- `credit_transactions` - 积分交易流水
- `assets` / `project_assets` - 素材管理
- `showcase_cases` - 案例库

迁移文件在 `supabase/migrations/` 目录下。

## 已知限制

1. **Seedance 2.0 文生视频**: 尚未配置 API Key，选择该模型会返回明确的未配置提示。
2. **数字人视频**: 当前使用通义万相文生视频 API 实现（AI 口播风格），非真正的数字人对口型。如需真人对口型，需接入阿里云 IMS 服务。
3. **积分购买**: 仅在 `ENVIRONMENT=development` 时可用（沙箱模式），生产环境返回 501。
4. **图片上传**: 要求图片尺寸在 240-8000 像素之间，文件大小不超过 100MB。

## 合规与版权说明

- 本仓库源码采用 MIT 许可证。
- 演示页面中的第三方图片仅用于开发占位，正式部署前请替换为自有或已授权素材。
- TikTok、Instagram、YouTube、Sora、Kling、Runway、DeepSeek、DashScope 等名称和商标归各自权利人所有，本项目与上述品牌无隶属关系。
