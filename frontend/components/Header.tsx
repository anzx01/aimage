'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="flex items-center justify-between px-4 md:px-8 lg:px-[120px] h-16 md:h-20 border-b border-[#2A2A3A] bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-lg" />
        <Link href="/dashboard">
          <span className="text-lg md:text-xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AIMAGE
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-8">
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
          href="/digital-humans"
          className={`text-sm transition-colors ${isActive('/digital-humans') ? 'text-white font-medium' : 'text-[#A0A0B0] hover:text-white'}`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          数字人
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

      <div className="flex items-center gap-2 md:gap-4">
        {/* Credits Display */}
        <Link href="/credits" className="hidden md:block">
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#151520] border border-[#2A2A3A] rounded-full hover:border-[#8B5CF6]/50 transition-colors cursor-pointer">
            <span className="text-xs md:text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>积分:</span>
            <span className="text-xs md:text-sm font-bold text-[#8B5CF6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user?.credits || 0}
            </span>
          </div>
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-full flex items-center justify-center text-white font-bold hover:scale-105 transition-transform text-sm md:text-base"
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden w-9 h-9 flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showMobileMenu ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-16 md:top-20 left-0 right-0 bg-[#0A0A0F] border-b border-[#2A2A3A] shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            <Link
              href="/dashboard"
              className={`px-4 py-3 rounded-lg text-sm transition-colors ${isActive('/dashboard') ? 'bg-[#151520] text-white font-medium' : 'text-[#A0A0B0] hover:bg-[#151520] hover:text-white'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={() => setShowMobileMenu(false)}
            >
              工作台
            </Link>
            <Link
              href="/projects"
              className={`px-4 py-3 rounded-lg text-sm transition-colors ${isActive('/projects') ? 'bg-[#151520] text-white font-medium' : 'text-[#A0A0B0] hover:bg-[#151520] hover:text-white'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={() => setShowMobileMenu(false)}
            >
              我的项目
            </Link>
            <Link
              href="/digital-humans"
              className={`px-4 py-3 rounded-lg text-sm transition-colors ${isActive('/digital-humans') ? 'bg-[#151520] text-white font-medium' : 'text-[#A0A0B0] hover:bg-[#151520] hover:text-white'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={() => setShowMobileMenu(false)}
            >
              数字人
            </Link>
            <Link
              href="/showcase"
              className={`px-4 py-3 rounded-lg text-sm transition-colors ${isActive('/showcase') ? 'bg-[#151520] text-white font-medium' : 'text-[#A0A0B0] hover:bg-[#151520] hover:text-white'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={() => setShowMobileMenu(false)}
            >
              案例库
            </Link>
            <Link
              href="/generate"
              className={`px-4 py-3 rounded-lg text-sm transition-colors ${isActive('/generate') ? 'bg-[#151520] text-white font-medium' : 'text-[#A0A0B0] hover:bg-[#151520] hover:text-white'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={() => setShowMobileMenu(false)}
            >
              一键成片
            </Link>
            <Link
              href="/credits"
              className="md:hidden px-4 py-3 rounded-lg text-sm text-[#A0A0B0] hover:bg-[#151520] hover:text-white transition-colors flex items-center justify-between"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={() => setShowMobileMenu(false)}
            >
              <span>积分充值</span>
              <span className="text-[#8B5CF6] font-bold">{user?.credits || 0}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
