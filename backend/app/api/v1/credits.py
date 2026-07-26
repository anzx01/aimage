"""
Credits API endpoints.

Read-only endpoints for the frontend. All write operations (deduct / refund)
are handled internally by the backend service layer via RPC -- they are NOT
exposed as HTTP endpoints to prevent browser-side tampering.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from app.db.supabase import supabase_admin
from app.api.deps import get_current_user_id
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/credits", tags=["Credits"])


class CreditPackage(BaseModel):
    id: str
    credits: int
    price: float
    bonus: int
    popular: bool = False


PACKAGES = [
    {"id": "basic", "credits": 10, "price": 9.9, "bonus": 0, "popular": False},
    {"id": "standard", "credits": 50, "price": 49, "bonus": 5, "popular": True},
    {"id": "pro", "credits": 100, "price": 89, "bonus": 15, "popular": False},
    {"id": "enterprise", "credits": 500, "price": 399, "bonus": 100, "popular": False},
]


@router.get("/packages")
async def get_credit_packages():
    """获取积分套餐列表"""
    return {"packages": PACKAGES}


@router.post("/purchase")
async def purchase_credits(
    package_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    购买积分（沙箱模式）

    在 production 环境下此接口会返回 501，提示支付网关尚未接入。
    在 development 环境下直接模拟充值成功。
    """
    if settings.ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Payment gateway is not yet integrated. Purchases are disabled in production."
        )

    package = next((p for p in PACKAGES if p["id"] == package_id), None)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的套餐ID"
        )

    total_credits = package["credits"] + package["bonus"]

    try:
        # Add credits via RPC (reuse refund RPC which adds credits)
        result = supabase_admin.rpc(
            "refund_user_credits",
            {
                "p_user_id": user_id,
                "p_amount": total_credits,
                "p_description": f"购买积分套餐 - {package['credits']}积分 + {package['bonus']}赠送 (沙箱)",
                "p_reference_id": package_id,
                "p_reference_type": "purchase",
            },
        ).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="充值失败"
            )

        balance_after = result.data.get("balance_after", 0) if isinstance(result.data, dict) else 0

        return {
            "success": True,
            "message": "购买成功（沙箱模式）",
            "credits_added": total_credits,
            "new_balance": balance_after,
            "sandbox": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Purchase failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"购买失败: {str(e)}"
        )


@router.get("/transactions")
async def get_transactions(
    limit: int = 20,
    offset: int = 0,
    user_id: str = Depends(get_current_user_id)
):
    """获取交易记录"""
    try:
        result = (
            supabase_admin.table("credit_transactions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return {
            "transactions": result.data or [],
            "total": len(result.data) if result.data else 0
        }

    except Exception as e:
        logger.error(f"Error fetching transactions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取交易记录失败: {str(e)}"
        )


@router.get("/balance")
async def get_balance(user_id: str = Depends(get_current_user_id)):
    """获取当前积分余额"""
    try:
        result = (
            supabase_admin.table("profiles")
            .select("credits")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        return {
            "balance": result.data.get("credits", 0)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching balance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取余额失败: {str(e)}"
        )
