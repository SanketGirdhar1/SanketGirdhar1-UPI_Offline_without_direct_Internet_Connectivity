import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Account {
  vpa: string;
  balance: number;
}

interface AccountCardProps {
  account: Account;
  prevBalance?: number;
  selected?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, prevBalance, selected }) => {
  const isDiff = prevBalance !== undefined && account.balance !== prevBalance;
  
  return (
    <View className={`p-4 rounded-lg border flex-col justify-between ${selected ? 'border-[#00F0FF] bg-[#00F0FF]/10' : 'border-[#2A2D35] bg-[#1A1D24]'}`}>
      <View className="flex-row justify-between items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-black/50 justify-center items-center">
          <Text className="text-[#00F0FF] font-bold text-lg">{account.vpa.charAt(0).toUpperCase()}</Text>
        </View>
        {selected && <View className="w-4 h-4 rounded-full bg-[#00FF9D]" />}
      </View>
      <View>
        <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest uppercase mb-1">VPA ADDRESS</Text>
        <Text className="text-white text-base font-bold mb-4">{account.vpa}</Text>
        <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest uppercase mb-1">BALANCE</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-[#00FF9D] text-xl font-extrabold font-mono">₹{account.balance}</Text>
          {isDiff && (
            <Text className={`text-xs font-bold ${account.balance > prevBalance ? 'text-[#00FF9D]' : 'text-[#FF3366]'}`}>
              {account.balance > prevBalance ? '▲' : '▼'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
