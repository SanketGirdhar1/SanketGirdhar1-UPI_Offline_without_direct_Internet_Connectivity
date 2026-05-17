import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../store/useAppStore';
import { apiClient, MeshState, Account } from '../api/apiClient';

export const HomeScreen: React.FC = () => {
  const { isOnline, setIsOnline, isSyncing, setIsSyncing, meshLogs, addLog, clearLogs } = useAppStore();

  const [meshState, setMeshState] = useState<MeshState | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const prevAccountsRef = React.useRef<Account[]>([]);
  const prevMeshStateRef = React.useRef<MeshState | null>(null);
  const { activeDashboardTab } = useAppStore();
  
  const [gossipTransfers, setGossipTransfers] = useState<number>(0);
  const [totalGossipTransfers, setTotalGossipTransfers] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (silent = false) => {
    try {
      const [state, accs] = await Promise.all([
        apiClient.getMeshState(),
        apiClient.getAccounts(),
      ]);
      // Compare and log mesh changes
      const prevMesh = prevMeshStateRef.current;
      if (prevMesh && !silent) {
        state.devices.forEach(d => {
          const old = prevMesh.devices.find(od => od.deviceId === d.deviceId);
          if (old && d.packetCount !== old.packetCount) {
            addLog(`[MESH] 📡 ${d.deviceId}: ${old.packetCount} → ${d.packetCount} packet(s)`);
          }
        });
      }
      prevMeshStateRef.current = state;
      setMeshState(state);

      // Compare and log account changes
      const prevAccs = prevAccountsRef.current;
      if (prevAccs.length > 0 && !silent) {
        accs.forEach(acc => {
          const old = prevAccs.find(a => a.vpa === acc.vpa);
          if (old && old.balance !== acc.balance) {
            const diff = acc.balance - old.balance;
            addLog(`[LEDGER] 💰 ${acc.holderName} (${acc.vpa}): ₹${old.balance} → ₹${acc.balance} (${diff > 0 ? '+' : ''}${diff})`);
          }
        });
      }
      prevAccountsRef.current = accs;
      setAccounts(accs);
      
      setIsOnline(true);
    } catch (e: any) {
      setIsOnline(false);
      if (!silent) addLog('[ERROR] ❌ Cannot reach backend at port 8082. Is Spring Boot running?');
    }
  }, [addLog]);

  useEffect(() => {
    // Seed startup logs immediately
    addLog('[SYSTEM] 🚀 UPI Mesh Simulator initialized');
    addLog('[SYSTEM] 🔌 Connecting to backend at localhost:8082...');
    fetchDashboardData().then(() => {
      addLog('[SYSTEM] ✅ Backend connected. 4 accounts loaded.');
      addLog('[SYSTEM] 📡 Mesh topology ready. Triggering initial gossip...');
    }).catch(() => {
      addLog('[ERROR] ❌ Backend unreachable. Make sure Spring Boot is running on port 8082.');
    });
    // Poll mesh state every 30 seconds
    const poll = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(poll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleGossip = async () => {
    setIsSyncing(true);
    addLog('[GOSSIP] Broadcasting beacon to nearby peers...');
    try {
      const res = await apiClient.gossip();
      setIsOnline(true);
      setGossipTransfers(res.transfers);
      setTotalGossipTransfers(prev => prev + res.transfers);
      // Log per-device packet distribution
      Object.entries(res.deviceCounts).forEach(([device, count]) => {
        addLog(`[GOSSIP] 📡 ${device} → ${count} packet(s)`);
      });
      if (res.transfers === 0) {
        addLog('[GOSSIP] No packets in mesh to transfer. Send a payment first.');
      } else {
        addLog(`[GOSSIP] ✔ ${res.transfers} transfer(s) relayed across ${Object.keys(res.deviceCounts).length} nodes.`);
      }
      Toast.show({ type: 'success', text1: 'Mesh Synced', text2: `Transferred ${res.transfers} packets.` });
      await fetchDashboardData();
    } catch (e: any) {
      setIsOnline(false);
      addLog(`[ERROR] Gossip failed: ${e.message}`);
      Toast.show({ type: 'error', text1: 'Sync Failed', text2: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFlush = async () => {
    setIsSyncing(true);
    addLog('[FLUSH] Aggregating offline packets from bridge nodes...');
    try {
      const res = await apiClient.flush();
      const settled = res.results.filter(r => r.outcome === 'SETTLED');
      const dropped = res.results.filter(r => r.outcome === 'DUPLICATE_DROPPED');
      const invalid = res.results.filter(r => r.outcome === 'INVALID');
      // Log each individual packet outcome
      settled.forEach(r => addLog(`[SETTLE] ✅ Packet ${r.packetId}... SETTLED → TxID #${r.transactionId} via ${r.bridgeNode}`));
      dropped.forEach(r => addLog(`[IDEMPOTENCY] 🛡️ Packet ${r.packetId}... DUPLICATE BLOCKED by ${r.bridgeNode}`));
      invalid.forEach(r => addLog(`[REJECT] ❌ Packet ${r.packetId}... REJECTED: ${r.reason}`));
      if (dropped.length > 0) {
        addLog(`[IDEMPOTENCY] ✅ ${dropped.length} duplicate(s) detected — double-spend attack prevented!`);
      }
      addLog(`[FLUSH] Done. Settled: ${settled.length}, Duplicates blocked: ${dropped.length}, Invalid: ${invalid.length}`);
      Toast.show({ type: 'success', text1: 'Flush Complete', text2: `Settled: ${settled.length} | Dup blocked: ${dropped.length}` });
      await fetchDashboardData();
    } catch (e: any) {
      addLog(`[ERROR] Bridge upload failed: ${e.message}`);
      Toast.show({ type: 'error', text1: 'Flush Failed', text2: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = async () => {
    try {
      await apiClient.reset();
      setGossipTransfers(0);
      setTotalGossipTransfers(0);
      addLog('[RESET] Mesh and idempotency cache cleared.');
      Toast.show({ type: 'success', text1: 'Reset Complete' });
      await fetchDashboardData();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Reset Failed', text2: e.message });
    }
  };

  const idempotencyCacheSize = meshState?.idempotencyCacheSize ?? 0;
  const totalPackets = meshState?.devices.reduce((acc, d) => acc + d.packetCount, 0) ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-surface relative overflow-hidden flex-col" edges={['top']}>
      {/* Sync Complete Banner */}
      {isOnline && (
        <View className="flex-row items-center justify-between bg-primary-container/10 border border-primary-container/30 p-4 rounded-xl mb-4 mx-4 md:mx-10 mt-4">
          <View className="flex-row items-center gap-3">
            <Text className="text-primary-container text-xl">✓</Text>
            <View>
              <Text className="font-label-caps font-bold text-primary-container uppercase tracking-widest text-[11px]">Backend Connected</Text>
              <Text className="font-body-sm text-on-surface-variant text-[14px]">Spring Boot API live on port 8082.</Text>
            </View>
          </View>
        </View>
      )}

      {/* Header Section */}
      <View className="flex-col md:flex-row justify-between items-start md:items-end px-4 md:px-10 mb-6 gap-4 md:gap-0">
        <View>
          <Text className="font-headline-lg text-on-surface text-[32px] font-bold">
            {activeDashboardTab === 'stats' ? 'UPI Mesh Network' : 'Live Traffic Log'}
          </Text>
          <Text className="font-body-md text-on-surface-variant text-[16px]">
            {activeDashboardTab === 'stats' ? 'Offline bluetooth protocol simulator' : 'Global terminal log for all mesh nodes'}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-4">
          <TouchableOpacity
            className="bg-primary-container px-6 py-2 rounded-lg glow-cyan flex-row items-center justify-center"
            onPress={handleGossip}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#00363a" size="small" />
            ) : (
              <Text className="font-label-caps text-on-primary uppercase tracking-widest text-[11px] font-bold">Gossip Round</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-primary-container px-6 py-2 rounded-lg flex-row items-center justify-center hover:bg-primary-container/10"
            onPress={handleFlush}
            disabled={isSyncing}
          >
            <Text className="font-label-caps text-primary-container uppercase tracking-widest text-[11px] font-bold">Flush Bridges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-error/50 px-6 py-2 rounded-lg"
            onPress={handleReset}
            disabled={isSyncing}
          >
            <Text className="font-label-caps text-error uppercase tracking-widest text-[11px] font-bold">Reset Mesh</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="p-4 md:p-10 pt-0 md:pt-0 pb-20"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00f0ff" />}
      >
        {activeDashboardTab === 'stats' ? (
          <View className="flex-col md:flex-row gap-6">

            {/* Main Column */}
            <View className="flex-1 flex-col gap-6">

              {/* MeshGraph / Device Topology */}
              <View className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.03)]">
                <View className="p-4 border-b border-outline-variant flex-row justify-between items-center bg-surface-container-low/50">
                  <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">MeshGraph: Live Device Topology</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                    <Text className="font-code-sm text-primary-container text-[12px]">
                      Active Nodes: {meshState?.devices.length ?? '—'}
                    </Text>
                  </View>
                </View>
                {/* Device cards */}
                <View className="p-4 flex-row flex-wrap gap-3">
                  {meshState ? meshState.devices.map(device => (
                    <View key={device.deviceId} className={`border rounded-lg p-3 min-w-[140px] flex-1 ${device.hasInternet ? 'border-primary-container/60 bg-primary-container/5' : 'border-outline-variant bg-surface-container-lowest'}`}>
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className={`w-2 h-2 rounded-full ${device.hasInternet ? 'bg-primary-container' : 'bg-on-surface-variant'}`} />
                        <Text className="font-code-sm text-on-surface text-[11px] font-bold">{device.deviceId}</Text>
                      </View>
                      <Text className="font-code-sm text-on-surface-variant text-[10px]">
                        {device.hasInternet ? '🌐 BRIDGE NODE' : '📡 OFFLINE'}
                      </Text>
                      <Text className="font-code-sm text-primary-container text-[10px] mt-1">
                        Packets: {device.packetCount}
                      </Text>
                    </View>
                  )) : (
                    <View className="flex-1 items-center justify-center p-8">
                      <ActivityIndicator color="#00f0ff" />
                      <Text className="font-code-sm text-on-surface-variant text-[12px] mt-4">Connecting to backend...</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Account Balances — proves deduction works */}
              <View className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.03)]">
                <View className="p-4 border-b border-outline-variant flex-row justify-between items-center">
                  <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">Live Account Balances</Text>
                  <Text className="font-code-sm text-on-surface-variant text-[10px]">Updated after each flush</Text>
                </View>
                <View className="p-4">
                  {accounts.length === 0 ? (
                    <ActivityIndicator color="#00f0ff" />
                  ) : accounts.map(acc => (
                    <View key={acc.vpa} className="flex-row justify-between items-center py-3 border-b border-outline-variant/30">
                      <View>
                        <Text className="font-code-sm text-on-surface text-[13px] font-bold">{acc.holderName}</Text>
                        <Text className="font-code-sm text-on-surface-variant text-[11px]">{acc.vpa}</Text>
                      </View>
                      <Text className="font-headline-sm text-on-surface text-[16px] font-bold">₹{acc.balance.toLocaleString('en-IN')}</Text>
                    </View>
                  ))}
                </View>
              </View>

            </View>

            {/* Right Column Stats — ALL LIVE DATA */}
            <View className="w-full md:w-80 flex-col gap-6">

              <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
                <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold mb-3">Idempotency Cache</Text>
                <Text className="font-display-lg text-on-surface text-[48px] font-extrabold mb-1">{idempotencyCacheSize}</Text>
                <Text className="font-code-sm text-primary-container text-[12px]">Settled packet hashes stored</Text>
                <Text className="font-code-sm text-on-surface-variant text-[10px] mt-1">Prevents duplicate settlements</Text>
              </View>

              <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
                <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold mb-3">Last Gossip Transfers</Text>
                <Text className={`font-display-lg text-[48px] font-extrabold mb-1 ${gossipTransfers > 0 ? 'text-primary-container' : 'text-on-surface'}`}>{gossipTransfers}</Text>
                <Text className="font-code-sm text-on-surface-variant text-[12px]">Total this session: {totalGossipTransfers}</Text>
              </View>

              <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
                <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold mb-3">In-Flight Packets</Text>
                <Text className={`font-display-lg text-[48px] font-extrabold mb-1 ${totalPackets > 0 ? 'text-surface-tint' : 'text-on-surface'}`}>{totalPackets}</Text>
                <Text className="font-code-sm text-on-surface-variant text-[12px]">Queued across all mesh nodes</Text>
              </View>

              <View className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
                <View className="p-4 border-b border-outline-variant">
                  <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">How to Test Idempotency</Text>
                </View>
                <View className="p-4 gap-3">
                  <View className="flex-row gap-3 items-start">
                    <Text className="font-code-sm text-primary-container text-[11px] font-bold">1.</Text>
                    <Text className="font-code-sm text-on-surface-variant text-[11px] flex-1">Send a payment on the Send tab</Text>
                  </View>
                  <View className="flex-row gap-3 items-start">
                    <Text className="font-code-sm text-primary-container text-[11px] font-bold">2.</Text>
                    <Text className="font-code-sm text-on-surface-variant text-[11px] flex-1">Click "Gossip Round" multiple times to spread packet to all nodes</Text>
                  </View>
                  <View className="flex-row gap-3 items-start">
                    <Text className="font-code-sm text-primary-container text-[11px] font-bold">3.</Text>
                    <Text className="font-code-sm text-on-surface-variant text-[11px] flex-1">Click "Flush Bridges" — only 1 settles, duplicates are DROPPED</Text>
                  </View>
                  <View className="flex-row gap-3 items-start">
                    <Text className="font-code-sm text-primary-container text-[11px] font-bold">4.</Text>
                    <Text className="font-code-sm text-on-surface-variant text-[11px] flex-1">Check Idempotency Cache counter increases (≥1) and Ledger shows SETTLED</Text>
                  </View>
                </View>
              </View>

            </View>

          </View>
        ) : (
          <View className="flex-1 min-h-[600px]">
            {/* Full Screen Live Traffic Log */}
            <View className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.03)] flex-1 h-full">
              <View className="px-4 py-4 border-b border-outline-variant flex-row justify-between items-center bg-surface-container-low">
                <View className="flex-row items-center gap-3">
                  <View className="w-2 h-2 rounded-full bg-primary-container" style={{ shadowColor: '#00f0ff', shadowOpacity: 0.8, shadowRadius: 4 }} />
                  <Text className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[12px] font-bold">Global Terminal Output</Text>
                  <View className="bg-primary-container/20 px-2 py-0.5 rounded">
                    <Text className="font-code-sm text-primary-container text-[11px]">{meshLogs.length} events</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={clearLogs} className="px-4 py-1.5 rounded bg-surface-variant hover:bg-surface-bright border border-outline-variant">
                  <Text className="font-code-sm text-on-surface-variant text-[11px] uppercase tracking-widest">Clear Logs</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="flex-1 p-4 bg-[#0A0E17]" contentContainerStyle={{ flexDirection: 'column-reverse' }}>
                {meshLogs.slice().reverse().map((entry, idx) => {
                  const msgText = typeof entry === 'string' ? entry : (entry?.message || '');
                  const timeText = typeof entry === 'string' ? '' : (entry?.time || '');
                  
                  const isError = msgText.includes('[ERROR]');
                  const isSettle = msgText.includes('[SETTLE]');
                  const isIdempotency = msgText.includes('[IDEMPOTENCY]');
                  const isSystem = msgText.includes('[SYSTEM]');
                  const isLedger = msgText.includes('[LEDGER]');
                  const msgColor = isError ? 'text-error' : isSettle ? 'text-surface-tint' : isIdempotency ? 'text-primary-container' : isLedger ? 'text-[#FBF8CC]' : isSystem ? 'text-[#B9FBC0]' : 'text-[#A0C4FF]';
                  
                  return (
                    <View key={idx} className="flex-row items-start gap-3 py-2 border-b border-outline-variant/10">
                      <Text className="font-code-sm text-[#4A5568] text-[11px] w-16 mt-0.5 flex-shrink-0">{timeText}</Text>
                      <Text className={`font-code-sm flex-1 text-[13px] leading-5 ${msgColor}`}>{msgText}</Text>
                    </View>
                  );
                })}
                {meshLogs.length === 0 && (
                  <View className="items-center justify-center p-8">
                    <Text className="font-code-sm text-outline-variant text-[12px]">Waiting for network events...</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
