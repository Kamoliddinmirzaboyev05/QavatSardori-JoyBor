import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  padding = 'md',
  hover = false,
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        paddingClasses[padding],
        (hover || onClick) && "hover:shadow-md transition-shadow cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;