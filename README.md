# AIMAGE - AI视频生成平台

**一键生成专业级产品视频的AI平台**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)

## 项目简介

AIMAGE 是一个基于 AI 的视频生成平台，专注于为电商、品牌和内容创作者提供快速、专业的产品视频生成服务。通过简单的文字描述或上传素材，即可生成高质量的产品展示视频。

### 核心功能

- 一键成片 - 上传图片 + 文字描述，AI 自动生成视频
- 项目管理 - 完整的项目生命周期管理
- 数字人 - 基于 AI 口播/文生视频（非真人对口型）
- 案例库 - 精选优秀案例展示
- 积分系统 - 灵活的积分充值和消费机制
- 管理后台 - 管理员可查看平台统计数据和用户列表

## 快速开始

### 环境要求

- Node.js 18.0+
- Python 3.10+
- pnpm 8.0+
- Supabase 账号

### 一键启动

```bash
# Windows
scripts\start.bat

# Unix/macOS
chmod +x scripts/start.sh
./scripts/start.sh
```

启动后：
- 前端: http://localhost:3000
- 后端: http://localhost:8000
- 健康检查: http://localhost:8000/health

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
NEXT_PUBLIC_API_URL=http://localhost:8000
```

启动：`pnpm dev`

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

启动：`python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

#### 3. 数据库迁移

在 Supabase Dashboard 的 SQL Editor 中按顺序执行 `supabase/migrations/` 下的所有 SQL 文件。

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
│   │   └── settings/          # 用户设置
│   ├── components/            # 通用组件
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
- Next.js 15 (App Router)
- TypeScript 5.0
- Tailwind CSS 4.0
- Zustand (状态管理)

### 后端
- FastAPI
- Supabase (PostgreSQL + Auth + Storage)
- 阿里云 DashScope (Wan2.6 图生视频)
- DeepSeek API (提示词优化)
- slowapi (限流)

## 架构要点

- **鉴权**: 统一使用 Supabase 原生 session token，后端通过 `supabase_admin.auth.get_user(token)` 验证，不使用自建 JWT。
- **积分**: 所有积分变动通过 Supabase RPC（`deduct_user_credits` / `refund_user_credits`）执行，SECURITY DEFINER + 行锁，仅 service_role 可调用。前端无法直接修改积分。
- **数据表**: 用户信息存储在 `profiles` 表（非 `users`），积分流水在 `credit_transactions`（字段: `transaction_type`, `balance_after`）。

## 数据库结构

核心表：
- `profiles` - 用户信息（含 `credits`, `is_admin`）
- `projects` - 项目（`project_type` 字段区分类型）
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

## 合规与版权说明

- 本仓库源码采用 MIT 许可证。
- 演示页面中的第三方图片仅用于开发占位，正式部署前请替换为自有或已授权素材。
- TikTok、Instagram、YouTube、Sora、Kling、Runway、DeepSeek、DashScope 等名称和商标归各自权利人所有，本项目与上述品牌无隶属关系。
