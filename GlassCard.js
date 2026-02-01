import React from 'react';
import { cn } from '@/lib/utils';

export const GlassCard = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white/60 backdrop-blur-md border border-white/60',
        'shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6',
        'hover:bg-white/80 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};