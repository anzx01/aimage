'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;700&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(217, 158, 70, 0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #1A1F35 50%, #0F1419 100%)' }}>
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #D99E46 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float-delayed" style={{ background: 'radial-gradient(circle, #2A5A7F 0%, transparent 70%)' }} />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#D99E46 1px, transparent 1px), linear-gradient(90deg, #D99E46 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Branding */}
            <div className="hidden lg:block space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <div className="flex items-baseline gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#D99E46' }} />
                    <span className="text-sm tracking-[0.3em] uppercase" style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46', fontWeight: 500 }}>
                      AI VIDEO STUDIO
                    </span>
                  </div>
                  <h1 className="text-7xl leading-[0.95] mb-6" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    AIMAGE
                  </h1>
                </div>
                <p className="text-xl leading-relaxed max-w-md" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 400 }}>
                  创造力与技术的完美融合，<br />让每一帧都成为艺术。
                </p>
              </div>

              {/* Decorative Quote */}
              <div className="relative pl-8 py-6 border-l-2" style={{ borderColor: '#D99E46' }}>
                <div className="absolute -left-1 top-0 w-2 h-16" style={{ background: 'linear-gradient(180deg, #D99E46 0%, transparent 100%)' }} />
                <p className="text-lg italic leading-relaxed" style={{ fontFamily: 'Playfair Display, serif', color: '#C5D0E6', fontWeight: 400 }}>
                  "视频创作的未来，<br />始于此刻的登录。"
                </p>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-12 text-center">
                <h1 className="text-5xl mb-2" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#FFFFFF' }}>
                  AIMAGE
                </h1>
                <p className="text-sm tracking-[0.2em] uppercase" style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46' }}>
                  AI VIDEO STUDIO
                </p>
              </div>

              <div className="relative backdrop-blur-xl rounded-3xl p-10 border" style={{ background: 'rgba(26, 31, 53, 0.6)', borderColor: 'rgba(217, 158, 70, 0.2)' }}>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 rounded-3xl shimmer pointer-events-none" />

                <div className="relative">
                  <div className="mb-8">
                    <h2 className="text-3xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                      欢迎回来
                    </h2>
                    <p className="text-base" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', fontWeight: 400 }}>
                      登录您的账户继续创作之旅
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 rounded-xl border backdrop-blur-sm" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)' }}>
                      <p className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif', color: '#FCA5A5', fontWeight: 500 }}>
                        {error}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm tracking-wide uppercase" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C5D0E6', fontWeight: 500, letterSpacing: '0.05em' }}>
                        邮箱地址
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full px-5 py-4 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-[#D99E46] focus:shadow-lg"
                        placeholder="your@email.com"
                        style={{
                          fontFamily: 'DM Sans, sans-serif',
                          background: 'rgba(11, 17, 32, 0.5)',
                          borderColor: 'rgba(139, 155, 181, 0.2)',
                          color: '#FFFFFF',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm tracking-wide uppercase" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C5D0E6', fontWeight: 500, letterSpacing: '0.05em' }}>
                        密码
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-5 py-4 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-[#D99E46] focus:shadow-lg"
                        placeholder="••••••••"
                        style={{
                          fontFamily: 'DM Sans, sans-serif',
                          background: 'rgba(11, 17, 32, 0.5)',
                          borderColor: 'rgba(139, 155, 181, 0.2)',
                          color: '#FFFFFF',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-8 py-4 rounded-xl font-bold tracking-wide uppercase transition-all duration-500 hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        background: 'linear-gradient(135deg, #D99E46 0%, #B8823D 100%)',
                        color: '#0B1120',
                        fontSize: '14px',
                        letterSpacing: '0.1em',
                        boxShadow: '0 10px 40px rgba(217, 158, 70, 0.3)'
                      }}
                    >
                      <span className="relative z-10">{loading ? '登录中...' : '登录'}</span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    </button>
                  </form>

                  <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: 'rgba(139, 155, 181, 0.1)' }}>
                    <p className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>
                      还没有账户？{' '}
                      <Link href="/signup" className="font-semibold transition-colors duration-300" style={{ color: '#D99E46' }}>
                        立即注册
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-sm transition-colors duration-300 hover:text-white" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>
                  <span>←</span>
                  <span>返回首页</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
