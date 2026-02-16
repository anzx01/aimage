'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  status: string;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

interface GenerationTask {
  id: string;
  status: string;
  model_name: string;
  result_url: string | null;
  error_message: string | null;
  config: any;
  created_at: string;
  updated_at: string;
}

interface Asset {
  id: string;
  type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && projectId) {
      loadProjectData();
    }
  }, [user, projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // 加载项目信息
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user!.id)
        .single();

      if (projectError) {
        console.error('加载项目失败:', projectError);
        throw projectError;
      }
      setProject(projectData);

      // 加载生成任务
      const { data: tasksData, error: tasksError } = await supabase
        .from('generation_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.warn('加载任务失败:', tasksError);
      }
      setTasks(tasksData || []);

      // 加载素材
      try {
        const { data: assetsData, error: assetsError } = await supabase
          .from('project_assets')
          .select(`
            assets (
              id,
              type,
              file_url,
              file_name,
              file_size,
              created_at
            )
          `)
          .eq('project_id', projectId);

        if (assetsError) {
          console.warn('加载素材失败:', assetsError);
        }
        setAssets(assetsData?.map((item: any) => item.assets).filter(Boolean) || []);
      } catch (assetErr) {
        console.warn('加载素材异常:', assetErr);
        setAssets([]);
      }
    } catch (err: any) {
      console.error('加载项目数据失败:', {
        message: err?.message,
        details: err?.details,
        code: err?.code
      });
      alert('加载失败，请稍后重试');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      router.push('/projects');
    } catch (err) {
      console.error('删除项目失败:', err);
      alert('删除失败，请稍后重试');
    }
  };

  const downloadVideo = async () => {
    if (!latestTask?.result_url) return;

    try {
      const response = await fetch(latestTask.result_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.title || 'video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('下载失败:', err);
      alert('下载失败，请稍后重试');
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('分享链接已复制到剪贴板');
    }).catch(() => {
      alert('复制失败，请手动复制链接');
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!user || !project) {
    return null;
  }

  const statusConfig = {
    draft: { label: '草稿', color: 'text-gray-400', bg: 'bg-gray-400/10' },
    processing: { label: '生成中', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    completed: { label: '已完成', color: 'text-green-400', bg: 'bg-green-400/10' },
    failed: { label: '失败', color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const taskStatusConfig = {
    pending: { label: '等待中', color: 'text-gray-400' },
    processing: { label: '生成中', color: 'text-blue-400' },
    completed: { label: '已完成', color: 'text-green-400' },
    failed: { label: '失败', color: 'text-red-400' },
  };

  const status = statusConfig[project.status as keyof typeof statusConfig];
  const latestTask = tasks[0];

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
          <Link href="/projects" className="text-sm text-white font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            我的项目
          </Link>
          <Link href="/showcase" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            案例库
          </Link>
          <Link href="/generate" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            一键成片
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
      </header>

      {/* Main Content */}
      <main className="px-[120px] py-12">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-[#A0A0B0] hover:text-white transition-colors mb-8"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回项目列表
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 flex items-center justify-center">
                {latestTask?.result_url ? (
                  <video
                    src={latestTask.result_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-[#A0A0B0] text-lg mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {project.status === 'processing' ? '视频生成中...' : '暂无视频'}
                    </div>
                    {project.status === 'processing' && (
                      <div className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        预计需要 2-5 分钟
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-[32px] font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {project.title}
                  </h1>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {status.label}
                  </span>
                </div>
                <button
                  onClick={deleteProject}
                  className="px-4 py-2 bg-[#0A0A0F] border border-[#2A2A3A] text-[#A0A0B0] text-sm font-medium rounded-lg hover:border-red-500/50 hover:text-red-400 transition-colors"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  删除项目
                </button>
              </div>

              {project.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    项目描述
                  </h3>
                  <p className="text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {project.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#A0A0B0] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>创建时间</div>
                  <div className="text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {new Date(project.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div>
                  <div className="text-[#A0A0B0] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>更新时间</div>
                  <div className="text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {new Date(project.updated_at).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div>
                  <div className="text-[#A0A0B0] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>生成模式</div>
                  <div className="text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {project.mode === 'basic' ? '基础模式' : '高级模式'}
                  </div>
                </div>
                <div>
                  <div className="text-[#A0A0B0] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>消耗积分</div>
                  <div className="text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {project.credits_used} 积分
                  </div>
                </div>
              </div>
            </div>

            {/* Generation Tasks */}
            {tasks.length > 0 && (
              <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  生成记录
                </h2>
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const taskStatus = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
                    return (
                      <div key={task.id} className="p-4 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${taskStatus.color}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            {taskStatus.label}
                          </span>
                          <span className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {new Date(task.created_at).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <div className="text-sm text-[#A0A0B0] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          模型: {task.model_name}
                        </div>
                        {task.error_message && (
                          <div className="text-sm text-red-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                            错误: {task.error_message}
                          </div>
                        )}
                        {task.result_url && (
                          <a
                            href={task.result_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                          >
                            查看结果 →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Assets & Actions */}
          <div className="space-y-8">
            {/* Actions */}
            <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                操作
              </h3>
              <div className="space-y-3">
                {latestTask?.result_url && (
                  <>
                    <button
                      onClick={downloadVideo}
                      className="block w-full px-4 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-bold rounded-lg hover:scale-105 transition-all duration-300 text-center"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      下载视频
                    </button>
                    <button
                      onClick={copyShareLink}
                      className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] text-white text-sm font-medium rounded-lg hover:border-[#8B5CF6]/50 transition-colors"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      复制分享链接
                    </button>
                  </>
                )}
                <button
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] text-[#A0A0B0] text-sm font-medium rounded-lg cursor-not-allowed"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  disabled
                >
                  重新生成 (即将推出)
                </button>
              </div>
            </div>

            {/* Assets */}
            {assets.length > 0 && (
              <div className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  项目素材
                </h3>
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 rounded-lg flex items-center justify-center">
                          {asset.type === 'image' ? '🖼️' : '🎬'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            {asset.file_name}
                          </div>
                          <div className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {(asset.file_size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
