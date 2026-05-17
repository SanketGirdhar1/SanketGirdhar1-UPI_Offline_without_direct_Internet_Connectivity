import React from 'react';
import { View, ViewStyle } from 'react-native';

interface SolidCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: string; // tailwind padding class e.g., 'p-4'
  className?: string;
  variant?: 'default' | 'highlight';
}

export const GlassCard: React.FC<SolidCardProps> = ({
  children,
  style,
  padding = 'p-4',
  className = '',
  variant = 'default',
}) => {
  const baseStyle = "rounded-lg overflow-hidden border";
  const variantStyle = variant === 'highlight' 
    ? "bg-[#00F0FF]/10 border-[#00F0FF]" 
    : "bg-[#1A1D24] border-[#2A2D35]";

  return (
    <View style={style} className={`${baseStyle} ${variantStyle} ${padding} ${className}`}>
      {children}
    </View>
  );
};
