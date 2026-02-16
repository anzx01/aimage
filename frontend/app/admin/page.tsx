'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalCredits: number;
  activeUsers: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  credits: number;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProjects: 0,
    totalCredits: 0,
    activeUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects'>('overview');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 加载统计数据
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      const { data: creditData } = await supabase
        .from('users')
        .select('credits');

      const totalCredits = creditData?.reduce((sum, u) => sum + (u.credits || 0), 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalProjects: projectCount || 0,
        totalCredits,
        activeUsers: Math.floor((userCount || 0) * 0.7), // 模拟活跃用户
      });

      // 加载用户列表
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, full_name, credits, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#A0A0B0]">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />

      <main className="px-[120px] py-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1
              className="text-[40px] font-bold gradient-text mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}
            >
              管理后台
            </h1>
            <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              系统数据统计和管理
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            {[
              { id: 'overview', label: '概览' },
              { id: 'users', label: '用户管理' },
              { id: 'projects', label: '项目管理' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg shadow-[#8B5CF6]/50'
                    : 'bg-[#151520] border border-[#2A2A3A] text-[#A0A0B0] hover:border-[#8B5CF6]'
                }`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: '总用户数', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-cyan-500' },
                  { label: '总项目数', value: stats.totalProjects, icon: '📁', color: 'from-purple-500 to-pink-500' },
                  { label: '总积分数', value: stats.totalCredits, icon: '💎', color: 'from-yellow-500 to-orange-500' },
                  { label: '活跃用户', value: stats.activeUsers, icon: '⚡', color: 'from-green-500 to-emerald-500' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-6 hover:border-[#8B5CF6] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{stat.icon}</span>
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} opacity-20`} />
                    </div>
                    <div
                      className="text-3xl font-bold text-white mb-2"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8">
                <h2
                  className="text-xl font-bold text-white mb-6"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  最近活动
                </h2>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-full flex items-center justify-center text-white font-bold">
                          U
                        </div>
                        <div>
                          <div className="text-sm text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            用户创建了新项目
                          </div>
                          <div className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {i} 分钟前
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#8B5CF6] px-3 py-1 bg-[#8B5CF6]/20 rounded-full">
                        新项目
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8">
              <h2
                className="text-xl font-bold text-white mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                用户列表
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2A3A]">
                      <th className="text-left py-4 px-4 text-sm font-medium text-[#A0A0B0]">邮箱</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-[#A0A0B0]">姓名</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-[#A0A0B0]">积分</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-[#A0A0B0]">注册时间</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-[#A0A0B0]">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-[#2A2A3A] hover:bg-[#0A0A0F] transition-colors">
                        <td className="py-4 px-4 text-sm text-white">{user.email}</td>
                        <td className="py-4 px-4 text-sm text-white">{user.full_name || '-'}</td>
                        <td className="py-4 px-4 text-sm text-[#8B5CF6] font-bold">{user.credits}</td>
                        <td className="py-4 px-4 text-sm text-[#A0A0B0]">
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8">
              <h2
                className="text-xl font-bold text-white mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                项目管理
              </h2>
              <div className="text-center py-20">
                <div className="text-[#A0A0B0] mb-4">项目管理功能开发中...</div>
                <p className="text-sm text-[#A0A0B0]">即将推出</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
