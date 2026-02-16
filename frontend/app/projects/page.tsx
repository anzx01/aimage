'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  generation_tasks?: Array<{
    id: string;
    status: string;
    model_name: string;
    result_url: string | null;
  }>;
}

// Helper function to ensure HTTPS URLs
const ensureHttps = (url: string | null): string | null => {
  if (!url) return null;
  return url.replace(/^http:\/\//i, 'https://');
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'processing' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, filter, searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      // 检查用户是否存在
      if (!user?.id) {
        console.error('用户 ID 不存在');
        setProjects([]);
        return;
      }

      // 首先尝试只查询 projects 表
      let query = supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      // 添加搜索功能
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase 查询错误:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        throw error;
      }

      // 如果成功，尝试加载关联的 generation_tasks
      if (data) {
        const projectsWithTasks = await Promise.all(
          data.map(async (project) => {
            try {
              const { data: tasks, error: tasksError } = await supabase
                .from('generation_tasks')
                .select('id, status, model_name, result_url')
                .eq('project_id', project.id)
                .order('created_at', { ascending: false })
                .limit(1);

              if (tasksError) {
                console.warn('加载任务失败:', {
                  projectId: project.id,
                  error: tasksError.message
                });
              }

              return {
                ...project,
                generation_tasks: tasks || []
              };
            } catch (taskError: any) {
              // 如果加载任务失败，只返回项目数据
              console.warn('加载任务异常:', {
                projectId: project.id,
                error: taskError?.message || String(taskError)
              });
              return {
                ...project,
                generation_tasks: []
              };
            }
          })
        );

        setProjects(projectsWithTasks);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      console.error('加载项目失败:', {
        name: err?.name,
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        stack: err?.stack,
        fullError: JSON.stringify(err, Object.getOwnPropertyNames(err))
      });
      // 设置空数组而不是让页面崩溃
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // 重新加载项目列表
      loadProjects();
    } catch (err) {
      console.error('删除项目失败:', err);
      alert('删除失败，请稍后重试');
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;700&display=swap');
        `}</style>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #1A1F35 50%, #0F1419 100%)' }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-[#D99E46] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5' }}>加载中...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const statusConfig = {
    draft: { label: '草稿', color: 'text-gray-400', bg: 'bg-gray-400/10' },
    processing: { label: '生成中', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    completed: { label: '已完成', color: 'text-green-400', bg: 'bg-green-400/10' },
    failed: { label: '失败', color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const filters = [
    { id: 'all', label: '全部' },
    { id: 'draft', label: '草稿' },
    { id: 'processing', label: '生成中' },
    { id: 'completed', label: '已完成' },
    { id: 'failed', label: '失败' },
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
          <Link href="/generate" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            一键成片
          </Link>
          <Link href="/digital-humans" className="text-sm text-[#A0A0B0] hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            数字人
          </Link>
          <Link href="/projects" className="text-sm text-white font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
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
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-[40px] font-bold gradient-text mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
            我的项目
          </h1>
          <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '3.5' }}>
            管理您的所有视频项目
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索项目标题或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-5 pl-12 bg-[#151520] border border-[#2A2A3A] rounded-xl text-white placeholder-[#A0A0B0] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0B0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-10">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === f.id
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white'
                  : 'bg-[#151520] text-[#A0A0B0] hover:text-white border border-[#2A2A3A]'
              }`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[#A0A0B0] text-lg mb-8" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '3.5' }}>
              还没有项目
            </div>
            <Link
              href="/generate"
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-bold rounded-full hover:scale-105 transition-all duration-300"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              创建第一个项目
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const status = statusConfig[project.status as keyof typeof statusConfig];
              const task = project.generation_tasks?.[0];

              return (
                <div
                  key={project.id}
                  className="bg-[#151520] border border-[#2A2A3A] rounded-2xl overflow-hidden hover:border-[#8B5CF6]/50 transition-all duration-300 group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 flex items-center justify-center">
                    {task?.result_url ? (
                      <video
                        src={ensureHttps(task.result_url) || ''}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="text-[#A0A0B0] text-sm" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '3' }}>
                        {project.status === 'processing' ? '生成中...' : '暂无预览'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {status.label}
                      </span>
                      <span className="text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '3' }}>
                        {new Date(project.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {project.title}
                    </h3>

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-[#A0A0B0] mb-5 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '3' }}>
                        {project.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 mb-5 text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span>模式: {project.mode === 'basic' ? '基础' : '高级'}</span>
                      <span>消耗: {project.credits_used} 积分</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex-1 px-4 py-2 bg-[#8B5CF6] text-white text-sm font-medium rounded-lg hover:bg-[#7C3AED] transition-colors text-center"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        查看详情
                      </Link>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="px-4 py-2 bg-[#0A0A0F] border border-[#2A2A3A] text-[#A0A0B0] text-sm font-medium rounded-lg hover:border-red-500/50 hover:text-red-400 transition-colors"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
