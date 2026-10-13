import React from 'react';

const variantClasses = {
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
};

const Badge = ({ 
  children, 
  variant = 'neutral', 
  size = 'sm', 
  className = '', 
  dot = false 
}) => {
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const colorClass = variantClasses[variant] || variantClasses.neutral;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${colorClass} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            variant === 'success' ? 'bg-emerald-500' :
            variant === 'primary' ? 'bg-indigo-500' :
            variant === 'danger' ? 'bg-rose-500' :
            variant === 'warning' ? 'bg-amber-500' : 'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
