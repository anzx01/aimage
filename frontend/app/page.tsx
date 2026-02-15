'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

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
          <Link href="#features" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Features
          </Link>
          <Link href="#pricing" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Pricing
          </Link>
          <Link href="#showcase" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Showcase
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-white hover:text-[#8B5CF6] transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-bold rounded-full hover:scale-105 transition-all duration-300"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center px-[120px] py-[120px] gap-12">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#151520] border border-[#2A2A3A] rounded-full">
          <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-[#A0A0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AI-Powered Video Generation Platform
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 w-[800px]">
          <h1
            className="text-[56px] font-bold text-center leading-[1.2] gradient-text"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-1px' }}
          >
            从创意到爆款
            <br />
            只需一键生成
          </h1>
          <p className="text-lg text-[#A0A0B0] text-center leading-[1.6] w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            聚合顶级AI模型，一站式生成TikTok爆款视频。从内容创作到多渠道分发，让每个跨境卖家都能轻松打造爆款内容
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-base font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            免费开始创作
          </Link>
          <Link
            href="#showcase"
            className="px-8 py-4 border-2 border-[#2A2A3A] text-white text-base font-medium rounded-full hover:border-[#8B5CF6] hover:bg-[#151520] transition-all duration-300"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            查看案例
          </Link>
        </div>

        <div className="relative w-[1000px] h-[560px] bg-[#151520] border border-[#2A2A3A] rounded-2xl overflow-hidden group hover:border-[#8B5CF6] transition-all duration-300">
          <Image
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&q=80"
            alt="Product Dashboard"
            fill
            className="object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent flex items-end justify-center pb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-[#151520]/90 backdrop-blur-xl border border-[#2A2A3A] rounded-full">
              <div className="w-3 h-3 bg-[#00F0FF] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                AI视频生成平台 · 实时预览
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="flex flex-col items-center px-[120px] py-[60px] gap-8 bg-[#0A0A0F] border-y border-[#2A2A3A]">
        <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Trusted by 10,000+ creators worldwide
        </p>
        <div className="flex items-center gap-12">
          {['TikTok', 'Shopify', 'Amazon', 'AliExpress'].map((brand) => (
            <span key={brand} className="text-xl font-semibold text-[#A0A0B0] hover:text-[#8B5CF6] transition-colors duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="flex flex-col items-center px-[120px] py-[120px] gap-16 bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4 w-[600px]">
          <h2 className="text-[40px] font-semibold text-center gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            一站式AI视频生成平台
          </h2>
          <p className="text-base text-[#A0A0B0] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            从创意到发布，全流程AI赋能，让视频创作变得简单高效
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-[1200px] mx-auto">
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
            <div key={index} className="flex flex-col gap-6 p-8 bg-[#151520] border border-[#2A2A3A] rounded-2xl hover:border-[#8B5CF6] hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-[#A0A0B0] leading-[1.6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="flex flex-col items-center px-[120px] py-[120px] gap-16 bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4 w-[600px]">
          <h2 className="text-[40px] font-semibold text-center gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            灵活的定价方案
          </h2>
          <p className="text-base text-[#A0A0B0] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            选择适合您的方案，随时升级或降级
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-[1200px] mx-auto">
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
              className={`flex flex-col gap-8 p-8 border rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                plan.highlight ? 'border-[#8B5CF6] bg-[#151520] shadow-lg shadow-[#8B5CF6]/30' : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#8B5CF6]'
              }`}
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[40px] font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
                    <span className="text-sm text-[#E0E0E0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={`px-6 py-3 text-sm font-medium text-center rounded-full transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white hover:scale-105 shadow-lg shadow-[#8B5CF6]/50'
                    : 'border-2 border-[#2A2A3A] text-white hover:border-[#8B5CF6] hover:bg-[#151520]'
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
      <section id="showcase" className="flex flex-col items-center px-[120px] py-[120px] gap-16 bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4 w-[600px]">
          <h2 className="text-[40px] font-semibold text-center gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            创作者案例展示
          </h2>
          <p className="text-base text-[#A0A0B0] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            看看其他创作者如何使用NeoBund1打造爆款内容
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-[1200px] mx-auto">
          {showcaseItems.map((item, index) => (
            <div key={index} className="flex flex-col gap-4 group cursor-pointer">
              <div className="relative w-full h-[280px] bg-[#151520] border border-[#2A2A3A] rounded-2xl overflow-hidden group-hover:border-[#8B5CF6] transition-all duration-300">
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <span className="px-3 py-1 bg-[#8B5CF6] text-white text-[11px] font-medium rounded-full" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {item.category}
                  </span>
                  <span className="px-3 py-1 bg-[#151520]/90 backdrop-blur-sm border border-[#2A2A3A] text-white text-[11px] rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                <p className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {item.views} views • 3 days ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="flex flex-col items-center px-[120px] py-[80px] gap-12 bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4 max-w-[1200px] mx-auto w-full">
          <h2 className="text-[40px] font-semibold text-center gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            用户真实评价
          </h2>
          <p className="text-base text-[#A0A0B0] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            来自全球创作者的真实反馈
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-[1200px] mx-auto">
          {[
            {
              name: '张小美',
              role: '跨境电商卖家',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
              content: '使用AIMAGE后，我的视频制作效率提升了10倍！现在每天可以轻松产出5-10条高质量视频，TikTok粉丝增长速度惊人。',
              rating: 5
            },
            {
              name: 'David Chen',
              role: '内容创作者',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
              content: 'AI生成的视频质量超出预期，特别是Veo3.1模型，画面细腻流畅。客户反馈非常好，转化率提升了40%。',
              rating: 5
            },
            {
              name: '李雪',
              role: '美妆博主',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
              content: '作为美妆博主，我需要大量的产品展示视频。AIMAGE让我可以快速生成各种风格的视频，节省了大量拍摄时间。',
              rating: 5
            },
            {
              name: 'Michael Wang',
              role: '独立设计师',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
              content: '提示词优化功能太强大了！即使我不擅长写提示词，AI也能帮我生成专业级的视频内容。强烈推荐！',
              rating: 5
            },
            {
              name: '王芳',
              role: '服装店主',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
              content: '多渠道分发功能让我的工作效率大大提升，一键就能把视频发布到多个平台。客服响应也很及时，体验很好。',
              rating: 5
            },
            {
              name: 'Alex Liu',
              role: '数字营销专家',
              avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
              content: '数据分析功能帮助我优化内容策略，现在能清楚知道哪些视频表现好。ROI提升了3倍，这个工具太值了！',
              rating: 5
            }
          ].map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-6 bg-[#151520] border border-[#2A2A3A] hover:border-[#8B5CF6] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-[#E0E0E0] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[#2A2A3A]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#8B5CF6]/30">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="flex flex-col items-center px-[120px] py-[80px] gap-12 bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4 max-w-[1200px] mx-auto w-full">
          <h2 className="text-[40px] font-semibold text-center gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            常见问题
          </h2>
          <p className="text-base text-[#A0A0B0] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            关于AIMAGE的一切，这里都有答案
          </p>
        </div>

        <div className="w-full max-w-[800px] mx-auto">
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center px-[120px] py-[120px] gap-8 bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-8 max-w-[800px] mx-auto w-full">
          <h2 className="text-[40px] font-semibold text-center gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            准备好开始创作了吗？
          </h2>
          <p className="text-base text-[#A0A0B0] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            立即注册，免费获得10积分，开启您的AI视频创作之旅
          </p>
          <Link
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-base font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            免费开始创作
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center px-[120px] py-12 border-t border-[#2A2A3A] gap-8 bg-[#0A0A0F]">
        <div className="flex justify-between max-w-[1200px] mx-auto w-full">
          <div className="flex flex-col gap-4 max-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-lg" />
              <span className="text-xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                AIMAGE
              </span>
            </div>
            <p className="text-sm text-[#A0A0B0] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              AI驱动的TikTok视频生成平台，让每个创作者都能轻松打造爆款内容
            </p>
          </div>

          <div className="flex gap-20">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                产品
              </h4>
              <div className="flex flex-col gap-3">
                {['功能', '定价', '案例', 'API文档'].map((item) => (
                  <Link key={item} href="#" className="text-sm text-[#A0A0B0] hover:text-[#8B5CF6] transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                公司
              </h4>
              <div className="flex flex-col gap-3">
                {['关于我们', '博客', '加入我们', '联系我们'].map((item) => (
                  <Link key={item} href="#" className="text-sm text-[#A0A0B0] hover:text-[#8B5CF6] transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                法律
              </h4>
              <div className="flex flex-col gap-3">
                {['隐私政策', '服务条款', 'Cookie政策'].map((item) => (
                  <Link key={item} href="#" className="text-sm text-[#A0A0B0] hover:text-[#8B5CF6] transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-[#2A2A3A] max-w-[1200px] mx-auto w-full">
          <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2024 NeoBund1. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <Link key={social} href="#" className="text-sm text-[#A0A0B0] hover:text-[#8B5CF6] transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                {social}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// FAQ Accordion Component
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '什么是AIMAGE？如何使用？',
      answer: 'AIMAGE是一个AI驱动的视频生成平台，聚合了Seedance 2.0、Wan2.6、Veo3.1等顶级AI模型。您只需输入创意描述或上传素材，AI就能自动生成高质量的TikTok视频。平台还提供提示词优化、多渠道分发等功能，让视频创作变得简单高效。'
    },
    {
      question: '支持哪些AI视频生成模型？',
      answer: '我们聚合了市面上最先进的AI视频生成模型，包括Seedance 2.0、Wan2.6、Veo3.1 Fast、Sora2渠道版等。不同模型各有特色，您可以根据需求选择最适合的模型。我们会持续更新和添加新的模型，确保您始终能使用最先进的技术。'
    },
    {
      question: '视频生成需要多长时间？',
      answer: '生成时间取决于您选择的模型和视频长度。一般来说，Veo3.1 Fast模型可以在30秒-2分钟内生成短视频，Sora2模型可能需要3-5分钟。我们提供实时预览功能，您可以随时查看生成进度。专业版和企业版用户享有优先处理权限，生成速度更快。'
    },
    {
      question: '如何计费？积分如何使用？',
      answer: '我们采用积分制计费。免费版每月赠送10积分，专业版500积分/月，企业版3000积分/月。不同模型和视频长度消耗的积分不同，一般5-30秒视频消耗1-3积分。未使用的积分会自动累积到下个月。您也可以单独购买积分包，价格更优惠。'
    },
    {
      question: '生成的视频版权归谁？',
      answer: '您生成的所有视频版权完全归您所有。您可以自由使用这些视频进行商业推广、社交媒体发布、广告投放等。我们不会对您的视频内容主张任何权利。但请注意，您需要确保输入的素材和内容不侵犯他人版权。'
    },
    {
      question: '支持哪些视频格式和分辨率？',
      answer: '我们支持MP4、MOV等主流视频格式输出。分辨率方面，免费版支持标准画质(720p)，专业版支持高清画质(1080p)，企业版支持4K画质。视频比例支持16:9、9:16(竖屏)、1:1(方形)等多种格式，完美适配TikTok、Instagram、YouTube等平台。'
    },
    {
      question: '可以批量生成视频吗？',
      answer: '可以！专业版和企业版用户可以使用批量生成功能。您可以一次性上传多个创意描述或素材，系统会自动排队生成。企业版用户还可以通过API接口实现自动化批量生成，大大提升工作效率。'
    },
    {
      question: '提供技术支持吗？',
      answer: '我们为所有用户提供技术支持。免费版用户可以通过社区论坛获取帮助，专业版用户享有邮件支持(24小时内响应)，企业版用户配备专属客服(实时响应)。我们还提供详细的使用文档、视频教程和最佳实践指南。'
    },
    {
      question: '如何取消订阅？',
      answer: '您可以随时在账户设置中取消订阅，无需任何理由。取消后，您仍可使用服务至当前计费周期结束。我们不收取任何取消费用。如果您对服务不满意，可以联系客服申请退款(订阅后7天内)。'
    },
    {
      question: '数据安全如何保障？',
      answer: '我们非常重视数据安全。所有数据传输采用SSL加密，视频文件存储在安全的云服务器上。我们不会与第三方分享您的数据。您可以随时下载或删除自己的视频。我们定期进行安全审计，确保您的数据安全无虞。'
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-[#151520] border border-[#2A2A3A] hover:border-[#8B5CF6] transition-all duration-300"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-[#1A1A25] transition-colors duration-200"
          >
            <span className="text-base font-semibold text-white pr-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {faq.question}
            </span>
            <svg
              className={`w-5 h-5 text-[#8B5CF6] flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-6 text-sm text-[#A0A0B0] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
