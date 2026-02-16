'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Modal from '@/components/Modal';

interface DigitalHuman {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  voice_type: string;
  created_at: string;
}

export default function DigitalHumansPage() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const [digitalHumans, setDigitalHumans] = useState<DigitalHuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    voice_type: 'female',
  });

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
      // 使用模拟数据
      const mockData: DigitalHuman[] = [
        {
          id: '1',
          name: '小美',
          description: '专业的产品讲解数字人，声音甜美',
          avatar_url: 'https://picsum.photos/id/64/200/200',
          voice_type: 'female',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: '小明',
          description: '商务风格数字人，声音沉稳',
          avatar_url: 'https://picsum.photos/id/65/200/200',
          voice_type: 'male',
          created_at: new Date().toISOString(),
        },
      ];
      setDigitalHumans(mockData);
    } catch (error) {
      console.error('Error fetching digital humans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDigitalHuman = async () => {
    if (!formData.name.trim()) {
      alert('请输入数字人名称');
      return;
    }

    try {
      // 这里应该调用API创建数字人
      const newDigitalHuman: DigitalHuman = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        avatar_url: 'https://picsum.photos/id/66/200/200',
        voice_type: formData.voice_type,
        created_at: new Date().toISOString(),
      };

      setDigitalHumans([newDigitalHuman, ...digitalHumans]);
      setShowAddModal(false);
      setFormData({ name: '', description: '', voice_type: 'female' });
    } catch (error) {
      console.error('Error adding digital human:', error);
      alert('添加失败，请重试');
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
              className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-[#8B5CF6]/50"
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
                  className="bg-[#151520] border border-[#2A2A3A] rounded-2xl p-6 hover:border-[#8B5CF6] transition-all duration-300 cursor-pointer group"
                >
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
                    <p
                      className="text-sm text-[#A0A0B0] text-center mb-4"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {dh.description}
                    </p>
                    <span
                      className="px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs rounded-full"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {dh.voice_type === 'female' ? '女声' : '男声'}
                    </span>
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
        onClose={() => setShowAddModal(false)}
        title="添加数字人"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              名称
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
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
              placeholder="输入数字人描述"
              rows={3}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              声音类型
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
              onClick={() => setShowAddModal(false)}
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
    </div>
  );
}
