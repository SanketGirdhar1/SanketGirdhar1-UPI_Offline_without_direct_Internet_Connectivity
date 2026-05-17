import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SettingsScreen: React.FC = () => {
  const [bleEnabled, setBleEnabled] = React.useState(true);
  const [wifiDirectEnabled, setWifiDirectEnabled] = React.useState(true);
  const [autoFlush, setAutoFlush] = React.useState(false);

  return (
    <SafeAreaView className="flex-1 bg-surface relative overflow-hidden" edges={['top']}>
      <ScrollView contentContainerClassName="p-4 md:p-10 pb-20">
        <View className="mb-6">
          <Text className="font-headline-lg text-on-surface text-[32px] font-bold">Configuration</Text>
          <Text className="font-body-md text-on-surface-variant text-[16px]">Node transport settings and protocol parameters.</Text>
        </View>

        <View className="flex-col md:flex-row gap-6 mb-8">
          <View className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
            <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-6 uppercase">Transport Layers</Text>
            
            <View className="flex-row justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <View>
                <Text className="font-headline-sm text-on-surface text-[16px] font-semibold mb-1">Bluetooth Low Energy</Text>
                <Text className="font-body-sm text-outline-variant text-[12px]">Primary offline transport mechanism.</Text>
              </View>
              <Switch
                trackColor={{ false: '#32353c', true: '#00f0ff' }}
                thumbColor={bleEnabled ? '#0b0e14' : '#b9cacb'}
                onValueChange={setBleEnabled}
                value={bleEnabled}
              />
            </View>

            <View className="flex-row justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <View>
                <Text className="font-headline-sm text-on-surface text-[16px] font-semibold mb-1">Wi-Fi Direct</Text>
                <Text className="font-body-sm text-outline-variant text-[12px]">High-bandwidth secondary transport.</Text>
              </View>
              <Switch
                trackColor={{ false: '#32353c', true: '#00f0ff' }}
                thumbColor={wifiDirectEnabled ? '#0b0e14' : '#b9cacb'}
                onValueChange={setWifiDirectEnabled}
                value={wifiDirectEnabled}
              />
            </View>

            <View className="flex-row justify-between items-center pb-2">
              <View>
                <Text className="font-headline-sm text-on-surface text-[16px] font-semibold mb-1">Auto-Flush to Ledger</Text>
                <Text className="font-body-sm text-outline-variant text-[12px]">Upload packets automatically when internet is detected.</Text>
              </View>
              <Switch
                trackColor={{ false: '#32353c', true: '#00f0ff' }}
                thumbColor={autoFlush ? '#0b0e14' : '#b9cacb'}
                onValueChange={setAutoFlush}
                value={autoFlush}
              />
            </View>
          </View>

          <View className="flex-1 flex-col gap-6">
            <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-4 uppercase">Protocol Version</Text>
              <View className="bg-surface-container-lowest border border-primary-container/30 p-4 rounded-lg flex-row justify-between items-center glow-cyan">
                <Text className="font-code-sm text-primary-container text-[14px]">v2.4.1-STITCH</Text>
                <Text className="font-label-caps text-primary-container text-[9px] font-bold tracking-widest uppercase border border-primary-container/50 px-2 py-1 rounded">LATEST</Text>
              </View>
            </View>

            <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)] flex-1">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-4 uppercase">System Limits</Text>
              
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-code-sm text-on-surface-variant text-[12px]">Max Hop Count</Text>
                  <Text className="font-code-sm text-on-surface text-[12px]">16</Text>
                </View>
                <View className="w-full h-1 bg-surface-variant rounded-full">
                  <View className="h-full bg-on-surface w-1/2 rounded-full" />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="font-code-sm text-on-surface-variant text-[12px]">Idempotency TTL (Days)</Text>
                  <Text className="font-code-sm text-on-surface text-[12px]">7</Text>
                </View>
                <View className="w-full h-1 bg-surface-variant rounded-full">
                  <View className="h-full bg-primary-container w-1/4 rounded-full glow-cyan" />
                </View>
              </View>

            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
