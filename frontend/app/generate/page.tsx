'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { calculateCreditsNeeded } from '@/lib/credits';
import FileUpload from '@/components/FileUpload';

type Mode = 'basic' | 'advanced';

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [mode, setMode] = useState<Mode>('advanced');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');
  const [duration, setDuration] = useState(15);
  const [modelType, setModelType] = useState('wan2.6-i2v');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; file: File }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleFileUpload = (url: string, file: File) => {
    setUploadedFiles(prev => [...prev, { url, file }]);
  };

  const handleFileUploadError = (error: string) => {
    setError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('请先登录');
      if (modelType === 'wan2.6-i2v' && uploadedFiles.length === 0) {
        throw new Error('该模型需要上传图片');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('请先登录');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      };

      // 1. Create project via backend API
      const projectRes = await fetch(`${apiUrl}/api/v1/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          description,
          project_type: mode === 'basic' ? 'one_click_basic' : 'one_click_advanced',
          config: { style, duration, modelType },
        }),
      });

      if (!projectRes.ok) {
        const err = await projectRes.json().catch(() => ({}));
        throw new Error(err.detail || '创建项目失败');
      }

      const project = await projectRes.json();

      // 2. Call generate API (backend handles credit deduction)
      const generateRes = await fetch(`${apiUrl}/api/v1/generate/video`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_id: project.id,
          prompt: description,
          model_type: modelType,
          image_url: uploadedFiles.length > 0 ? uploadedFiles[0].url : undefined,
          duration,
          optimize_prompt: true,
        }),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json().catch(() => ({}));
        throw new Error(err.detail || '视频生成失败');
      }

      await checkAuth();
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || '创建失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const models = [
    {
      id: 'wan2.6-i2v',
      name: 'Wan 2.6 图生视频',
      description: '从图片生成高质量视频',
      requiresImage: true
    },
    {
      id: 'seedance',
      name: 'Seedance 2.0 文生视频',
      description: '从文字描述生成视频（即将推出）',
      requiresImage: false,
      disabled: true
    },
  ];

  const styles = [
    { id: 'modern', name: '现代简约', description: '简洁大方，适合科技产品' },
    { id: 'luxury', name: '奢华高端', description: '精致优雅，适合珠宝配饰' },
    { id: 'vibrant', name: '活力动感', description: '色彩鲜艳，适合运动服饰' },
    { id: 'minimal', name: '极简主义', description: '黑白灰调，适合家居生活' },
  ];

  const durations = [
    { value: 15, label: '15秒', credits: mode === 'basic' ? 1 : 2 },
    { value: 30, label: '30秒', credits: mode === 'basic' ? 2 : 4 },
    { value: 60, label: '60秒', credits: mode === 'basic' ? 3 : 6 },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <header className="border-b border-[#2A2A3A] bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-8 h-20 flex items-center justify-between">
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
          <Link href="/generate" className="text-sm text-white font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            一键成片
          </Link>
          <Link href="/digital-humans" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            数字人
          </Link>
          <Link href="/projects" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            我的项目
          </Link>
          <Link href="/showcase" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            案例库
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#151520] border border-[#2A2A3A] rounded-full">
            <span className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>积分:</span>
            <span className="text-sm font-bold text-[#8B5CF6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user.credits}
            </span>
          </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-8 py-16 w-full" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div>
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-[40px] font-bold gradient-text mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
              一键成片
            </h1>
            <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '3.5' }}>
              快速生成高质量视频内容
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-6 mb-10">
            <button
              type="button"
              onClick={() => setMode('basic')}
              disabled={true}
              className={`flex-1 px-6 py-5 rounded-xl border-2 transition-all duration-300 opacity-50 cursor-not-allowed ${
                mode === 'basic'
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                  : 'border-[#2A2A3A] bg-[#151520]'
              }`}
            >
              <div className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                基础模式 (即将推出)
              </div>
              <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2.5' }}>
                AI 自动生成，快速出片
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('advanced')}
              className={`flex-1 px-6 py-5 rounded-xl border-2 transition-all duration-300 ${
                mode === 'advanced'
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                  : 'border-[#2A2A3A] bg-[#151520] hover:border-[#8B5CF6]/50'
              }`}
            >
              <div className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                高级模式
              </div>
              <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2.5' }}>
                上传素材，精细控制
              </div>
            </button>
          </div>

          {/* Form */}
          <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-10">
            {error && (
              <div className="mb-8 p-5 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm" style={{ lineHeight: '2.5' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                  选择模型 *
                </label>
                <div className="grid grid-cols-1 gap-5">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => !model.disabled && setModelType(model.id)}
                      disabled={model.disabled}
                      className={`p-5 rounded-lg border-2 text-left transition-all duration-300 ${
                        model.disabled
                          ? 'opacity-50 cursor-not-allowed border-[#2A2A3A]'
                          : modelType === model.id
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                          : 'border-[#2A2A3A] hover:border-[#8B5CF6]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                            {model.name}
                          </div>
                          <div className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2.5' }}>
                            {model.description}
                          </div>
                        </div>
                        {model.requiresImage && (
                          <span className="text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                            需要图片
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                  视频标题 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white placeholder-[#A0A0B0] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="例如：春季新品连衣裙展示"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                  视频描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white placeholder-[#A0A0B0] focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                  placeholder="描述您想要生成的视频内容..."
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2.5' }}
                />
              </div>

              {/* File Upload - Show only if model requires image */}
              {modelType === 'wan2.6-i2v' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                    上传素材 *
                  </label>
                  <FileUpload
                    type="both"
                    maxSize={100}
                    onUploadComplete={handleFileUpload}
                    onUploadError={handleFileUploadError}
                  />
                  <p className="mt-3 text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2.5' }}>
                    已上传 {uploadedFiles.length} 个文件
                  </p>
                </div>
              )}

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-white mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                  视频风格 *
                </label>
                <div className="grid grid-cols-2 gap-5">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={`p-5 rounded-lg border-2 text-left transition-all duration-300 ${
                        style === s.id
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                          : 'border-[#2A2A3A] hover:border-[#8B5CF6]/50'
                      }`}
                    >
                      <div className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                        {s.name}
                      </div>
                      <div className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2.5' }}>
                        {s.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                  视频时长 *
                </label>
                <div className="flex gap-5">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`flex-1 p-5 rounded-lg border-2 transition-all duration-300 ${
                        duration === d.value
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                          : 'border-[#2A2A3A] hover:border-[#8B5CF6]/50'
                      }`}
                    >
                      <div className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                        {d.label}
                      </div>
                      <div className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2.5' }}>
                        消耗 {d.credits} 积分
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-base font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {loading ? '生成中...' : '开始生成'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
