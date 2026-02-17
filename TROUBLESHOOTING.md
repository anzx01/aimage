# 数字人视频问题排查结果

## 诊断结果

### 数据库状态
- ✅ 找到 5 个数字人记录
- ✅ 找到 3 个项目记录
- ❌ **所有项目都是 `draft` 状态，`video_url` 为 `None`**
- ❌ **所有项目类型都是 `advanced`（一键成片），没有 `digital_human` 类型的项目**

### 问题分析

根据诊断结果，**你还没有成功生成过数字人视频**。现有的项目都是"一键成片"功能创建的草稿，不是数字人视频。

## 测试步骤

### 1. 启动后端服务（带日志）
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### 2. 在前端生成数字人视频
1. 访问 http://localhost:3000/digital-humans
2. 选择一个数字人
3. 点击"生成视频"
4. 输入文本内容（例如："你好，欢迎使用我们的数字人服务"）
5. 点击生成

### 3. 观察后端日志

**成功的日志应该包含：**
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

**如果失败，日志会显示：**
```
ERROR - Error processing digital human video: xxx
INFO - Attempting to refund 10 credits to user xxx
INFO - Successfully refunded 10 credits to user xxx
```

### 4. 再次运行诊断脚本
```bash
cd backend
python test_digital_human.py
```

检查是否有新的 `project_type: digital_human` 的项目记录。

## 可能的失败原因

### 原因1: DashScope API密钥无效
**症状：** 日志显示 401 Unauthorized 错误

**解决方案：**
1. 检查 `.env` 文件中的 `DASHSCOPE_API_KEY`
2. 确认API密钥是否有效且有足够的配额
3. 访问阿里云控制台验证API密钥

### 原因2: API端点不正确
**症状：** 日志显示所有端点都返回 404 错误

**解决方案：**
1. 查阅阿里云DashScope最新API文档
2. 确认数字人视频合成的正确端点
3. 更新 `backend/app/services/ai_service.py` 中的端点列表

### 原因3: 头像URL无效
**症状：** API返回错误提示头像URL无法访问

**解决方案：**
1. 确认数字人的头像URL可以公开访问
2. 测试URL是否返回有效的图片
3. 检查图片格式是否符合要求（通常是JPG/PNG）

### 原因4: 网络超时
**症状：** 日志显示 TimeoutError

**解决方案：**
1. 增加 `max_wait_time` 参数（当前是300秒）
2. 检查网络连接
3. 确认防火墙没有阻止API请求

### 原因5: JWT验证失败
**症状：** 前端请求返回 401 Unauthorized

**解决方案：**
1. 检查 `.env` 中的 `JWT_SECRET` 配置
2. 确认前端和后端使用相同的JWT密钥
3. 临时禁用JWT验证进行测试（仅开发环境）

## 快速测试方案

如果你想快速测试后端是否正常工作，可以创建一个简单的测试脚本：

```python
# test_api_call.py
import asyncio
from app.services.ai_service import dashscope_service

async def test():
    try:
        result = await dashscope_service.generate_digital_human_video(
            avatar_url="https://your-avatar-url.jpg",
            text="测试文本",
            voice_type="female",
            duration=10
        )
        print("Success:", result)
    except Exception as e:
        print("Error:", str(e))

asyncio.run(test())
```

运行：
```bash
cd backend
python test_api_call.py
```

## 下一步行动

1. **立即执行：** 按照上述步骤在前端生成一个数字人视频
2. **观察日志：** 查看后端控制台的详细日志
3. **报告结果：** 如果失败，提供完整的错误日志
4. **验证修复：** 如果成功，运行诊断脚本确认项目已创建

## 预期结果

成功生成后，诊断脚本应该显示：
```
Project X:
  ID: xxx
  Title: [数字人名称] - [文本内容]...
  Type: digital_human
  Mode: digital_human
  Status: completed
  Video URL: https://xxx.xxx/video.mp4
  Credits Used: 10
```

然后在前端 `/projects` 页面就能看到这个视频了。
