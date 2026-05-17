import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface AmountInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({ value, onChange }) => {
  return (
    <View className="items-center my-6">
      <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest uppercase mb-4">AMOUNT</Text>
      <View className="flex-row items-center justify-center">
        <Text className="text-[#00F0FF] text-4xl font-light mr-2">₹</Text>
        <TextInput
          className="text-white text-6xl font-bold p-0 m-0 min-w-[100px] text-center"
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          maxLength={6}
          selectionColor="#00F0FF"
        />
      </View>
    </View>
  );
};
