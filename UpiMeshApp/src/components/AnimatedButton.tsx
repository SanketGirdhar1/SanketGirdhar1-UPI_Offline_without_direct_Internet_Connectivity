import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  disabled,
  variant = 'primary',
  style,
  className = '',
}) => {
  let bgClass = "bg-[#00F0FF]";
  let textClass = "text-[#0B0E14]";
  let borderClass = "";

  if (variant === 'secondary') {
    bgClass = "bg-transparent";
    textClass = "text-[#00F0FF]";
    borderClass = "border-2 border-[#00F0FF]";
  } else if (variant === 'danger') {
    bgClass = "bg-transparent";
    textClass = "text-[#FF3366]";
    borderClass = "border-2 border-[#FF3366]";
  }

  if (disabled) {
    bgClass = variant === 'primary' ? "bg-[#00F0FF]/30" : "bg-transparent";
    textClass = variant === 'primary' ? "text-[#0B0E14]" : "text-gray-500";
    borderClass = variant === 'primary' ? "" : "border-2 border-gray-500";
  }

  return (
    <TouchableOpacity
      className={`py-4 px-6 rounded-lg items-center justify-center ${bgClass} ${borderClass} ${disabled ? 'opacity-50' : 'active:opacity-80'} ${className}`}
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      <Text className={`${textClass} font-extrabold tracking-widest text-sm uppercase`}>{title}</Text>
    </TouchableOpacity>
  );
};
