import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white',
        {
          'shadow-sm': variant === 'default',
          'shadow-lg': variant === 'elevated',
          'border border-gray-200': variant === 'outlined',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

