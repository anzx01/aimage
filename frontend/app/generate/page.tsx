'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { calculateCreditsNeeded, deductCredits } from '@/lib/credits';
import FileUpload from '@/components/FileUpload';

type Mode = 'basic' | 'advanced';

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [mode, setMode] = useState<Mode>('basic');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');
  const [duration, setDuration] = useState(15);
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

      // 高级模式需要至少上传一个文件
      if (mode === 'advanced' && uploadedFiles.length === 0) {
        throw new Error('请至少上传一个文件');
      }

      // 检查积分是否足够
      const creditsNeeded = calculateCreditsNeeded(mode, duration);

      if (user.credits < creditsNeeded) {
        throw new Error('积分不足，请充值');
      }

      // 创建项目
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          description,
          mode,
          project_type: mode, // 添加 project_type 字段
          status: 'draft',
          credits_used: creditsNeeded,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // 如果是高级模式，保存上传的文件到 assets 表
      if (mode === 'advanced' && uploadedFiles.length > 0) {
        for (const { url, file } of uploadedFiles) {
          // 创建 asset 记录
          const { data: asset, error: assetError } = await supabase
            .from('assets')
            .insert({
              user_id: user.id,
              type: file.type.startsWith('image/') ? 'image' : 'video',
              file_url: url,
              file_name: file.name,
              file_size: file.size,
            })
            .select()
            .single();

          if (assetError) throw assetError;

          // 关联到项目
          const { error: projectAssetError } = await supabase
            .from('project_assets')
            .insert({
              project_id: project.id,
              asset_id: asset.id,
            });

          if (projectAssetError) throw projectAssetError;
        }
      }

      // 创建生成任务
      const { error: taskError } = await supabase
        .from('generation_tasks')
        .insert({
          project_id: project.id,
          user_id: user.id,
          model_name: mode === 'basic' ? 'veo3.1-fast' : 'veo3.1-pro',
          status: 'pending',
          config: {
            style,
            duration,
            mode,
          },
        });

      if (taskError) throw taskError;

      // 扣除积分
      const deductResult = await deductCredits(
        user.id,
        creditsNeeded,
        `生成视频: ${title}`,
        project.id
      );

      if (!deductResult.success) {
        throw new Error(deductResult.error || '扣除积分失败');
      }

      // 更新用户积分显示
      await checkAuth();

      // 跳转到项目详情页
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
              className={`flex-1 px-6 py-5 rounded-xl border-2 transition-all duration-300 ${
                mode === 'basic'
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                  : 'border-[#2A2A3A] bg-[#151520] hover:border-[#8B5CF6]/50'
              }`}
            >
              <div className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '2.5' }}>
                基础模式
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

              {/* File Upload - Advanced Mode Only */}
              {mode === 'advanced' && (
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
