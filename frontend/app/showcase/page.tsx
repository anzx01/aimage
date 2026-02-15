'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { supabase, ShowcaseCase } from '@/lib/supabase';

export default function ShowcasePage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [cases, setCases] = useState<ShowcaseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    fetchCases();
  }, [selectedCategory]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('showcase_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: '全部' },
    { id: '珠宝配饰', name: '珠宝配饰' },
    { id: '女装', name: '女装' },
    { id: '男装', name: '男装' },
    { id: '美妆个护', name: '美妆个护' },
    { id: '家居生活', name: '家居生活' },
  ];

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
          <Link href="/showcase" className="text-sm text-white font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            案例库
          </Link>
          <Link href="/generate" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            一键成片
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#151520] border border-[#2A2A3A] rounded-full">
              <span className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>积分:</span>
              <span className="text-sm font-bold text-[#8B5CF6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {user.credits}
              </span>
            </div>
          )}
          {!authLoading && !user && (
            <Link
              href="/login"
              className="px-6 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-bold rounded-full hover:scale-105 transition-all duration-300"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              登录
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-[120px] py-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-[40px] font-bold gradient-text mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
              优秀案例库
            </h1>
            <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              浏览精选案例，获取创作灵感
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg shadow-[#8B5CF6]/50'
                    : 'bg-[#151520] border border-[#2A2A3A] text-[#A0A0B0] hover:border-[#8B5CF6]'
                }`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Cases Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-[#A0A0B0]">加载中...</div>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[#A0A0B0] mb-4">暂无案例</div>
              <p className="text-sm text-[#A0A0B0]">请稍后再试或选择其他分类</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {cases.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 group cursor-pointer">
                  <div className="relative w-full h-[280px] bg-[#151520] border border-[#2A2A3A] rounded-2xl overflow-hidden group-hover:border-[#8B5CF6] transition-all duration-300">
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                      <span className="px-3 py-1 bg-[#8B5CF6] text-white text-[11px] font-medium rounded-full" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {item.category}
                      </span>
                      <span className="px-3 py-1 bg-[#151520]/90 backdrop-blur-sm border border-[#2A2A3A] text-white text-[11px] rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {item.model_used}
                      </span>
                    </div>
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center z-10">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-full flex items-center justify-center shadow-lg shadow-[#8B5CF6]/50">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span>{item.view_count?.toLocaleString() || 0} views</span>
                      <span>•</span>
                      <span>{item.favorite_count || 0} favorites</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
