import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { SendScreen } from '../screens/SendScreen';
import { LedgerScreen } from '../screens/LedgerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // md breakpoint
  const { isOnline, isSyncing, isSidebarOpen, nodeProfile } = useAppStore();

  const tabs = [
    { name: 'Dashboard', icon: 'dashboard', route: 'Home' },
    { name: 'Send', icon: 'send', route: 'Send' },
    { name: 'Ledger', icon: 'history_edu', route: 'Ledger' },
    { name: 'Settings', icon: 'settings', route: 'Settings' },
    { name: 'Profile', icon: 'account_circle', route: 'Profile' }
  ];

  if (isDesktop) {
    if (!isSidebarOpen) return null;
    return (
      <View className="w-64 flex-col bg-surface-container-lowest border-r border-outline-variant z-40 h-full absolute left-0 top-0">
        <View className="p-6 border-b border-outline-variant">
          <TouchableOpacity className="flex-row items-center gap-3" onPress={() => navigation.navigate('Profile')}>
            <View className="w-10 h-10 rounded-full bg-surface-variant items-center justify-center border border-outline overflow-hidden">
              {nodeProfile?.avatarBase64 ? (
                <Image source={{ uri: `data:image/jpeg;base64,${nodeProfile.avatarBase64}` }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="text-xl">🤖</Text>
              )}
            </View>
            <View>
              <Text className="font-label-caps text-[11px] text-primary-container uppercase tracking-widest">{nodeProfile?.name ?? 'Mesh Admin'}</Text>
              <Text className="font-code-sm text-[12px] text-on-surface-variant">{isOnline ? '🟢 Bridge Online' : '🔴 Offline'}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-1 py-4">
          {tabs.map((tab, index) => {
            const isFocused = state.index === index;
            return (
              <TouchableOpacity
                key={tab.route}
                onPress={() => navigation.navigate(tab.route)}
                className={`flex-row items-center gap-4 px-6 py-4 transition-all ${
                  isFocused 
                    ? 'bg-primary-container/10 border-r-4 border-primary-container' 
                    : 'hover:bg-surface-variant/20'
                }`}
              >
                <Text className={isFocused ? 'text-primary-container' : 'text-on-surface-variant'}>•</Text>
                <Text className={`font-label-caps text-[11px] uppercase tracking-widest ${isFocused ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="p-6 border-t border-outline-variant">
          <TouchableOpacity className="w-full bg-surface-variant py-3 rounded hover:bg-surface-container-high transition-colors mb-4 items-center">
            <Text className="text-on-surface font-label-caps text-[11px] uppercase tracking-widest">Gossip Round</Text>
          </TouchableOpacity>
          <View className="flex-col gap-2">
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest hover:text-primary">System Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest hover:text-primary">Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Mobile Bottom Tab Bar
  return (
    <View className="flex-row bg-surface-container-lowest border-t border-outline-variant pb-safe pt-2 px-4 justify-between">
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={tab.route}
            onPress={() => navigation.navigate(tab.route)}
            className="items-center justify-center p-2 flex-1"
          >
            <Text className={`mb-1 text-lg ${isFocused ? 'text-primary-container' : 'text-on-surface-variant'}`}>
              {tab.name.charAt(0)}
            </Text>
            <Text className={`font-label-caps text-[8px] uppercase tracking-widest ${isFocused ? 'text-primary-container' : 'text-on-surface-variant'}`}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// A wrapper to handle the TopNavBar on Desktop and safe areas
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isOnline, isSyncing, isSidebarOpen, toggleSidebar, activeDashboardTab, setActiveDashboardTab } = useAppStore();
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-surface">
      {isDesktop && (
        <View className="flex-row justify-between items-center w-full px-10 h-16 z-50 bg-surface-container-lowest border-b border-outline-variant">
          <View className="flex-row items-center gap-8">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={toggleSidebar} className="p-2 hover:bg-surface-variant/20 rounded-lg transition-colors">
                <Text className="text-primary-container text-xl">☰</Text>
              </TouchableOpacity>
              <Text className="font-headline-sm text-[20px] font-semibold text-primary-container tracking-tighter">
                UPI Mesh Simulator
              </Text>
            </View>
            <View className="flex-row items-center gap-6">
              <TouchableOpacity onPress={() => { setActiveDashboardTab('stats'); navigation.navigate('Home'); }}>
                <Text className={`font-label-caps text-[11px] font-bold uppercase tracking-widest ${activeDashboardTab === 'stats' ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-primary'}`}>Network Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setActiveDashboardTab('traffic'); navigation.navigate('Home'); }}>
                <Text className={`font-label-caps text-[11px] font-bold uppercase tracking-widest ${activeDashboardTab === 'traffic' ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-primary'}`}>Live Traffic</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-4 ml-4 pl-4 border-l border-outline-variant">
              <View className="flex-col gap-1">
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-row items-center gap-1.5">
                    <View className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-primary-container' : 'bg-error'}`} />
                    <Text className="font-label-caps text-[11px] text-primary-container uppercase tracking-widest">
                      {isOnline ? 'SYNC COMPLETE' : 'OFFLINE'}
                    </Text>
                  </View>
                  <Text className="font-code-sm text-[12px] text-primary-container">100%</Text>
                </View>
                <View className="w-32 h-1 bg-surface-bright rounded-full overflow-hidden">
                  <View className="h-full bg-primary-container glow-cyan w-full" />
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      <View className="flex-1 flex-row">
        {children}
      </View>
    </View>
  );
};

export const AppNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isSidebarOpen } = useAppStore();

  return (
    <LayoutWrapper>
      {/* On desktop, Tab.Navigator is placed next to the Sidebar because CustomTabBar renders it. Wait, the Tab.Navigator wraps the content and the TabBar. */}
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        // @ts-ignore: sceneContainerStyle works but TS definition might be missing in some versions
        sceneContainerStyle={isDesktop ? { marginLeft: isSidebarOpen ? 256 : 0, flex: 1, backgroundColor: 'transparent' } : { flex: 1, backgroundColor: 'transparent' }}
        screenOptions={{
          headerShown: !isDesktop, // Show header on mobile, hide on desktop
          headerStyle: { backgroundColor: '#0b0e14', borderBottomWidth: 1, borderBottomColor: '#3b494b' },
          headerTintColor: '#00f0ff',
          headerTitleStyle: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 18 },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Mesh Status' }} />
        <Tab.Screen name="Send" component={SendScreen} options={{ title: 'Inject Payment' }} />
        <Tab.Screen name="Ledger" component={LedgerScreen} options={{ title: 'Global Ledger' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuration' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Node Operator' }} />
      </Tab.Navigator>
    </LayoutWrapper>
  );
};

