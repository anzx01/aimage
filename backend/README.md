# FastAPI Backend

NeoBund1.com 后端 API 服务，基于 FastAPI + Supabase。

## 技术栈

- **FastAPI 0.110+**: 高性能 Web 框架
- **Python 3.11+**: 编程语言
- **Supabase**: PostgreSQL 数据库 + 认证 + 存储
- **Pydantic**: 数据验证
- **JWT**: Token 认证
- **Uvicorn**: ASGI 服务器

## 项目结构

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # 认证端点
│   │       └── projects.py      # 项目端点
│   ├── core/
│   │   ├── config.py            # 配置
│   │   └── security.py          # 安全工具
│   ├── db/
│   │   └── supabase.py          # Supabase 客户端
│   ├── models/                  # SQLAlchemy 模型（可选）
│   ├── schemas/                 # Pydantic 模式
│   │   └── __init__.py
│   └── services/                # 业务逻辑服务
├── main.py                      # 应用入口
├── requirements.txt             # Python 依赖
├── .env.example                 # 环境变量示例
└── README.md                    # 本文件
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

必需的环境变量：
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `DATABASE_URL`: PostgreSQL 连接字符串
- `JWT_SECRET`: JWT 密钥（生产环境必须更改）

### 3. 运行开发服务器

```bash
python main.py
```

或使用 uvicorn：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务将在 http://localhost:8000 启动。

### 4. 查看 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 端点

### 认证 (Authentication)

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/me` - 获取当前用户信息

### 项目 (Projects)

- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects/{id}` - 获取项目详情
- `PATCH /api/v1/projects/{id}` - 更新项目
- `DELETE /api/v1/projects/{id}` - 删除项目

## 认证

所有需要认证的端点使用 Bearer Token：

```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:8000/api/v1/projects
```

## 开发指南

### 添加新端点

1. 在 `app/api/v1/` 创建新的路由文件
2. 在 `app/schemas/` 定义 Pydantic 模型
3. 在 `main.py` 中注册路由

示例：

```python
# app/api/v1/showcase.py
from fastapi import APIRouter

router = APIRouter(prefix="/showcase", tags=["Showcase"])

@router.get("/cases")
async def get_showcase_cases():
    return {"cases": []}

# main.py
from app.api.v1 import showcase
app.include_router(showcase.router, prefix="/api/v1")
```

### 数据库操作

使用 Supabase 客户端：

```python
from app.db.supabase import supabase

# 查询
response = supabase.table("projects").select("*").execute()

# 插入
response = supabase.table("projects").insert({"title": "New Project"}).execute()

# 更新
response = supabase.table("projects").update({"title": "Updated"}).eq("id", project_id).execute()

# 删除
response = supabase.table("projects").delete().eq("id", project_id).execute()
```

## 部署

### Railway 部署

1. 连接 GitHub 仓库
2. 设置环境变量
3. 配置启动命令：`uvicorn main:app --host 0.0.0.0 --port $PORT`
4. 部署

### Docker 部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 测试

```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest
```

## 安全注意事项

- ✅ 所有密码使用 bcrypt 加密
- ✅ JWT Token 有效期 1 小时
- ✅ 使用 HTTPS（生产环境）
- ✅ CORS 配置限制来源
- ✅ 速率限制（待实现）
- ⚠️ 生产环境必须更改 JWT_SECRET

## 故障排查

### 连接 Supabase 失败

检查：
1. `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正确
2. 网络连接是否正常
3. Supabase 项目是否已暂停

### 认证失败

检查：
1. JWT_SECRET 是否一致
2. Token 是否过期
3. Token 格式是否正确（Bearer <token>）

## 许可证

MIT License
