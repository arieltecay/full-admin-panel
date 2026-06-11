import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) => {
  const baseStyles = 'rounded-[2rem] border transition-all duration-300';
  const themeStyles = glass
    ? 'bg-white/70 backdrop-blur-md border-slate-100'
    : 'bg-white border-slate-100 text-slate-900';
  const hoverStyles = hoverEffect 
    ? 'hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-200' 
    : 'shadow-sm';

  return (
    <div
      className={`${baseStyles} ${themeStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
