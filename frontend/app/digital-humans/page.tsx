'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';

interface DigitalHuman {
  id: string;
  name: string;
  avatar_url: string;
  digital_human_type: string;
  voice_config: any;
  appearance_config: any;
  created_at: string;
}

export default function DigitalHumansPage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [digitalHumans, setDigitalHumans] = useState<DigitalHuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDigitalHuman, setSelectedDigitalHuman] = useState<DigitalHuman | null>(null);
  const [uploadedAvatar, setUploadedAvatar] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    voice_type: 'female',
  });
  const [generateData, setGenerateData] = useState({
    text: '',
    duration: 10,
  });
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

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
      fetchDigitalHumans();
    }
  }, [user]);

  const fetchDigitalHumans = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('请先登录');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/digital-humans`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取数字人列表失败');
      }

      const data = await response.json();
      setDigitalHumans(data);
    } catch (error: any) {
      console.error('Error fetching digital humans:', error);
      setError(error.message || '获取数字人列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDigitalHuman = async () => {
    if (!formData.name.trim()) {
      setError('请输入数字人名称');
      return;
    }

    if (!uploadedAvatar) {
      setError('请上传数字人头像');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('请先登录');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/digital-humans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          avatar_url: uploadedAvatar,
          digital_human_type: 'advanced',
          voice_config: {
            voice_type: formData.voice_type
          },
          appearance_config: {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '创建数字人失败');
      }

      const newDigitalHuman = await response.json();
      setDigitalHumans([newDigitalHuman, ...digitalHumans]);
      setShowAddModal(false);
      setFormData({ name: '', voice_type: 'female' });
      setUploadedAvatar('');
      setError('');
    } catch (error: any) {
      console.error('Error adding digital human:', error);
      setError(error.message || '添加失败，请重试');
    }
  };

  const handleDeleteDigitalHuman = async (id: string) => {
    if (!confirm('确定要删除这个数字人吗？')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('请先登录');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/digital-humans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('删除数字人失败');
      }

      setDigitalHumans(digitalHumans.filter(dh => dh.id !== id));
    } catch (error: any) {
      console.error('Error deleting digital human:', error);
      alert(error.message || '删除失败，请重试');
    }
  };

  const handleFileUpload = (url: string) => {
    setUploadedAvatar(url);
  };

  const handleFileUploadError = (error: string) => {
    setError(error);
  };

  const handleGenerateVideo = async () => {
    if (!selectedDigitalHuman) return;

    if (!generateData.text.trim()) {
      setError('请输入要说的内容');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('请先登录');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/digital-humans/${selectedDigitalHuman.id}/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text: generateData.text,
          duration: generateData.duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '生成视频失败');
      }

      const result = await response.json();

      // 关闭对话框并重置
      setShowGenerateModal(false);
      setGenerateData({ text: '', duration: 10 });
      setSelectedDigitalHuman(null);

      // 更新用户积分
      await checkAuth();

      // 提示用户并跳转到项目列表
      alert('视频生成已开始，请在"我的项目"中查看进度');
      router.push('/projects');
    } catch (error: any) {
      console.error('Error generating video:', error);
      setError(error.message || '生成视频失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#A0A0B0]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />

      <main className="max-w-[1200px] mx-auto px-8 py-12 w-full" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1
                className="text-[40px] font-bold gradient-text mb-4"
                style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}
              >
                数字人管理
              </h1>
              <p className="text-lg text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                管理您的数字人形象
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50 relative z-10 cursor-pointer"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              + 添加数字人
            </button>
          </div>

          {/* Digital Humans Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-[#A0A0B0]">加载中...</div>
            </div>
          ) : digitalHumans.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[#A0A0B0] mb-4">暂无数字人</div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-full hover:scale-105 transition-all duration-300"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                创建第一个数字人
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {digitalHumans.map((dh) => (
                <div
                  key={dh.id}
                  className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-6 hover:border-[#8B5CF6] transition-all duration-300 group relative"
                >
                  <button
                    onClick={() => handleDeleteDigitalHuman(dh.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-[#2A2A3A] group-hover:border-[#8B5CF6] transition-colors">
                      <img
                        src={dh.avatar_url}
                        alt={dh.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3
                      className="text-xl font-bold text-white mb-2"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {dh.name}
                    </h3>
                    <span
                      className="px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs rounded-full mb-4"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {dh.voice_config?.voice_type === 'female' ? '女声' : '男声'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDigitalHuman(dh);
                        setShowGenerateModal(true);
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-bold rounded-lg hover:scale-105 transition-all duration-300"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      生成视频
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Digital Human Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError('');
          setUploadedAvatar('');
        }}
        title="添加数字人"
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              placeholder="输入数字人名称"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              头像 *
            </label>
            <FileUpload
              type="image"
              maxSize={10}
              onUploadComplete={handleFileUpload}
              onUploadError={handleFileUploadError}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              声音类型 *
            </label>
            <select
              value={formData.voice_type}
              onChange={(e) => setFormData({ ...formData, voice_type: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="female">女声</option>
              <option value="male">男声</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowAddModal(false);
                setError('');
                setUploadedAvatar('');
              }}
              className="flex-1 px-6 py-3 bg-[#2A2A3A] text-white font-medium rounded-lg hover:bg-[#3A3A4A] transition-colors"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              取消
            </button>
            <button
              onClick={handleAddDigitalHuman}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-lg hover:scale-105 transition-all duration-300"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              添加
            </button>
          </div>
        </div>
      </Modal>

      {/* Generate Video Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setSelectedDigitalHuman(null);
          setGenerateData({ text: '', duration: 10 });
          setError('');
        }}
        title={`让 ${selectedDigitalHuman?.name} 说话`}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              说话内容 *
            </label>
            <textarea
              value={generateData.text}
              onChange={(e) => setGenerateData({ ...generateData, text: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
              placeholder="输入数字人要说的内容..."
              rows={5}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <p className="mt-2 text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {generateData.text.length} / 1000 字符
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              视频时长
            </label>
            <select
              value={generateData.duration}
              onChange={(e) => setGenerateData({ ...generateData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value={10}>10秒</option>
              <option value={15}>15秒</option>
              <option value={20}>20秒</option>
              <option value={30}>30秒</option>
            </select>
          </div>

          <div className="p-3 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg">
            <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              消耗积分: <span className="text-[#8B5CF6] font-bold">10</span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowGenerateModal(false);
                setSelectedDigitalHuman(null);
                setGenerateData({ text: '', duration: 10 });
                setError('');
              }}
              className="flex-1 px-6 py-3 bg-[#2A2A3A] text-white font-medium rounded-lg hover:bg-[#3A3A4A] transition-colors"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              disabled={generating}
            >
              取消
            </button>
            <button
              onClick={handleGenerateVideo}
              disabled={generating}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {generating ? '生成中...' : '开始生成'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
