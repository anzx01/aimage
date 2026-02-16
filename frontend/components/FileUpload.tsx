'use client';

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete?: (url: string, file: File) => void;
  onUploadError?: (error: string) => void;
  type?: 'image' | 'video' | 'both';
  className?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export default function FileUpload({
  accept,
  maxSize = 100,
  onUploadComplete,
  onUploadError,
  type = 'both',
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取接受的文件类型
  const getAcceptTypes = () => {
    if (accept) return accept;
    if (type === 'image') return 'image/*';
    if (type === 'video') return 'video/*';
    return 'image/*,video/*';
  };

  // 验证文件
  const validateFile = (file: File): string | null => {
    const fileSizeMB = file.size / 1024 / 1024;

    if (fileSizeMB > maxSize) {
      return `文件大小不能超过 ${maxSize}MB`;
    }

    if (type === 'image' && !file.type.startsWith('image/')) {
      return '只能上传图片文件';
    }

    if (type === 'video' && !file.type.startsWith('video/')) {
      return '只能上传视频文件';
    }

    return null;
  };

  // 上传文件到 Supabase Storage
  const uploadToStorage = async (file: File, index: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 更新进度
      setFiles(prev => prev.map((f, i) =>
        i === index ? { ...f, progress: 10 } : f
      ));

      // 上传文件
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      // 更新状态为完成
      setFiles(prev => prev.map((f, i) =>
        i === index ? {
          ...f,
          progress: 100,
          status: 'completed',
          url: publicUrl
        } : f
      ));

      // 调用回调
      if (onUploadComplete) {
        onUploadComplete(publicUrl, file);
      }

    } catch (error: any) {
      const errorMessage = error.message || '上传失败';

      setFiles(prev => prev.map((f, i) =>
        i === index ? {
          ...f,
          status: 'error',
          error: errorMessage
        } : f
      ));

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  // 处理文件选择
  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const error = validateFile(file);

      if (error) {
        if (onUploadError) {
          onUploadError(error);
        }
        return;
      }

      // 创建预览
      const preview = URL.createObjectURL(file);

      newFiles.push({
        file,
        preview,
        progress: 0,
        status: 'uploading',
      });
    });

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);

      // 开始上传
      const startIndex = files.length;
      newFiles.forEach((_, index) => {
        uploadToStorage(newFiles[index].file, startIndex + index);
      });
    }
  }, [files.length, maxSize, type, onUploadComplete, onUploadError]);

  // 拖拽处理
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  // 点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 删除文件
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragging
            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
            : 'border-[#2A2A3A] bg-[#151520] hover:border-[#8B5CF6]/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          multiple
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <p className="text-white font-medium mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {isDragging ? '松开以上传文件' : '点击或拖拽文件到此处'}
            </p>
            <p className="text-sm text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {type === 'image' && '支持 JPG、PNG、GIF 等图片格式'}
              {type === 'video' && '支持 MP4、MOV、AVI 等视频格式'}
              {type === 'both' && '支持图片和视频文件'}
              {' '}· 最大 {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className="bg-[#151520] border border-[#2A2A3A] rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#0A0A0F] flex-shrink-0">
                  {uploadedFile.file.type.startsWith('image/') ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🎬
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {uploadedFile.file.name}
                    </p>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-[#A0A0B0] hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#A0A0B0]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {uploadedFile.status === 'uploading' && (
                      <span className="text-blue-400">上传中...</span>
                    )}
                    {uploadedFile.status === 'completed' && (
                      <span className="text-green-400">✓ 上传完成</span>
                    )}
                    {uploadedFile.status === 'error' && (
                      <span className="text-red-400">✗ {uploadedFile.error}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-2 h-1 bg-[#0A0A0F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
