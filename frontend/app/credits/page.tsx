'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface Package {
  id: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function CreditsPage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && showHistory) {
      loadTransactions();
    }
  }, [user, showHistory]);

  const loadTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/credits/transactions?limit=20`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        setTransactions([]);
        return;
      }

      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('加载交易记录异常:', err);
      setTransactions([]);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const packages: Package[] = [
    { id: 'basic', credits: 10, price: 9.9, bonus: 0 },
    { id: 'standard', credits: 50, price: 49, bonus: 5, popular: true },
    { id: 'pro', credits: 100, price: 89, bonus: 15 },
    { id: 'enterprise', credits: 500, price: 399, bonus: 100 },
  ];

  const handlePurchase = async (packageId: string) => {
    setSelectedPackage(packageId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('请先登录');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/credits/purchase?package_id=${packageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || '购买失败');
        return;
      }

      alert(`购买成功（沙箱模式）！获得 ${data.credits_added} 积分，当前余额：${data.new_balance} 积分`);
      await checkAuth();
      if (showHistory) loadTransactions();
    } catch (error) {
      console.error('购买失败:', error);
      alert('购买失败，请稍后重试');
    } finally {
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <header className="flex items-center justify-between px-[120px] h-20 border-b border-[#2A2A3A] bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-lg" />
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AIMAGE
          </span>
        </div>

        <nav className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            工作台
          </Link>
          <Link href="/generate" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            一键成片
          </Link>
          <Link href="/digital-humans" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            数字人
          </Link>
          <Link href="/projects" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            我的项目
          </Link>
          <Link href="/showcase" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            案例库
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#151520] border border-[#2A2A3A] rounded-full">
            <span className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>积分:</span>
            <span className="text-sm font-bold text-[#8B5CF6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user.credits}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-8 py-12 w-full" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div>
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-[40px] font-bold gradient-text mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
              积分充值
            </h1>
            <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              选择适合您的积分套餐，开始创作精彩视频
            </p>
          </div>

          {/* Current Balance */}
          <div className="bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 border border-[#8B5CF6]/30 rounded-2xl p-8 mb-12 text-center">
            <div className="text-sm text-[#A0A0B0] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              当前余额
            </div>
            <div className="text-5xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user.credits} 积分
            </div>
          </div>

          {/* Packages */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-[#151520] border-2 rounded-2xl p-8 transition-all duration-300 ${
                  pkg.popular
                    ? 'border-[#8B5CF6] scale-105'
                    : 'border-[#2A2A3A] hover:border-[#8B5CF6]/50'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-xs font-bold rounded-full">
                    最受欢迎
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {pkg.credits}
                  </div>
                  <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    积分
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="mt-2 text-xs text-green-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      + {pkg.bonus} 赠送积分
                    </div>
                  )}
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ¥{pkg.price}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  className={`w-full px-6 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white hover:scale-105'
                      : 'bg-[#0A0A0F] border border-[#2A2A3A] text-white hover:border-[#8B5CF6]/50'
                  }`}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  立即购买
                </button>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              积分使用说明
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎬</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    基础模式
                  </h3>
                  <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    15秒视频消耗 1 积分<br />
                    30秒视频消耗 2 积分<br />
                    60秒视频消耗 3 积分
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#EC4899]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    高级模式
                  </h3>
                  <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    15秒视频消耗 2 积分<br />
                    30秒视频消耗 4 积分<br />
                    60秒视频消耗 6 积分
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    永久有效
                  </h3>
                  <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    积分永久有效，无使用期限
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    失败退款
                  </h3>
                  <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    生成失败自动退还积分
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                使用记录
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-[#0A0A0F] border border-[#2A2A3A] text-white text-sm font-medium rounded-lg hover:border-[#8B5CF6]/50 transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {showHistory ? '隐藏' : '查看历史'}
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    暂无交易记录
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.transaction_type === 'purchase' ? 'bg-green-500/10' :
                          transaction.transaction_type === 'refund' ? 'bg-blue-500/10' :
                          'bg-red-500/10'
                        }`}>
                          <span className="text-xl">
                            {transaction.transaction_type === 'purchase' ? '💰' :
                             transaction.transaction_type === 'refund' ? '🔄' :
                             '📹'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            {transaction.description}
                          </div>
                          <div className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {new Date(transaction.created_at).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
