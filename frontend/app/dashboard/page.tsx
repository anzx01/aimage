'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
          <Link href="/dashboard" className="text-sm text-white font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            工作台
          </Link>
          <Link href="/showcase" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            案例库
          </Link>
          <Link href="/generate" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            一键成片
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#151520] border border-[#2A2A3A] rounded-full">
            <span className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>积分:</span>
            <span className="text-sm font-bold text-[#8B5CF6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user.credits}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-[#A0A0B0] hover:text-white transition-colors"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            退出
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-[120px] py-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-[40px] font-bold gradient-text mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
              欢迎回来，{user.full_name || '创作者'}
            </h1>
            <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              开始创作您的下一个爆款视频
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <Link
              href="/generate"
              className="flex flex-col gap-4 p-8 bg-[#151520] border border-[#2A2A3A] rounded-2xl hover:border-[#8B5CF6] hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🎬</div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  一键成片
                </h3>
                <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  快速生成高质量视频内容
                </p>
              </div>
            </Link>

            <Link
              href="/showcase"
              className="flex flex-col gap-4 p-8 bg-[#151520] border border-[#2A2A3A] rounded-2xl hover:border-[#8B5CF6] hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">✨</div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  案例库
                </h3>
                <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  浏览优秀案例获取灵感
                </p>
              </div>
            </Link>

            <div className="flex flex-col gap-4 p-8 bg-[#151520] border border-[#2A2A3A] rounded-2xl opacity-50 cursor-not-allowed">
              <div className="text-4xl">🚀</div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  我的项目
                </h3>
                <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  管理您的视频项目（即将推出）
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
            <div className="p-6 bg-[#151520] border border-[#2A2A3A] rounded-2xl">
              <div className="text-sm text-[#A0A0B0] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                剩余积分
              </div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {user.credits}
              </div>
            </div>

            <div className="p-6 bg-[#151520] border border-[#2A2A3A] rounded-2xl">
              <div className="text-sm text-[#A0A0B0] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                订阅计划
              </div>
              <div className="text-3xl font-bold text-white capitalize" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {user.subscription_tier}
              </div>
            </div>

            <div className="p-6 bg-[#151520] border border-[#2A2A3A] rounded-2xl">
              <div className="text-sm text-[#A0A0B0] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                已生成视频
              </div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                0
              </div>
            </div>

            <div className="p-6 bg-[#151520] border border-[#2A2A3A] rounded-2xl">
              <div className="text-sm text-[#A0A0B0] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                总观看次数
              </div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                0
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
