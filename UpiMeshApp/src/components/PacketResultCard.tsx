import React from 'react';
import { View, Text } from 'react-native';

interface PacketResultCardProps {
  packetId: string;
  ciphertextHash: string;
  ttl: number;
  injectedAt: string;
}

export const PacketResultCard: React.FC<PacketResultCardProps> = ({
  packetId,
  ciphertextHash,
  ttl,
  injectedAt,
}) => {
  return (
    <View className="bg-[#1A1D24] border border-[#2A2D35] rounded-lg p-4 mt-6">
      <View className="flex-row items-center border-b border-[#2A2D35] pb-3 mb-3">
        <Text className="text-[#00F0FF] font-extrabold flex-1 text-base tracking-widest uppercase">Packet Injected</Text>
        <Text className="text-xl">📤</Text>
      </View>
      
      <View className="gap-3">
        <View>
          <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">PACKET ID</Text>
          <Text className="text-white font-mono text-xs">{packetId}</Text>
        </View>

        <View>
          <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">CIPHERTEXT HASH (SHA-256)</Text>
          <Text className="text-[#00FF9D] font-mono text-[10px] bg-[#0B0E14] p-2 rounded">{ciphertextHash}</Text>
        </View>

        <View className="flex-row justify-between mt-2">
          <View>
            <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">HOPS LEFT (TTL)</Text>
            <Text className="text-white font-bold text-sm">{ttl}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[#8A8D93] text-[10px] font-bold tracking-widest mb-1">TIMESTAMP</Text>
            <Text className="text-white font-bold text-sm">{new Date(injectedAt).toLocaleTimeString()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
