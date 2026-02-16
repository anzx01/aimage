import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, project_id } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, detail: '退还金额必须大于0' },
        { status: 400 }
      );
    }

    // 获取当前用户
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, detail: '未授权' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return NextResponse.json(
        { success: false, detail: '用户认证失败' },
        { status: 401 }
      );
    }

    // 获取当前积分
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (getUserError) {
      return NextResponse.json(
        { success: false, detail: '获取用户信息失败' },
        { status: 500 }
      );
    }

    const current_credits = userData?.credits || 0;
    const new_credits = current_credits + amount;

    // 更新用户积分
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: new_credits })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, detail: '更新用户积分失败' },
        { status: 500 }
      );
    }

    // 创建交易记录
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        type: 'refund',
        description: description || '积分退还',
        related_project_id: project_id,
      });

    if (transactionError) {
      console.error('创建交易记录失败:', transactionError);
    }

    return NextResponse.json({
      success: true,
      message: '退还成功',
      credits_refunded: amount,
      new_balance: new_credits,
    });
  } catch (error) {
    console.error('退还失败:', error);
    return NextResponse.json(
      { success: false, detail: '退还失败' },
      { status: 500 }
    );
  }
}
