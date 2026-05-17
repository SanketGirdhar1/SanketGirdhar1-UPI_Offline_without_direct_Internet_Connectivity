import React from 'react';
import { View, Text } from 'react-native';

interface Transaction {
  id: string;
  senderVpa: string;
  receiverVpa: string;
  amount: number;
  status: 'SETTLED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

interface TransactionRowProps {
  tx: Transaction;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ tx }) => {
  const isSettled = tx.status === 'SETTLED';
  const isFailed = tx.status === 'FAILED';

  return (
    <View className="flex-col md:flex-row p-4 border-b border-[#2A2D35] bg-[#0B0E14] items-center">
      <View className="flex-1 w-full md:w-auto mb-4 md:mb-0">
        <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">TXN ID</Text>
        <Text className="text-white font-mono text-xs">{tx.id}</Text>
      </View>
      
      <View className="flex-1 w-full md:w-auto flex-row justify-between md:justify-center items-center px-4 mb-4 md:mb-0">
        <View className="items-end">
          <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">SENDER</Text>
          <Text className="text-white font-bold">{tx.senderVpa}</Text>
        </View>
        <View className="mx-4">
          <Text className="text-[#00F0FF] text-lg">→</Text>
        </View>
        <View className="items-start">
          <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">RECEIVER</Text>
          <Text className="text-white font-bold">{tx.receiverVpa}</Text>
        </View>
      </View>

      <View className="w-full md:w-auto flex-row justify-between items-center md:flex-col md:items-end">
        <View className="items-start md:items-end mb-2 md:mb-1">
          <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">AMOUNT</Text>
          <Text className="text-[#00FF9D] text-lg font-extrabold font-mono">₹{tx.amount}</Text>
        </View>
        <View className={`px-2 py-1 rounded ${isSettled ? 'bg-[#00FF9D]/20' : isFailed ? 'bg-[#FF3366]/20' : 'bg-[#00F0FF]/20'}`}>
          <Text className={`text-[10px] font-bold tracking-widest ${isSettled ? 'text-[#00FF9D]' : isFailed ? 'text-[#FF3366]' : 'text-[#00F0FF]'}`}>
            {tx.status}
          </Text>
        </View>
      </View>
    </View>
  );
};
