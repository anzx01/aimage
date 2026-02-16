'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="flex items-center justify-between px-[120px] h-20 border-b border-[#2A2A3A] bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-lg" />
        <Link href="/dashboard">
          <span className="text-xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AIMAGE
          </span>
        </Link>
      </div>

      <nav className="flex items-center gap-8">
        <Link
          href="/dashboard"
          className={`text-sm transition-colors ${isActive('/dashboard') ? 'text-white font-medium' : 'text-[#A0A0B0] hover:text-white'}`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          工作台
        </Link>
        <Link
          href="/projects"
          className={`text-sm transition-colors ${isActive('/projects') ? 'text-white font-medium' : 'text-[#A0A0B0] hover:text-white'}`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          我的项目
        </Link>
        <Link
          href="/showcase"
          className={`text-sm transition-colors ${isActive('/showcase') ? 'text-white font-medium' : 'text-[#A0A0B0] hover:text-white'}`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          案例库
        </Link>
        <Link
          href="/generate"
          className={`text-sm transition-colors ${isActive('/generate') ? 'text-white font-medium' : 'text-[#A0A0B0] hover:text-white'}`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          一键成片
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/credits">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#151520] border border-[#2A2A3A] rounded-full hover:border-[#8B5CF6]/50 transition-colors cursor-pointer">
            <span className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>积分:</span>
            <span className="text-sm font-bold text-[#8B5CF6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user?.credits || 0}
            </span>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-full flex items-center justify-center text-white font-bold hover:scale-105 transition-transform"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#151520] border border-[#2A2A3A] rounded-lg shadow-lg overflow-hidden">
              <Link
                href="/settings"
                className="block px-4 py-3 text-sm text-white hover:bg-[#0A0A0F] transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                onClick={() => setShowUserMenu(false)}
              >
                账户设置
              </Link>
              <Link
                href="/credits"
                className="block px-4 py-3 text-sm text-white hover:bg-[#0A0A0F] transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                onClick={() => setShowUserMenu(false)}
              >
                积分充值
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
