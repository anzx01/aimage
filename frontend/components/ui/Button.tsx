import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'hover:shadow-2xl hover:-translate-y-0.5',
    secondary: 'border backdrop-blur-sm hover:border-[#D99E46]',
    ghost: 'hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  const variantColors = {
    primary: {
      background: 'linear-gradient(135deg, #D99E46 0%, #B8823D 100%)',
      color: '#0B1120',
      boxShadow: '0 4px 20px rgba(217, 158, 70, 0.3)',
    },
    secondary: {
      background: 'rgba(26, 31, 53, 0.4)',
      borderColor: 'rgba(217, 158, 70, 0.2)',
      color: '#D99E46',
    },
    ghost: {
      color: '#8B9BB5',
    },
  };

  const styles = {
    fontFamily: 'DM Sans, sans-serif',
    ...variantColors[variant],
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} style={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes} style={styles}>
      {children}
    </button>
  );
}
