import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  user?: {
    credits: number;
    full_name?: string;
  };
  onLogout?: () => void;
  currentPath?: string;
}

export function Header({ user, onLogout, currentPath = '/dashboard' }: HeaderProps) {
  const navItems = [
    { href: '/dashboard', label: '工作台' },
    { href: '/generate', label: '一键成片' },
    { href: '/digital-humans', label: '数字人' },
    { href: '/projects', label: '我的项目' },
    { href: '/showcase', label: '案例库' },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(11, 17, 32, 0.8)', borderColor: 'rgba(217, 158, 70, 0.1)' }}>
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-baseline gap-3 group">
            <div className="w-2 h-2 rounded-full transition-all duration-300 group-hover:w-8" style={{ background: '#D99E46' }} />
            <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF' }}>
              AIMAGE
            </span>
          </Link>

          <nav className="flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm tracking-wide uppercase transition-colors duration-300 ${
                  currentPath === item.href ? '' : 'hover:text-white'
                }`}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  color: currentPath === item.href ? '#FFFFFF' : '#8B9BB5',
                  fontWeight: 500
                }}
              >
                {item.label}
                {currentPath === item.href && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5" style={{ background: '#D99E46' }} />
                )}
              </Link>
            ))}
          </nav>

          {user && (
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
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-sm transition-colors duration-300 hover:text-white"
                  style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}
                >
                  退出
                </button>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
