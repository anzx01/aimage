'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  // 使用免费商用图片
  const showcaseItems = [
    {
      category: '珠宝配饰',
      title: '翡翠手串展示',
      views: '2.3M',
      model: 'Veo3.1 Fast',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
    },
    {
      category: '女装',
      title: '白色西装套装',
      views: '1.8M',
      model: 'Sora2渠道版',
      imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80'
    },
    {
      category: '女装',
      title: '酒红色连衣裙',
      views: '3.1M',
      model: 'Veo3.1 Fast',
      imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80'
    },
    {
      category: '美妆个护',
      title: '护肤品测评',
      views: '1.5M',
      model: 'Sora2渠道版',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
    },
    {
      category: '男装',
      title: '黑色卫衣穿搭',
      views: '2.7M',
      model: 'Veo3.1 Fast',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80'
    },
    {
      category: '女装',
      title: '米色针织套装',
      views: '1.9M',
      model: 'Sora2渠道版',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'
    }
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-[120px] h-20 border-b border-[#E8E8E8]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E42313]" />
          <span className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AIMAGE
          </span>
        </div>

        <nav className="flex items-center gap-8">
          <Link href="#features" className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Features
          </Link>
          <Link href="#pricing" className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Pricing
          </Link>
          <Link href="#showcase" className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Showcase
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-medium"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center px-[120px] py-[120px] gap-12">
        <div className="flex items-center gap-2 px-4 py-2 border border-[#E8E8E8]">
          <div className="w-1.5 h-1.5 bg-[#E42313]" />
          <span className="text-[13px] font-medium text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AI-Powered Video Generation Platform
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 w-[800px]">
          <h1
            className="text-[56px] font-semibold text-[#0D0D0D] text-center leading-[1.2]"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-1px' }}
          >
            从创意到爆款
            <br />
            只需一键生成
          </h1>
          <p className="text-lg text-[#7A7A7A] text-center leading-[1.6] w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            聚合顶级AI模型，一站式生成TikTok爆款视频。从内容创作到多渠道分发，让每个跨境卖家都能轻松打造爆款内容
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-8 py-4 bg-[#E42313] text-white text-base font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            免费开始创作
          </Link>
          <Link
            href="#showcase"
            className="px-8 py-4 border border-[#E8E8E8] text-[#0D0D0D] text-base font-medium"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            查看案例
          </Link>
        </div>

        <div className="relative w-[1000px] h-[560px] bg-[#FAFAFA] border border-[#E8E8E8] overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&q=80"
            alt="Product Dashboard"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm">
              <div className="w-3 h-3 bg-[#E42313] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                AI视频生成平台 · 实时预览
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="flex flex-col items-center px-[120px] py-[60px] gap-8">
        <p className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Trusted by 10,000+ creators worldwide
        </p>
        <div className="flex items-center gap-12">
          {['TikTok', 'Shopify', 'Amazon', 'AliExpress'].map((brand) => (
            <span key={brand} className="text-xl font-semibold text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="flex flex-col items-center px-[120px] py-[120px] gap-16 bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4 w-[600px]">
          <h2 className="text-[40px] font-semibold text-[#0D0D0D] text-center" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            一站式AI视频生成平台
          </h2>
          <p className="text-base text-[#7A7A7A] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            从创意到发布，全流程AI赋能，让视频创作变得简单高效
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full">
          {[
            {
              title: 'AI智能生成',
              description: '聚合Seedance 2.0、Wan2.6等顶级AI模型，一键生成高质量视频内容',
              icon: '🎬'
            },
            {
              title: '提示词优化',
              description: '智能优化用户输入，自动生成专业级视频生成提示词，提升生成质量',
              icon: '✨'
            },
            {
              title: '多渠道分发',
              description: '一键分发至TikTok、Instagram等多个平台，扩大内容影响力',
              icon: '🚀'
            }
          ].map((feature, index) => (
            <div key={index} className="flex flex-col gap-6 p-8 bg-white border border-[#E8E8E8]">
              <div className="text-4xl">{feature.icon}</div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-[#7A7A7A] leading-[1.6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="flex flex-col items-center px-[120px] py-[120px] gap-16">
        <div className="flex flex-col items-center gap-4 w-[600px]">
          <h2 className="text-[40px] font-semibold text-[#0D0D0D] text-center" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            灵活的定价方案
          </h2>
          <p className="text-base text-[#7A7A7A] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            选择适合您的方案，随时升级或降级
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full">
          {[
            {
              name: '免费版',
              price: '¥0',
              period: '永久免费',
              features: ['10 积分/月', '基础视频生成', '标准画质', '社区支持'],
              cta: '开始使用',
              highlight: false
            },
            {
              name: '专业版',
              price: '¥99',
              period: '每月',
              features: ['500 积分/月', '所有AI模型', '高清画质', '优先处理', '邮件支持'],
              cta: '立即订阅',
              highlight: true
            },
            {
              name: '企业版',
              price: '¥499',
              period: '每月',
              features: ['3000 积分/月', '所有AI模型', '4K画质', '最高优先级', '专属客服', 'API访问'],
              cta: '联系销售',
              highlight: false
            }
          ].map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col gap-8 p-8 border ${
                plan.highlight ? 'border-[#E42313] bg-[#FAFAFA]' : 'border-[#E8E8E8] bg-white'
              }`}
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[40px] font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#E42313]" />
                    <span className="text-sm text-[#0D0D0D]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={`px-6 py-3 text-sm font-medium text-center ${
                  plan.highlight
                    ? 'bg-[#E42313] text-white'
                    : 'border border-[#E8E8E8] text-[#0D0D0D]'
                }`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className="flex flex-col items-center px-[120px] py-[120px] gap-16 bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4 w-[600px]">
          <h2 className="text-[40px] font-semibold text-[#0D0D0D] text-center" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            创作者案例展示
          </h2>
          <p className="text-base text-[#7A7A7A] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            看看其他创作者如何使用NeoBund1打造爆款内容
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full">
          {showcaseItems.map((item, index) => (
            <div key={index} className="flex flex-col gap-4 group cursor-pointer">
              <div className="relative w-full h-[280px] bg-white border border-[#E8E8E8] overflow-hidden">
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <span className="px-3 py-1 bg-[#0D0D0D] text-white text-[11px] font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {item.category}
                  </span>
                  <span className="px-3 py-1 bg-[#4B5563] text-white text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.model}
                  </span>
                </div>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center z-10">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#E42313] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {item.title}
                </p>
                <p className="text-xs text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {item.views} views • 3 days ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center px-[120px] py-[120px] gap-8">
        <h2 className="text-[40px] font-semibold text-[#0D0D0D] text-center" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
          准备好开始创作了吗？
        </h2>
        <p className="text-base text-[#7A7A7A] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
          立即注册，免费获得10积分，开启您的AI视频创作之旅
        </p>
        <Link
          href="/signup"
          className="px-8 py-4 bg-[#E42313] text-white text-base font-semibold"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          免费开始创作
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex flex-col px-[120px] py-12 border-t border-[#E8E8E8] gap-8">
        <div className="flex justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E42313]" />
              <span className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                NeoBund1
              </span>
            </div>
            <p className="text-sm text-[#7A7A7A] w-[300px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              AI驱动的TikTok视频生成平台，让每个创作者都能轻松打造爆款内容
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                产品
              </h4>
              <div className="flex flex-col gap-3">
                {['功能', '定价', '案例', 'API文档'].map((item) => (
                  <Link key={item} href="#" className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                公司
              </h4>
              <div className="flex flex-col gap-3">
                {['关于我们', '博客', '加入我们', '联系我们'].map((item) => (
                  <Link key={item} href="#" className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                法律
              </h4>
              <div className="flex flex-col gap-3">
                {['隐私政策', '服务条款', 'Cookie政策'].map((item) => (
                  <Link key={item} href="#" className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-[#E8E8E8]">
          <p className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2024 NeoBund1. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <Link key={social} href="#" className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {social}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
