# 积分充值和扣点功能说明

## 功能概述

本系统实现了完整的积分充值和扣点功能，包括：

1. **积分充值**：用户可以购买不同的积分套餐
2. **积分扣除**：生成视频时自动扣除相应积分
3. **积分退还**：生成失败时自动退还积分
4. **交易记录**：记录所有积分变动历史

## 文件结构

### 前端文件

```
frontend/
├── app/
│   ├── credits/
│   │   └── page.tsx                    # 积分充值页面
│   ├── generate/
│   │   └── page.tsx                    # 视频生成页面（含扣点逻辑）
│   └── api/
│       └── credits/
│           ├── purchase/
│           │   └── route.ts            # 购买积分 API
│           ├── deduct/
│           │   └── route.ts            # 扣除积分 API
│           └── refund/
│               └── route.ts            # 退还积分 API
└── lib/
    └── credits.ts                      # 积分工具函数
```

### 后端文件

```
backend/
└── app/
    └── api/
        └── v1/
            └── credits.py              # 积分相关 API 端点
```

## 积分套餐

| 套餐 | 积分 | 价格 | 赠送 | 总计 |
|------|------|------|------|------|
| 基础版 | 10 | ¥9.9 | 0 | 10 |
| 标准版 | 50 | ¥49 | 5 | 55 |
| 专业版 | 100 | ¥89 | 15 | 115 |
| 企业版 | 500 | ¥399 | 100 | 600 |

## 积分消耗规则

### 基础模式
- 15秒视频：1 积分
- 30秒视频：2 积分
- 60秒视频：3 积分

### 高级模式
- 15秒视频：2 积分
- 30秒视频：4 积分
- 60秒视频：6 积分

## API 接口说明

### 1. 购买积分

**端点**: `POST /api/credits/purchase`

**请求体**:
```json
{
  "package_id": "standard",
  "payment_method": "alipay"
}
```

**响应**:
```json
{
  "success": true,
  "message": "购买成功",
  "credits_added": 55,
  "new_balance": 155,
  "transaction_id": "xxx"
}
```

### 2. 扣除积分

**端点**: `POST /api/credits/deduct`

**请求体**:
```json
{
  "amount": 3,
  "description": "生成60秒视频",
  "project_id": "xxx"
}
```

**响应**:
```json
{
  "success": true,
  "message": "扣除成功",
  "credits_deducted": 3,
  "new_balance": 152
}
```

### 3. 退还积分

**端点**: `POST /api/credits/refund`

**请求体**:
```json
{
  "amount": 3,
  "description": "生成失败退款",
  "project_id": "xxx"
}
```

**响应**:
```json
{
  "success": true,
  "message": "退还成功",
  "credits_refunded": 3,
  "new_balance": 155
}
```

## 使用示例

### 前端购买积分

```typescript
const handlePurchase = async (packageId: string) => {
  const response = await fetch('/api/credits/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      package_id: packageId,
      payment_method: 'alipay',
    }),
  });

  const data = await response.json();
  if (data.success) {
    console.log('购买成功，新余额:', data.new_balance);
  }
};
```

### 前端扣除积分

```typescript
import { deductCredits, calculateCreditsNeeded } from '@/lib/credits';

// 计算所需积分
const creditsNeeded = calculateCreditsNeeded('basic', 30); // 2 积分

// 扣除积分
const result = await deductCredits(
  userId,
  creditsNeeded,
  '生成30秒视频',
  projectId
);

if (result.success) {
  console.log('扣除成功，新余额:', result.newBalance);
}
```

### 前端退还积分

```typescript
import { refundCredits } from '@/lib/credits';

// 生成失败时退还积分
const result = await refundCredits(
  userId,
  creditsNeeded,
  '生成失败退款',
  projectId
);

if (result.success) {
  console.log('退还成功，新余额:', result.newBalance);
}
```

## 数据库表结构

### users 表
```sql
- id: uuid (主键)
- credits: integer (积分余额)
- ...其他字段
```

### credit_transactions 表
```sql
- id: uuid (主键)
- user_id: uuid (用户ID)
- amount: integer (积分变动，正数为增加，负数为扣除)
- type: string (类型: purchase/deduct/refund)
- description: string (描述)
- related_project_id: uuid (关联项目ID，可选)
- created_at: timestamp (创建时间)
```

## 注意事项

1. **支付集成**：当前版本为演示版本，直接模拟支付成功。生产环境需要集成真实的支付网关（支付宝/微信/Stripe）。

2. **事务处理**：积分扣除和退还操作应该在数据库事务中进行，确保数据一致性。

3. **并发控制**：需要处理并发扣除积分的情况，避免超扣。

4. **安全性**：
   - 所有 API 都需要用户认证
   - 扣除和退还接口应该只被内部服务调用
   - 需要验证请求的合法性

5. **积分永久有效**：用户购买的积分永久有效，不会过期。

6. **失败退款**：如果视频生成失败，系统会自动退还已扣除的积分。

## 测试流程

1. 访问 `/credits` 页面
2. 选择一个积分套餐并购买
3. 查看积分余额是否增加
4. 访问 `/generate` 页面创建视频项目
5. 提交后检查积分是否正确扣除
6. 查看交易记录确认所有操作都有记录

## 后续优化建议

1. 集成真实支付网关
2. 添加支付回调处理
3. 实现积分充值优惠活动
4. 添加积分使用统计和分析
5. 实现积分转赠功能（如果需要）
6. 添加积分预警提醒
7. 实现批量操作的事务处理
