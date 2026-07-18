import React from 'react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
  className?: string;
}

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-primary/5',
    border: 'border-primary/10',
    text: 'text-primary',
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
};

export default function Alert({ type, children, className = '' }: AlertProps) {
  const styles = alertStyles[type];

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border ${styles.bg} ${styles.border} px-4 py-3 text-sm ${styles.text} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {styles.icon}
      <span>{children}</span>
    </div>
  );
}
