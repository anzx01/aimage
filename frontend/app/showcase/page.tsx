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
      // 暂时使用模拟数据，直到数据库更新
      const mockData = generateMockCases(selectedCategory);
      setCases(mockData);

      /*
      // 等数据库更新后再启用
      let query = supabase
        .from('showcase_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase 查询失败，使用模拟数据:', error);
        const mockData = generateMockCases(selectedCategory);
        setCases(mockData);
      } else {
        setCases(data || []);
      }
      */
    } catch (error) {
      console.error('Error fetching cases:', error);
      const mockData = generateMockCases(selectedCategory);
      setCases(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockCases = (category: string): ShowcaseCase[] => {
    // 使用Lorem Picsum免费图片 - 使用固定ID确保图片稳定
    const images = [
      'https://picsum.photos/id/1/800/600', // 钻石项链
      'https://picsum.photos/id/10/800/600', // 女装时尚
      'https://picsum.photos/id/20/800/600', // 男士西装
      'https://picsum.photos/id/30/800/600', // 护肤品
      'https://picsum.photos/id/40/800/600', // 现代家居
      'https://picsum.photos/id/50/800/600', // 耳环
      'https://picsum.photos/id/60/800/600', // 连衣裙
      'https://picsum.photos/id/70/800/600', // 休闲男装
      'https://picsum.photos/id/80/800/600', // 手表
      'https://picsum.photos/id/90/800/600', // 彩妆
      'https://picsum.photos/id/100/800/600', // 北欧家居
      'https://picsum.photos/id/110/800/600', // 香水
    ];

    const allMockCases: ShowcaseCase[] = [
      {
        id: '1',
        title: '高端珠宝展示 - 钻石项链',
        description: '奢华钻石项链产品视频',
        category: '珠宝配饰',
        model_version: 'Kling 1.6',
        video_url: images[0],
        thumbnail_url: images[0],
        view_count: 12500,
        favorite_count: 890,
        tags: ['珠宝', '奢侈品', '钻石'],
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: '时尚女装秋季新品',
        description: '秋季女装系列展示',
        category: '女装',
        model_version: 'Runway Gen-3',
        video_url: images[1],
        thumbnail_url: images[1],
        view_count: 8900,
        favorite_count: 567,
        tags: ['女装', '时尚', '秋季'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        title: '男士商务西装系列',
        description: '专业商务西装展示',
        category: '男装',
        model_version: 'Luma Dream',
        video_url: images[2],
        thumbnail_url: images[2],
        view_count: 6700,
        favorite_count: 423,
        tags: ['男装', '商务', '西装'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        title: '高端护肤品展示',
        description: '奢华护肤品系列',
        category: '美妆个护',
        model_version: 'Kling 1.6',
        video_url: images[3],
        thumbnail_url: images[3],
        view_count: 15600,
        favorite_count: 1200,
        tags: ['护肤', '美妆', '奢侈品'],
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '5',
        title: '现代家居装饰',
        description: '简约现代家居风格',
        category: '家居生活',
        model_version: 'Runway Gen-3',
        video_url: images[4],
        thumbnail_url: images[4],
        view_count: 9800,
        favorite_count: 678,
        tags: ['家居', '装饰', '现代'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '6',
        title: '精致耳环系列',
        description: '时尚耳环产品展示',
        category: '珠宝配饰',
        model_version: 'Luma Dream',
        video_url: images[5],
        thumbnail_url: images[5],
        view_count: 7800,
        favorite_count: 456,
        tags: ['珠宝', '耳环', '配饰'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '7',
        title: '优雅连衣裙系列',
        description: '春夏季连衣裙展示',
        category: '女装',
        model_version: 'Kling 1.6',
        video_url: images[6],
        thumbnail_url: images[6],
        view_count: 11200,
        favorite_count: 823,
        tags: ['女装', '连衣裙', '春夏'],
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '8',
        title: '休闲男装系列',
        description: '舒适休闲风格',
        category: '男装',
        model_version: 'Runway Gen-3',
        video_url: images[7],
        thumbnail_url: images[7],
        view_count: 5400,
        favorite_count: 312,
        tags: ['男装', '休闲', '舒适'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '9',
        title: '奢华手表展示',
        description: '高端腕表系列',
        category: '珠宝配饰',
        model_version: 'Luma Dream',
        video_url: images[8],
        thumbnail_url: images[8],
        view_count: 18900,
        favorite_count: 1456,
        tags: ['手表', '奢侈品', '配饰'],
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '10',
        title: '彩妆产品系列',
        description: '专业彩妆展示',
        category: '美妆个护',
        model_version: 'Kling 1.6',
        video_url: images[9],
        thumbnail_url: images[9],
        view_count: 13400,
        favorite_count: 967,
        tags: ['彩妆', '美妆', '化妆品'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '11',
        title: '北欧风家居',
        description: '简约北欧风格装饰',
        category: '家居生活',
        model_version: 'Runway Gen-3',
        video_url: images[10],
        thumbnail_url: images[10],
        view_count: 8700,
        favorite_count: 534,
        tags: ['家居', '北欧', '简约'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '12',
        title: '香水产品展示',
        description: '高端香水系列',
        category: '美妆个护',
        model_version: 'Luma Dream',
        video_url: images[11],
        thumbnail_url: images[11],
        view_count: 10500,
        favorite_count: 721,
        tags: ['香水', '美妆', '奢侈品'],
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    if (category === 'all') {
      return allMockCases;
    }
    return allMockCases.filter(c => c.category === category);
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
