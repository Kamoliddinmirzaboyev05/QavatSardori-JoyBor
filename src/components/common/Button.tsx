import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-black',
    dark: 'bg-gray-900 text-white hover:bg-black',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    warning: 'bg-orange-600 text-white hover:bg-orange-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2.5 text-[11px]',
    lg: 'px-6 py-3.5 text-xs'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={clsx(
        baseClasses,
        "rounded-[5px]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Yuklanmoqda...
        </div>
      ) : children}
    </button>
  );
};

export default Button;