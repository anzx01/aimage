import React from 'react';
import Link from 'next/link';

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  hover?: boolean;
}

export function Card({ children, href, className = '', hover = true }: CardProps) {
  const baseStyles = 'p-8 rounded-2xl border backdrop-blur-sm';
  const hoverStyles = hover ? 'transition-all duration-500 hover:-translate-y-1 hover:shadow-xl' : '';
  const classes = `${baseStyles} ${hoverStyles} ${className}`;

  const styles = {
    background: 'rgba(26, 31, 53, 0.4)',
    borderColor: 'rgba(217, 158, 70, 0.15)',
  };

  if (href) {
    return (
      <Link href={href} className={`${classes} group`} style={styles}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} style={styles}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3
      className={`text-xl ${className}`}
      style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#FFFFFF' }}
    >
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
