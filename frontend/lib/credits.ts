import { supabase } from './supabase';

/**
 * 扣除用户积分
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  projectId?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    // 获取当前积分
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (getUserError) {
      return { success: false, error: '获取用户信息失败' };
    }

    const currentCredits = userData?.credits || 0;

    // 检查积分是否足够
    if (currentCredits < amount) {
      return { success: false, error: '积分不足' };
    }

    const newCredits = currentCredits - amount;

    // 更新用户积分
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: '更新用户积分失败' };
    }

    // 创建交易记录
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'deduct',
        description,
        related_project_id: projectId,
      });

    if (transactionError) {
      console.error('创建交易记录失败:', transactionError);
    }

    return { success: true, newBalance: newCredits };
  } catch (error) {
    console.error('扣除积分失败:', error);
    return { success: false, error: '扣除积分失败' };
  }
}

/**
 * 退还用户积分（生成失败时）
 */
export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  projectId?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    // 获取当前积分
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (getUserError) {
      return { success: false, error: '获取用户信息失败' };
    }

    const currentCredits = userData?.credits || 0;
    const newCredits = currentCredits + amount;

    // 更新用户积分
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: '更新用户积分失败' };
    }

    // 创建交易记录
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'refund',
        description,
        related_project_id: projectId,
      });

    if (transactionError) {
      console.error('创建交易记录失败:', transactionError);
    }

    return { success: true, newBalance: newCredits };
  } catch (error) {
    console.error('退还积分失败:', error);
    return { success: false, error: '退还积分失败' };
  }
}

/**
 * 计算生成视频所需积分
 */
export function calculateCreditsNeeded(mode: 'basic' | 'advanced', duration: number): number {
  if (mode === 'basic') {
    if (duration <= 15) return 1;
    if (duration <= 30) return 2;
    return 3;
  } else {
    if (duration <= 15) return 2;
    if (duration <= 30) return 4;
    return 6;
  }
}

/**
 * 检查用户积分是否足够
 */
export async function checkCreditsAvailable(
  userId: string,
  requiredCredits: number
): Promise<{ available: boolean; currentCredits: number }> {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      return { available: false, currentCredits: 0 };
    }

    const currentCredits = userData?.credits || 0;
    return {
      available: currentCredits >= requiredCredits,
      currentCredits,
    };
  } catch (error) {
    console.error('检查积分失败:', error);
    return { available: false, currentCredits: 0 };
  }
}
