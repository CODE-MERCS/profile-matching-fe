// src/components/atoms/Badge/Badge.tsx
import React from 'react';

interface BadgeProps {
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  text: string;
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({
  color,
  text,
  size = 'md'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'gray':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1';
    }
  };
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${getColorClasses()} ${getSizeClasses()}`}>
      {text}
    </span>
  );
};

export default Badge;