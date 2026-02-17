# 数字人视频生成问题修复说明

## 已完成的修复

### 1. Schema定义修复
**文件**: `backend/app/schemas/__init__.py`
- 为 `DigitalHumanResponse` 添加了缺失的字段：
  - `voice_config: Optional[dict]`
  - `appearance_config: Optional[dict]`

### 2. API端点优化
**文件**: `backend/app/services/ai_service.py`
- 实现了多端点尝试机制，自动测试以下DashScope API端点：
  1. `/api/v1/services/aigc/digital-human/video-synthesis`
  2. `/services/aigc/digital-human/video-synthesis`
  3. `/api/v1/services/aigc/video-generation/digital-human`
- 添加了详细的日志记录，便于调试API调用问题

### 3. 积分退还机制
**文件**: `backend/app/api/v1/digital_humans.py`
- 在视频生成失败时自动退还已扣除的积分
- 记录退款交易到 `credit_transactions` 表
- 包含详细的错误信息

### 4. 错误处理和重试机制
**文件**: `backend/app/services/ai_service.py`
- 在 `wait_for_task_completion` 方法中添加了网络请求重试逻辑（最多3次）
- 改进了超时处理
- 提供更详细的错误信息

### 5. JWT签名验证
**文件**:
- `backend/app/api/v1/digital_humans.py`
- `backend/app/api/v1/generate.py`

移除了不安全的 `verify_signature: False` 选项，启用了JWT签名验证：
```python
payload = jwt.decode(
    token,
    settings.JWT_SECRET,
    algorithms=[settings.JWT_ALGORITHM]
)
```

### 6. 日志系统改进
**文件**:
- `backend/main.py`
- `backend/app/services/ai_service.py`
- `backend/app/api/v1/digital_humans.py`

- 配置了标准的Python logging模块
- 将所有 `print()` 语句替换为 `logger.info/debug/error`
- 添加了结构化日志记录

## 诊断工具

### 运行诊断脚本
```bash
cd backend
python test_digital_human.py
```

这个脚本会检查：
1. 数据库中的数字人记录
2. 数据库中的项目记录
3. 项目的video_url字段是否正确

## 问题排查步骤

### 如果看不到数字人视频：

#### 步骤1: 检查后端日志
启动后端服务并查看日志：
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

生成视频时，应该看到类似的日志：
```
INFO - Starting digital human video generation for user xxx
INFO - Digital human found: xxx, avatar_url: xxx
INFO - Attempting digital human video generation with endpoint: xxx
INFO - Successfully initiated digital human video generation. Task ID: xxx
INFO - Got task_id: xxx, waiting for completion...
INFO - Task completed successfully
INFO - Got video_url: xxx
INFO - Project created successfully: xxx
```

#### 步骤2: 运行诊断脚本
```bash
cd backend
python test_digital_human.py
```

检查输出：
- ✅ 如果看到项目记录且有video_url -> 后端正常，检查前端
- ❌ 如果项目记录的video_url为空 -> API调用失败
- ❌ 如果没有项目记录 -> 视频生成过程失败

#### 步骤3: 检查API密钥配置
确保 `.env` 文件中配置了正确的API密钥：
```env
DASHSCOPE_API_KEY=your_api_key_here
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com
JWT_SECRET=your_jwt_secret_here
```

#### 步骤4: 测试API端点
如果API调用失败，日志会显示尝试的所有端点。根据错误信息：
- 404错误 -> API端点不正确，需要查阅DashScope最新文档
- 401错误 -> API密钥无效或过期
- 500错误 -> 服务器内部错误，检查请求参数

#### 步骤5: 检查前端
如果后端正常但前端看不到视频：

1. 打开浏览器开发者工具（F12）
2. 查看Console标签的日志
3. 查看Network标签，检查API请求是否成功
4. 确认前端代码正确读取了 `project.video_url` 字段

## 常见问题

### Q1: 视频生成失败，积分被扣除
**A**: 已修复。现在失败时会自动退还积分。

### Q2: API调用返回404
**A**: 已添加多端点尝试机制。如果所有端点都失败，请查阅DashScope最新API文档。

### Q3: JWT验证失败
**A**: 确保 `.env` 文件中配置了 `JWT_SECRET`，且与前端使用的密钥一致。

### Q4: 看不到详细的错误信息
**A**: 已添加完整的日志系统。启动后端时会在控制台显示详细日志。

## 下一步建议

1. **测试视频生成**：创建一个数字人并生成视频，观察后端日志
2. **验证积分退还**：故意触发一个失败（如使用无效的avatar_url），确认积分被退还
3. **检查生产环境配置**：确保所有环境变量都已正确配置
4. **监控日志**：在生产环境中使用日志聚合工具（如ELK、Sentry）收集日志

## 技术支持

如果问题仍然存在：
1. 运行诊断脚本并保存输出
2. 收集后端日志（特别是错误信息）
3. 检查浏览器控制台的错误信息
4. 提供以上信息以便进一步诊断
