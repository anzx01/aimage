'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, checkAuth, logout } = useAuthStore();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // 加载最近项目
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, status, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (projectsError) throw projectsError;
      setRecentProjects(projects || []);

      // 加载统计数据
      const { count: totalCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      const { count: completedCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'completed');

      setStats({
        totalProjects: totalCount || 0,
        completedProjects: completedCount || 0,
      });
    } catch (err) {
      console.error('加载数据失败:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;700&display=swap');
        `}</style>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #1A1F35 50%, #0F1419 100%)' }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-[#D99E46] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>加载中...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;700&display=swap');

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }

        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #1A1F35 50%, #0F1419 100%)' }}>
        {/* Subtle Grid Pattern */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#D99E46 1px, transparent 1px), linear-gradient(90deg, #D99E46 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(11, 17, 32, 0.8)', borderColor: 'rgba(217, 158, 70, 0.1)' }}>
          <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-baseline gap-3 group">
              <div className="w-2 h-2 rounded-full transition-all duration-300 group-hover:w-8" style={{ background: '#D99E46' }} />
              <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF' }}>
                AIMAGE
              </span>
            </Link>

            <nav className="flex items-center gap-10">
              <Link href="/dashboard" className="relative text-sm tracking-wide uppercase group" style={{ fontFamily: 'DM Sans, sans-serif', color: '#FFFFFF', fontWeight: 500 }}>
                工作台
                <div className="absolute -bottom-1 left-0 w-full h-0.5" style={{ background: '#D99E46' }} />
              </Link>
              <Link href="/showcase" className="text-sm tracking-wide uppercase transition-colors duration-300 hover:text-white" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 500 }}>
                案例库
              </Link>
              <Link href="/generate" className="text-sm tracking-wide uppercase transition-colors duration-300 hover:text-white" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 500 }}>
                一键成片
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-sm" style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.2)' }}>
                <span className="text-xs tracking-wider uppercase" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 500 }}>积分</span>
                <span className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#D99E46' }}>
                  {user.credits}
                </span>
              </div>
              <Link
                href="/credits"
                className="px-5 py-2.5 rounded-full text-xs tracking-wider uppercase font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  background: 'linear-gradient(135deg, #D99E46 0%, #B8823D 100%)',
                  color: '#0B1120',
                  boxShadow: '0 4px 20px rgba(217, 158, 70, 0.3)'
                }}
              >
                充值
              </Link>
              <Link
                href="/settings"
                className="text-sm transition-colors duration-300 hover:text-white"
                style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}
              >
                设置
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm transition-colors duration-300 hover:text-white"
                style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}
              >
                退出
              </button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-16">
        {/* Welcome Section */}
        <div className="mb-20 animate-slide-in">
          <div className="flex items-baseline gap-4 mb-4">
            <div className="w-1 h-12" style={{ background: 'linear-gradient(180deg, #D99E46 0%, transparent 100%)' }} />
            <div>
              <p className="text-sm tracking-[0.2em] uppercase mb-2" style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46', fontWeight: 500 }}>
                DASHBOARD
              </p>
              <h1 className="text-5xl leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                欢迎回来，<br />
                <span style={{ color: '#D99E46' }}>{user.full_name || '创作者'}</span>
              </h1>
            </div>
          </div>
          <p className="text-lg ml-8 max-w-2xl" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', lineHeight: '1.8' }}>
            开始创作您的下一个爆款视频，让创意在这里绽放。
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-8 mb-20">
          <Link
            href="/generate"
            className="group relative p-10 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-slide-in stagger-1"
            style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.2)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" style={{ background: '#D99E46' }} />
            <div className="relative">
              <div className="text-5xl mb-6 transition-transform duration-500 group-hover:scale-110">🎬</div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#FFFFFF' }}>
                一键成片
              </h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>
                快速生成高质量视频内容，<br />让创作变得简单高效
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs tracking-wider uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46', fontWeight: 600 }}>
                <span>开始创作</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          <Link
            href="/showcase"
            className="group relative p-10 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-slide-in stagger-2"
            style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.2)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" style={{ background: '#D99E46' }} />
            <div className="relative">
              <div className="text-5xl mb-6 transition-transform duration-500 group-hover:scale-110">✨</div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#FFFFFF' }}>
                案例库
              </h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>
                浏览优秀案例获取灵感，<br />探索无限创作可能
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs tracking-wider uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46', fontWeight: 600 }}>
                <span>浏览案例</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          <Link
            href="/projects"
            className="group relative p-10 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-slide-in stagger-3"
            style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.2)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" style={{ background: '#D99E46' }} />
            <div className="relative">
              <div className="text-5xl mb-6 transition-transform duration-500 group-hover:scale-110">🚀</div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#FFFFFF' }}>
                我的项目
              </h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>
                管理您的视频项目，<br />追踪创作进度
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs tracking-wider uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46', fontWeight: 600 }}>
                <span>查看项目</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div className="mb-20 animate-slide-in stagger-4">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-baseline gap-4">
                  <div className="w-1 h-8" style={{ background: 'linear-gradient(180deg, #D99E46 0%, transparent 100%)' }} />
                  <h2 className="text-3xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#FFFFFF' }}>
                    最近项目
                  </h2>
                </div>
                <Link
                  href="/projects"
                  className="flex items-center gap-2 text-sm tracking-wider uppercase transition-colors duration-300 hover:text-white"
                  style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46', fontWeight: 600 }}
                >
                  <span>查看全部</span>
                  <span>→</span>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {recentProjects.map((project, index) => {
                  const statusConfig = {
                    draft: { label: '草稿', color: '#8B9BB5', bg: 'rgba(139, 155, 181, 0.1)' },
                    processing: { label: '生成中', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.1)' },
                    completed: { label: '已完成', color: '#34D399', bg: 'rgba(52, 211, 153, 0.1)' },
                    failed: { label: '失败', color: '#F87171', bg: 'rgba(248, 113, 113, 0.1)' },
                  };
                  const status = statusConfig[project.status as keyof typeof statusConfig];

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group p-8 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                      style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.15)' }}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <h3 className="text-xl flex-1 transition-colors duration-300 group-hover:text-[#D99E46]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#FFFFFF' }}>
                          {project.title}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs tracking-wider uppercase" style={{ fontFamily: 'DM Sans, sans-serif', background: status.bg, color: status.color, fontWeight: 600 }}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>
                        {new Date(project.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
            <div className="p-8 rounded-2xl border backdrop-blur-sm" style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.15)' }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 500 }}>
                剩余积分
              </div>
              <div className="text-4xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#D99E46' }}>
                {user.credits}
              </div>
            </div>

            <div className="p-8 rounded-2xl border backdrop-blur-sm" style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.15)' }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 500 }}>
                订阅计划
              </div>
              <div className="text-4xl capitalize" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF' }}>
                {user.subscription_tier}
              </div>
            </div>

            <div className="p-8 rounded-2xl border backdrop-blur-sm" style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.15)' }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 500 }}>
                总项目数
              </div>
              <div className="text-4xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF' }}>
                {stats.totalProjects}
              </div>
            </div>

            <div className="p-8 rounded-2xl border backdrop-blur-sm" style={{ background: 'rgba(26, 31, 53, 0.4)', borderColor: 'rgba(217, 158, 70, 0.15)' }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 500 }}>
                已完成
              </div>
              <div className="text-4xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF' }}>
                {stats.completedProjects}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
