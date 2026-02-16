interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-[#2A2A3A]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B5CF6] border-r-[#EC4899] animate-spin" />
      </div>
      {text && (
        <p className="text-[#A0A0B0] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
