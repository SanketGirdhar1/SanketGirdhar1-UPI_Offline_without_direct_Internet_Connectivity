import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from '../api/apiClient';

export const ProfileScreen: React.FC = () => {
  const { isOnline, nodeProfile, setNodeProfile } = useAppStore();
  const [uptime, setUptime] = useState(0);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null); // base64 string
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    const timer = setInterval(() => setUptime(prev => prev + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchProfile = async () => {
    try {
      const p = await apiClient.getProfile();
      setNodeProfile(p);
    } catch (e) {
      console.log('Error fetching profile', e);
    }
  };

  const formatUptime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const handleEdit = () => {
    setEditName(nodeProfile?.name || 'Mesh Admin');
    setEditAvatar(nodeProfile?.avatarBase64 || null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePickImage = async () => {
    if (!isEditing) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setEditAvatar(result.assets[0].base64);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await apiClient.updateProfile({
        name: editName,
        avatarBase64: editAvatar || undefined,
      });
      setNodeProfile(updated);
      setIsEditing(false);
      Toast.show({ type: 'success', text1: 'Profile Updated' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = nodeProfile?.name || 'Mesh Admin';
  const displayAvatar = nodeProfile?.avatarBase64;

  return (
    <SafeAreaView className="flex-1 bg-surface relative overflow-hidden" edges={['top']}>
      <ScrollView contentContainerClassName="p-4 md:p-10 pb-20">
        
        <View className="mb-6 flex-row justify-between items-start">
          <View>
            <Text className="font-headline-lg text-on-surface text-[32px] font-bold">Node Operator</Text>
            <Text className="font-body-md text-on-surface-variant text-[16px]">Manage your mesh node identity and telemetry.</Text>
          </View>
          
          {!isEditing ? (
            <TouchableOpacity onPress={handleEdit} className="bg-surface-variant px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors">
              <Text className="text-on-surface font-label-caps text-[12px] uppercase tracking-widest font-bold">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleCancel} disabled={isSaving} className="bg-surface-variant px-4 py-2 rounded-lg opacity-80">
                <Text className="text-on-surface font-label-caps text-[12px] uppercase tracking-widest font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={isSaving} className="bg-primary-container/20 border border-primary-container/50 px-4 py-2 rounded-lg flex-row items-center gap-2">
                {isSaving && <ActivityIndicator size="small" color="#00f0ff" />}
                <Text className="text-primary-container font-label-caps text-[12px] uppercase tracking-widest font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="bg-surface-container-low border border-outline-variant rounded-xl p-8 items-center mb-8 shadow-[0_0_20px_rgba(0,240,255,0.03)] relative overflow-hidden">
          <View className="absolute inset-0 opacity-10 border border-outline-variant m-10 rounded-full" />
          <View className="relative mb-6 z-10">
            <TouchableOpacity 
              onPress={handlePickImage} 
              disabled={!isEditing}
              className="w-28 h-28 rounded-full border-4 border-primary-container bg-surface-container-lowest overflow-hidden items-center justify-center"
            >
              {(isEditing ? editAvatar : displayAvatar) ? (
                <Image 
                  source={{ uri: `data:image/jpeg;base64,${isEditing ? editAvatar : displayAvatar}` }} 
                  className="w-full h-full" 
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-5xl">🤖</Text>
              )}
              {isEditing && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <Text className="text-on-surface text-xs font-bold uppercase tracking-widest">Change</Text>
                </View>
              )}
            </TouchableOpacity>
            <View className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-surface-container-low ${isOnline ? 'bg-surface-tint' : 'bg-error'}`} />
          </View>
          
          {isEditing ? (
            <TextInput
              value={editName}
              onChangeText={setEditName}
              className="bg-surface-container-lowest border border-primary-container text-on-surface font-headline-sm text-[20px] font-bold mb-1 z-10 px-4 py-2 rounded-lg text-center min-w-[200px]"
              placeholderTextColor="#899294"
              placeholder="Enter Node Name"
            />
          ) : (
            <Text className="font-headline-sm text-on-surface text-[20px] font-bold mb-1 z-10">{displayName}</Text>
          )}
          
          <Text className="font-label-caps text-primary-container text-[11px] font-bold tracking-widest mb-6 uppercase z-10 mt-2">Primary Bridge Node</Text>
          <View className="flex-row gap-4 z-10">
            <View className="bg-primary-container/10 border border-primary-container/30 px-4 py-2 rounded-full glow-cyan">
              <Text className="font-label-caps text-primary-container text-[11px] font-bold">TRUSTED</Text>
            </View>
            <View className="bg-primary-container/10 border border-primary-container/30 px-4 py-2 rounded-full glow-cyan">
              <Text className="font-label-caps text-primary-container text-[11px] font-bold">RELAY</Text>
            </View>
          </View>
        </View>

        <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mb-4">Telemetry Diagnostics</Text>
        
        <View className="flex-col md:flex-row gap-6 mb-8">
          <View className="flex-1 flex-col gap-6">
            <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-4 uppercase">Network Status</Text>
              <Text className={`font-display-lg text-[36px] font-extrabold ${isOnline ? 'text-surface-tint' : 'text-error'}`}>
                {isOnline ? 'SYNCED' : 'OFFLINE'}
              </Text>
            </View>
            <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-4 uppercase">Node Uptime</Text>
              <Text className="font-display-lg text-on-surface text-[36px] font-extrabold">{formatUptime(uptime)}</Text>
            </View>
          </View>

          <View className="flex-1 flex-col gap-6">
            <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-4 uppercase">Packets Routed</Text>
              <Text className="font-display-lg text-on-surface text-[36px] font-extrabold">1,204</Text>
            </View>
            <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-4 uppercase">Active Transport</Text>
              <Text className="font-headline-sm text-primary-container text-[20px] font-bold mt-2">BLE + Wi-Fi Direct</Text>
            </View>
          </View>
        </View>

        <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mb-4">Cryptographic Identity</Text>
        <View className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
          <View className="mb-6">
            <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-2 uppercase">ED25519 Public Key</Text>
            <View className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg">
              <Text className="font-code-sm text-primary-container text-[12px] opacity-80">ed25519:3b9c8f2a1...</Text>
            </View>
          </View>
          <View>
            <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-2 uppercase">Node Registry ID</Text>
            <View className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg">
              <Text className="font-code-sm text-primary-container text-[12px] opacity-80">node_7x9Qk2PzLw5</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
