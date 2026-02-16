'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1
            className="text-[120px] font-bold gradient-text mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-2px' }}
          >
            500
          </h1>
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            服务器错误
          </h2>
          <p className="text-lg text-[#A0A0B0] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            抱歉，服务器遇到了一些问题。我们正在努力修复。
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
              <p className="text-sm text-red-400 font-mono">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-400/60 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            重试
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-[#151520] border border-[#2A2A3A] text-white font-medium rounded-full hover:border-[#8B5CF6] transition-colors"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            返回首页
          </Link>
        </div>

        <div className="mt-12">
          <div className="inline-block p-8 bg-[#151520] border border-[#2A2A3A] rounded-2xl">
            <svg
              className="w-32 h-32 text-red-500 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
