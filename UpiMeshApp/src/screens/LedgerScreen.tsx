import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../api/apiClient';
import { useAppStore } from '../store/useAppStore';

export const LedgerScreen: React.FC = () => {
  const { isOnline } = useAppStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, [isOnline]); // Refetch if online status changes (e.g. after flush)

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const txs = await apiClient.getTransactions();
      setTransactions(txs);
    } catch (e) {
      console.log('Failed to fetch ledger:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface relative overflow-hidden" edges={['top']}>
      <ScrollView contentContainerClassName="p-4 md:p-10 pb-20">
        <View className="mb-6 flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
          <View>
            <Text className="font-headline-lg text-on-surface text-[32px] font-bold">Distributed Ledger</Text>
            <Text className="font-body-md text-on-surface-variant text-[16px]">Global transaction history and account balances.</Text>
          </View>
          <View className="bg-surface-container-low border border-outline-variant px-4 py-2 rounded-lg flex-row items-center gap-2">
             <View className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary-container animate-pulse' : 'bg-error'}`} />
             <Text className="font-code-sm text-on-surface text-[12px]">Block: #49281</Text>
          </View>
        </View>

        <View className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.03)] flex-1 min-h-[500px]">
          <View className="p-4 border-b border-outline-variant flex-row justify-between bg-surface-container-low/50">
            <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold w-1/4">Packet ID</Text>
            <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold w-1/4 text-center">Type</Text>
            <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold w-1/4 text-right">Amount</Text>
            <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold w-1/4 text-right">Status</Text>
          </View>
          
          {loading ? (
            <View className="flex-1 items-center justify-center p-10">
              <ActivityIndicator color="#00f0ff" size="large" />
            </View>
          ) : transactions.length === 0 ? (
            <View className="flex-1 items-center justify-center p-10">
              <Text className="text-4xl mb-4 opacity-50">📭</Text>
              <Text className="font-body-md text-on-surface-variant">No transactions in global ledger yet.</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} className="p-4 border-b border-outline-variant/30 flex-row justify-between items-center hover:bg-primary-container/5 transition-colors">
                <View className="w-1/4">
                  <Text className="font-code-sm text-on-surface text-[12px]">{tx.packetHash ? tx.packetHash.substring(0, 10) : tx.id}...</Text>
                  <Text className="font-code-sm text-outline-variant text-[10px]">{new Date(tx.settledAt).toLocaleString()}</Text>
                </View>
                <View className="w-1/4 items-center">
                  <View className="bg-surface-variant px-3 py-1 rounded">
                    <Text className="font-code-sm text-on-surface-variant text-[10px] uppercase">TRANSFER</Text>
                  </View>
                </View>
                <View className="w-1/4 items-end">
                  <Text className="font-code-sm text-on-surface text-[12px]">₹{tx.amount}</Text>
                </View>
                <View className="w-1/4 items-end">
                  <View className={`border px-3 py-1 rounded-full ${tx.status === 'SETTLED' ? 'bg-surface-container-lowest border-primary-container/50 glow-cyan' : 'bg-error/10 border-error/50'}`}>
                    <Text className={`font-label-caps text-[9px] font-bold tracking-widest uppercase ${tx.status === 'SETTLED' ? 'text-primary-container' : 'text-error'}`}>{tx.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
