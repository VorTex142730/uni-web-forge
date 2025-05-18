import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

interface CustomAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CustomAvatar = React.forwardRef<HTMLDivElement, CustomAvatarProps>(
  ({ src, alt, fallback, size = 'md', className = '' }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    return (
      <Avatar 
        ref={ref}
        className={`${sizeClasses[size]} ${className}`}
      >
        {src && <AvatarImage src={src} alt={alt || ''} />}
        <AvatarFallback>{fallback || '?'}</AvatarFallback>
      </Avatar>
    );
  }
);

CustomAvatar.displayName = 'CustomAvatar';
