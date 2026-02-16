import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;700&display=swap');

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }

        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #1A1F35 50%, #0F1419 100%)' }}>
        {/* Subtle Grid Pattern */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#D99E46 1px, transparent 1px), linear-gradient(90deg, #D99E46 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        {children}
      </div>
    </>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="mb-20 animate-slide-in">
      <div className="flex items-baseline gap-4 mb-4">
        <div className="w-1 h-12" style={{ background: 'linear-gradient(180deg, #D99E46 0%, transparent 100%)' }} />
        <div>
          {badge && (
            <p className="text-sm tracking-[0.2em] uppercase mb-2" style={{ fontFamily: 'DM Sans, sans-serif', color: '#D99E46', fontWeight: 500 }}>
              {badge}
            </p>
          )}
          <h1 className="text-5xl leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            {title}
          </h1>
        </div>
      </div>
      {subtitle && (
        <p className="text-lg ml-8 max-w-2xl" style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B9BB5', lineHeight: '1.8' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
