# Role & Objective

你现在的角色是 neobetter 首席系统架构师**。我们需要构建一个TikTok UGC 视频生成平台 https://www.neobund1.com，帮助跨境电商卖家降低 AI 视频生成的门槛。

你需要采用 **"规格驱动开发 (Spec-Driven Development, SDD)"** 的方法论，严谨地执行“调研 -> 架构 -> 开发”的全链路流程。

# Context & Methodology

参考以下技术架构标准（请以此为执行标准，而非普通的代码生成）：
1.**Lane Planning**：在开始写代码前，必须先建立 `/.lane` 目录，通过文档定义需求（The WHAT）、架构（The HOW）和任务（The DO）。
2.**技术栈**：

- 前端：Next.js 15 (App Router), Tailwind CSS (复刻目标网站风格).
- 后端/数据库：Supabase (Auth, Postgres, RLS).
- 异步任务：Trigger.dev (用于处理耗时的视频生成任务).
  3.**工作流**：逆向工程 neobund.com -> 数据库设计 -> 后端逻辑 -> 前端实现。

# Execution Plan (Step-by-Step)

请严格按照以下 4 个阶段执行任务。每完成一个阶段，请向我汇报并等待确认，再进入下一阶段。

## Phase 1: 侦察与逆向工程 (Reconnaissance)

1. 使用你的 `playwright-mcp`工具 
   调用我目前在用的真实、有用户状态的 chrome 浏览器（用户是liuzx3000@gmail.com）去访问网站 https://www.neobund.com 调研一下，输入手机号13572045112 和密码liuzx691216 来登录。操作浏览器点击网站的多个页面，并且通过截屏方式留存图片

接着，参考以下参数，调用阿里云百炼的视觉模型qwen3-vl-plus-2025-12-19用视觉能力去分析图片

import os

from openai import OpenAI

client = OpenAI(

    api_key="sk-0cc269aa8cb945ddb127aad1ce6b4d21",

    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",

)

completion = client.chat.completions.create(

    model="qwen3-vl-plus", # 此处以qwen3-vl-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/models

    messages=[

    {

    "role": "user",

    "content": [

    {

    "type": "image_url",

    "image_url": {

    "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg"

    },

    },

    {"type": "text", "text": "图中描绘的是什么景象?"},

    ],

    },

    ],

)

print(completion.choices[0].message.content)

2.**深度调研**：

- 分析 Landing Page 的文案、价值主张和视觉层级（H1, H2, CTA 按钮位置）。
- 尝试理解其业务流程：用户如何上传图片？有哪些输入项（风格、时长、文案）？输出是什么？
  -**视觉分析**：虽然你不能直接“看”截图，请通过分析 HTML/CSS (DOM 结构、Tailwind 类名、计算样式) 来推断其配色方案 (Hex Code)、圆角风格、组件布局。
  3.**产出物**：在当前目录下生成 `research.md`，包含：
- 核心功能列表 (User Stories)。
- 视觉设计规范 (Color Palette, Typography, Spacing)。
- 推断的数据结构 (Schema Inference)。

## Phase 2: 架构与泳道规划 (Architecture & Planning)

1. 创建目录 `/.lane/plans/`。
2. 编写以下核心文档（不要直接开始写代码，先写文档）：
   -**`spec.md`**：详细的需求规格说明书。定义用户从“注册”到“下载视频”的完整路径。
   -**`data-model.md`**：设计 Supabase 的数据库结构。必须包含 `profiles`, `projects` (存储视频任务), `assets` (素材) 等表，并明确定义 RLS (Row Level Security) 策略。
   -**`architecture.md`**：系统架构图。描述 Next.js 如何通过 Server Actions 写入 Supabase，并触发 Trigger.dev 的异步任务。
   3.**产出物**：上述三个 Markdown 文件。

也就是说根据前面的分析和需求场景，生成文件

- 要包含前端网站是什么样的，可以直接复刻前面说的网站，并且倒推出，后端python需要什么？？用 fastapi 来写服务
- 包括数据库结构设计，可以先用Supabase（你可以调用浏览器用我的谷歌账户来注册Supabase，然后新建项目）
- 还要包含用户的注册与登录。
- 就是要完整的一个可以用的。

## Phase 3: 后端基础设施 (Backend Infrastructure)

1.**Supabase 初始化**：

- 生成 Supabase 的 SQL Migration 文件（基于 `data-model.md`）。
- 编写 TypeScript 类型定义（数据库 Types）。
  2.**异步任务编排 (Trigger.dev)**：
- 规划 `generate-video` 的任务逻辑（模拟调用 AI 视频接口，因为我们暂时没有真实 Key，先写 Mock 逻辑但保持架构真实）。
- 实现“轮询”或 Webhook 回调机制来更新 Supabase 中的任务状态。

## Phase 4: 前端复刻与集成 (Frontend Implementation)

1. 初始化 Next.js 项目。
   2.**组件复刻**：根据 Phase 1 的视觉规范，使用 Tailwind CSS 构建高保真的前端页面。
   - 重点复刻：Dashboard 仪表盘、上传区域、视频结果展示卡片。
     3.**联调**：将前端表单连接到 Supabase 和 Trigger.dev。
