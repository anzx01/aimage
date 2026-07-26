'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase, ShowcaseCase } from '@/lib/supabase';
import Header from '@/components/Header';

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

      if (error) {
        console.error('Error fetching cases:', error);
        setCases([]);
      } else {
        setCases(data || []);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setCases([]);
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
      <Header />

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 w-full" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-[40px] font-bold gradient-text mb-3 md:mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
              优秀案例库
            </h1>
            <p className="text-base md:text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              浏览精选案例，获取创作灵感
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {cases.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 md:gap-4 group cursor-pointer">
                  <div
                    className="relative w-full h-[200px] md:h-[240px] lg:h-[280px] bg-[#151520] border border-[#2A2A3A] rounded-2xl overflow-hidden group-hover:border-[#8B5CF6] transition-all duration-300"
                  >
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                      <span className="px-3 py-1 bg-[#8B5CF6] text-white text-[11px] font-medium rounded-full" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {item.category}
                      </span>
                      <span className="px-3 py-1 bg-[#151520]/90 backdrop-blur-sm border border-[#2A2A3A] text-white text-[11px] rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {item.model_version}
                      </span>
                    </div>
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
