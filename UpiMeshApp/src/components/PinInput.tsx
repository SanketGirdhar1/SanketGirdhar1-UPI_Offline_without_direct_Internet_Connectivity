import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface PinInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const PinInput: React.FC<PinInputProps> = ({ value, onChange }) => {
  return (
    <View className="flex-row justify-center gap-4 my-2">
      {[0, 1, 2, 3].map((i) => {
        const isFilled = i < value.length;
        const isCurrent = i === value.length;
        return (
          <View 
            key={i} 
            className={`w-12 h-14 rounded bg-[#1A1D24] border justify-center items-center ${isCurrent ? 'border-[#00F0FF]' : 'border-[#2A2D35]'}`}
          >
            {isFilled && <View className="w-3 h-3 rounded-full bg-white" />}
          </View>
        );
      })}
      
      {/* Hidden actual input */}
      <TextInput
        className="absolute w-full h-full opacity-0"
        value={value}
        onChangeText={(text) => {
          if (text.length <= 4) onChange(text.replace(/[^0-9]/g, ''));
        }}
        keyboardType="number-pad"
        maxLength={4}
        caretHidden
      />
    </View>
  );
};
