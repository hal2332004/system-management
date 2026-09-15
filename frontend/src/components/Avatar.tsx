import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({ src, name, size = 'md', className = '', style }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials = (name || 'NV')
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'NV';

  const sizeClass = size === 'xs' 
    ? 'avatar-xs' 
    : size === 'sm' 
    ? 'small' 
    : size === 'lg' 
    ? 'avatar-lg' 
    : size === 'xl' 
    ? 'avatar-xl' 
    : '';

  const combinedStyle: React.CSSProperties = {
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (src && !imgError) {
    return (
      <span className={`avatar ${sizeClass} ${className}`} style={combinedStyle}>
        <img
          src={src}
          alt={name || 'Avatar'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'inherit',
            display: 'block'
          }}
        />
      </span>
    );
  }

  return (
    <span className={`avatar ${sizeClass} ${className}`} style={combinedStyle}>
      {initials}
    </span>
  );
}
