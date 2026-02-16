import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { package_id, payment_method } = body;

    // 获取当前用户
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, detail: '未授权' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // 获取套餐信息
    const packages: Record<string, { credits: number; price: number; bonus: number }> = {
      basic: { credits: 10, price: 9.9, bonus: 0 },
      standard: { credits: 50, price: 49, bonus: 5 },
      pro: { credits: 100, price: 89, bonus: 15 },
      enterprise: { credits: 500, price: 399, bonus: 100 },
    };

    const pkg = packages[package_id];
    if (!pkg) {
      return NextResponse.json(
        { success: false, detail: '无效的套餐ID' },
        { status: 400 }
      );
    }

    const total_credits = pkg.credits + pkg.bonus;

    // 获取当前用户信息
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('用户认证失败:', userError);
      return NextResponse.json(
        { success: false, detail: '用户认证失败' },
        { status: 401 }
      );
    }

    // 在实际生产环境中，这里应该：
    // 1. 创建支付订单
    // 2. 调用支付网关（支付宝/微信/Stripe）
    // 3. 返回支付链接
    // 4. 等待支付回调

    // 这里直接模拟支付成功
    // 创建交易记录
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: total_credits,
        type: 'purchase',
        description: `购买积分套餐 - ${pkg.credits}积分 + ${pkg.bonus}赠送`,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('创建交易记录失败:', transactionError);
      return NextResponse.json(
        { success: false, detail: '创建交易记录失败' },
        { status: 500 }
      );
    }

    // 获取当前积分
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (getUserError) {
      console.error('获取用户信息失败:', getUserError);
      return NextResponse.json(
        { success: false, detail: '获取用户信息失败' },
        { status: 500 }
      );
    }

    const current_credits = userData?.credits || 0;
    const new_credits = current_credits + total_credits;

    // 更新用户积分
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: new_credits })
      .eq('id', user.id);

    if (updateError) {
      console.error('更新用户积分失败:', updateError);
      return NextResponse.json(
        { success: false, detail: '更新用户积分失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '购买成功',
      credits_added: total_credits,
      new_balance: new_credits,
      transaction_id: transaction.id,
    });
  } catch (error) {
    console.error('购买失败:', error);
    return NextResponse.json(
      { success: false, detail: `购买失败: ${error}` },
      { status: 500 }
    );
  }
}
