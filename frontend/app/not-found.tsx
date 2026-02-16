import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1
            className="text-[120px] font-bold gradient-text mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-2px' }}
          >
            404
          </h1>
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            页面未找到
          </h2>
          <p className="text-lg text-[#A0A0B0] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            抱歉，您访问的页面不存在或已被移除
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            返回首页
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#151520] border border-[#2A2A3A] text-white font-medium rounded-full hover:border-[#8B5CF6] transition-colors"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            前往工作台
          </Link>
        </div>

        <div className="mt-12">
          <div className="inline-block p-8 bg-[#151520] border border-[#2A2A3A] rounded-2xl">
            <svg
              className="w-32 h-32 text-[#8B5CF6] opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
