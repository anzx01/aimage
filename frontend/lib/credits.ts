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
