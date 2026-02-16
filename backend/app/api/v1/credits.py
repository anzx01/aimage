from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

from app.core.supabase import get_supabase_client
from app.api.v1.auth import get_current_user

router = APIRouter()


class PurchaseRequest(BaseModel):
    package_id: str
    payment_method: str = "alipay"  # alipay, wechat, stripe


class CreditTransaction(BaseModel):
    id: str
    user_id: str
    amount: int
    type: str
    description: str
    created_at: datetime


class CreditPackage(BaseModel):
    id: str
    credits: int
    price: float
    bonus: int
    popular: bool = False


@router.get("/packages")
async def get_credit_packages():
    """获取积分套餐列表"""
    packages = [
        {"id": "basic", "credits": 10, "price": 9.9, "bonus": 0, "popular": False},
        {"id": "standard", "credits": 50, "price": 49, "bonus": 5, "popular": True},
        {"id": "pro", "credits": 100, "price": 89, "bonus": 15, "popular": False},
        {"id": "enterprise", "credits": 500, "price": 399, "bonus": 100, "popular": False},
    ]
    return {"packages": packages}


@router.post("/purchase")
async def purchase_credits(
    request: PurchaseRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    购买积分

    实际生产环境中，这里需要：
    1. 创建支付订单
    2. 调用支付网关（支付宝/微信/Stripe）
    3. 等待支付回调
    4. 验证支付结果
    5. 增加用户积分

    这里为了演示，直接模拟支付成功
    """
    supabase = get_supabase_client()

    # 获取套餐信息
    packages = {
        "basic": {"credits": 10, "price": 9.9, "bonus": 0},
        "standard": {"credits": 50, "price": 49, "bonus": 5},
        "pro": {"credits": 100, "price": 89, "bonus": 15},
        "enterprise": {"credits": 500, "price": 399, "bonus": 100},
    }

    package = packages.get(request.package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的套餐ID"
        )

    total_credits = package["credits"] + package["bonus"]

    try:
        # 在实际生产环境中，这里应该：
        # 1. 创建支付订单记录
        # 2. 返回支付链接/二维码
        # 3. 等待支付回调

        # 这里直接模拟支付成功，增加积分
        # 创建交易记录
        transaction_data = {
            "user_id": current_user["id"],
            "amount": total_credits,
            "type": "purchase",
            "description": f"购买积分套餐 - {package['credits']}积分 + {package['bonus']}赠送",
            "created_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("credit_transactions").insert(transaction_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="创建交易记录失败"
            )

        # 更新用户积分
        user_result = supabase.table("users").select("credits").eq("id", current_user["id"]).execute()

        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        current_credits = user_result.data[0].get("credits", 0)
        new_credits = current_credits + total_credits

        update_result = supabase.table("users").update({"credits": new_credits}).eq("id", current_user["id"]).execute()

        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="更新用户积分失败"
            )

        return {
            "success": True,
            "message": "购买成功",
            "credits_added": total_credits,
            "new_balance": new_credits,
            "transaction_id": result.data[0]["id"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"购买失败: {str(e)}"
        )


@router.post("/deduct")
async def deduct_credits(
    amount: int,
    description: str,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    扣除积分

    这个接口应该只被内部服务调用，不应该直接暴露给前端
    """
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="扣除金额必须大于0"
        )

    supabase = get_supabase_client()

    try:
        # 获取当前用户积分
        user_result = supabase.table("users").select("credits").eq("id", current_user["id"]).execute()

        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        current_credits = user_result.data[0].get("credits", 0)

        # 检查积分是否足够
        if current_credits < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="积分不足"
            )

        new_credits = current_credits - amount

        # 更新用户积分
        update_result = supabase.table("users").update({"credits": new_credits}).eq("id", current_user["id"]).execute()

        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="更新用户积分失败"
            )

        # 创建交易记录
        transaction_data = {
            "user_id": current_user["id"],
            "amount": -amount,
            "type": "deduct",
            "description": description,
            "related_project_id": project_id,
            "created_at": datetime.utcnow().isoformat()
        }

        supabase.table("credit_transactions").insert(transaction_data).execute()

        return {
            "success": True,
            "message": "扣除成功",
            "credits_deducted": amount,
            "new_balance": new_credits
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"扣除失败: {str(e)}"
        )


@router.post("/refund")
async def refund_credits(
    amount: int,
    description: str,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """退还积分（生成失败时）"""
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="退还金额必须大于0"
        )

    supabase = get_supabase_client()

    try:
        # 获取当前用户积分
        user_result = supabase.table("users").select("credits").eq("id", current_user["id"]).execute()

        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        current_credits = user_result.data[0].get("credits", 0)
        new_credits = current_credits + amount

        # 更新用户积分
        update_result = supabase.table("users").update({"credits": new_credits}).eq("id", current_user["id"]).execute()

        if not update_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="更新用户积分失败"
            )

        # 创建交易记录
        transaction_data = {
            "user_id": current_user["id"],
            "amount": amount,
            "type": "refund",
            "description": description,
            "related_project_id": project_id,
            "created_at": datetime.utcnow().isoformat()
        }

        supabase.table("credit_transactions").insert(transaction_data).execute()

        return {
            "success": True,
            "message": "退还成功",
            "credits_refunded": amount,
            "new_balance": new_credits
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"退还失败: {str(e)}"
        )


@router.get("/transactions")
async def get_transactions(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """获取交易记录"""
    supabase = get_supabase_client()

    try:
        result = supabase.table("credit_transactions") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()

        return {
            "transactions": result.data or [],
            "total": len(result.data) if result.data else 0
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取交易记录失败: {str(e)}"
        )


@router.get("/balance")
async def get_balance(current_user: dict = Depends(get_current_user)):
    """获取当前积分余额"""
    supabase = get_supabase_client()

    try:
        result = supabase.table("users").select("credits").eq("id", current_user["id"]).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        return {
            "balance": result.data[0].get("credits", 0)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取余额失败: {str(e)}"
        )
