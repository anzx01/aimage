import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          className="block text-sm tracking-wide uppercase"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#C5D0E6', fontWeight: 500, letterSpacing: '0.05em' }}
        >
          {label}
        </label>
      )}
      <input
        className={`w-full px-5 py-4 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-[#D99E46] focus:shadow-lg ${className}`}
        style={{
          fontFamily: 'DM Sans, sans-serif',
          background: 'rgba(11, 17, 32, 0.5)',
          borderColor: error ? 'rgba(248, 113, 113, 0.5)' : 'rgba(139, 155, 181, 0.2)',
          color: '#FFFFFF',
          fontSize: '15px'
        }}
        {...props}
      />
      {error && (
        <p className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif', color: '#F87171' }}>
          {error}
        </p>
      )}
    </div>
  );
}
