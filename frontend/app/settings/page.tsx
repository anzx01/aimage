'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import AvatarUpload from '@/components/AvatarUpload';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth, logout } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ totalProjects: 0, totalVideos: 0, creditsUsed: 0 });

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
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('credits_used')
        .eq('user_id', user!.id);

      if (error) {
        console.warn('加载统计数据失败:', error);
        return;
      }

      const totalProjects = projects?.length || 0;
      const creditsUsed = projects?.reduce((sum, p) => sum + (p.credits_used || 0), 0) || 0;

      setStats({
        totalProjects,
        totalVideos: totalProjects,
        creditsUsed,
      });
    } catch (err) {
      console.error('加载统计数据异常:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      await checkAuth();
      setSuccess('个人信息更新成功');
    } catch (err: any) {
      setError(err.message || '更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码至少需要 6 个字符');
      return;
    }

    setLoading(true);

    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) throw passwordError;

      setSuccess('密码修改成功');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || '密码修改失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return;

    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('退出登录失败:', err);
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
      <main className="max-w-[800px] mx-auto px-8 py-12 w-full" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div>
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-[40px] font-bold gradient-text mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
              账户设置
            </h1>
            <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              管理您的个人信息和账户安全
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Account Stats */}
          <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              个人头像
            </h2>

            <div className="flex justify-center">
              <AvatarUpload
                currentAvatar={user.avatar_url}
                onUploadComplete={(url) => {
                  setSuccess('头像更新成功');
                  checkAuth(); // 刷新用户信息
                }}
                userId={user.id}
              />
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              账户统计
            </h2>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {stats.totalProjects}
                </div>
                <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  总项目数
                </div>
              </div>

              <div className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {stats.totalVideos}
                </div>
                <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  生成视频数
                </div>
              </div>

              <div className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {stats.creditsUsed}
                </div>
                <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  已消耗积分
                </div>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              个人信息
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  姓名
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white placeholder-[#A0A0B0] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="请输入您的姓名"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-[#A0A0B0] cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="mt-2 text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  邮箱地址无法修改
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-base font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {loading ? '保存中...' : '保存修改'}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              修改密码
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white placeholder-[#A0A0B0] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="请输入新密码"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white placeholder-[#A0A0B0] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="请再次输入新密码"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-[#0A0A0F] border border-[#2A2A3A] text-white text-base font-medium rounded-full hover:border-[#8B5CF6]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {loading ? '修改中...' : '修改密码'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#151520] border border-red-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              危险操作
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    退出登录
                  </h3>
                  <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    退出当前账户
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
