import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../store/useAppStore';
import { apiClient, Account } from '../api/apiClient';

export const SendScreen: React.FC = () => {
  const { addLog } = useAppStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [senderVpa, setSenderVpa] = useState('alice@demo');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptionStep, setEncryptionStep] = useState(0);
  const [lastPacketId, setLastPacketId] = useState<string | null>(null);
  const [lastCiphertext, setLastCiphertext] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getAccounts().then(setAccounts).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!recipient || !amount || !pin || !senderVpa) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Amount must be greater than 0' });
      return;
    }

    setIsProcessing(true);
    setEncryptionStep(1);
    setLastPacketId(null);
    setLastCiphertext(null);

    try {
      // Step 1: Hashing
      await new Promise(r => setTimeout(r, 600));
      setEncryptionStep(2);

      // Step 2: Sign + encrypt (backend does RSA-OAEP + AES-GCM)
      await new Promise(r => setTimeout(r, 600));
      setEncryptionStep(3);

      // Step 3: Call real backend API
      const res = await apiClient.sendPayment({
        senderVpa,
        receiverVpa: recipient,
        amount: amountNum,
        pin,
        ttl: 5,
      });

      setEncryptionStep(4);
      setLastPacketId(res.packetId);
      setLastCiphertext(res.ciphertextPreview);

      addLog(`[TX] Injected ₹${amount} from ${senderVpa} → ${recipient}. PacketID: ${res.packetId.substring(0, 8)}...`);
      addLog(`[MESH] Packet queued at device: ${res.injectedAt}. TTL: ${res.ttl} hops.`);

      Toast.show({
        type: 'success',
        text1: 'Payment Injected ✓',
        text2: `₹${amount} packet injected into mesh. Go Gossip → Flush to settle.`,
      });

      // Refresh accounts to show current balances (won't change until flush)
      const updated = await apiClient.getAccounts();
      setAccounts(updated);

      setRecipient('');
      setAmount('');
      setPin('');
    } catch (e: any) {
      addLog(`[ERROR] Injection failed: ${e.response?.data?.message || e.message}`);
      Toast.show({
        type: 'error',
        text1: 'Injection Failed',
        text2: e.response?.data?.message || e.message,
      });
      setEncryptionStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const senderBalance = accounts.find(a => a.vpa === senderVpa)?.balance;

  return (
    <SafeAreaView className="flex-1 bg-surface relative overflow-hidden" edges={['top']}>
      <ScrollView contentContainerClassName="p-4 md:p-10 pb-20">
        <View className="mb-6">
          <Text className="font-headline-lg text-on-surface text-[32px] font-bold">Payment Injection</Text>
          <Text className="font-body-md text-on-surface-variant text-[16px]">Secure offline transaction signing and mesh routing.</Text>
        </View>

        <View className="flex-col md:flex-row gap-6">
          {/* Left: Form */}
          <View className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)]">
            <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-6 uppercase">Transaction Details</Text>

            {/* Sender Picker */}
            <View className="mb-4">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-2 uppercase">Sender Account</Text>
              <View className="flex-row flex-wrap gap-2">
                {accounts.map(acc => (
                  <TouchableOpacity
                    key={acc.vpa}
                    onPress={() => setSenderVpa(acc.vpa)}
                    className={`px-3 py-2 rounded-lg border ${senderVpa === acc.vpa ? 'bg-primary-container/20 border-primary-container' : 'border-outline-variant bg-surface-container-lowest'}`}
                  >
                    <Text className={`font-code-sm text-[11px] font-bold ${senderVpa === acc.vpa ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                      {acc.holderName}
                    </Text>
                    <Text className={`font-code-sm text-[10px] ${senderVpa === acc.vpa ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                      ₹{acc.balance.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {senderBalance !== undefined && (
                <Text className="font-code-sm text-on-surface-variant text-[11px] mt-2">
                  Available: <Text className="text-primary-container font-bold">₹{senderBalance.toLocaleString('en-IN')}</Text>
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-2 uppercase">Recipient UPI ID</Text>
              <TextInput
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 text-on-surface font-code-sm text-[14px]"
                placeholder="bob@demo"
                placeholderTextColor="#42474f"
                value={recipient}
                onChangeText={setRecipient}
                editable={!isProcessing}
                autoCapitalize="none"
              />
              {/* Quick recipient picks */}
              <View className="flex-row flex-wrap gap-2 mt-2">
                {accounts.filter(a => a.vpa !== senderVpa).map(acc => (
                  <TouchableOpacity key={acc.vpa} onPress={() => setRecipient(acc.vpa)} className="px-3 py-1 rounded border border-outline-variant bg-surface-container-lowest">
                    <Text className="font-code-sm text-on-surface-variant text-[10px]">{acc.vpa}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-2 uppercase">Amount (INR)</Text>
              <TextInput
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 text-on-surface font-code-sm text-[14px]"
                placeholder="0.00"
                placeholderTextColor="#42474f"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                editable={!isProcessing}
              />
            </View>

            <View className="mb-8">
              <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-2 uppercase">Offline PIN</Text>
              <TextInput
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 text-on-surface font-code-sm text-[14px]"
                placeholder="1234"
                placeholderTextColor="#42474f"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={pin}
                onChangeText={setPin}
                editable={!isProcessing}
              />
              <Text className="font-code-sm text-on-surface-variant text-[10px] mt-1">Demo PIN: 1234</Text>
            </View>

            <TouchableOpacity
              className={`py-4 rounded-lg flex-row items-center justify-center ${isProcessing ? 'bg-outline-variant' : 'bg-primary-container glow-cyan'}`}
              onPress={handleSend}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#00f0ff" />
              ) : (
                <Text className="font-label-caps text-on-primary uppercase tracking-widest text-[14px] font-bold">Inject Packet →</Text>
              )}
            </TouchableOpacity>

            {/* Important note */}
            <View className="mt-4 bg-surface-variant/50 border border-outline-variant rounded-lg p-3">
              <Text className="font-label-caps text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">⚠ Balance reduces after flush</Text>
              <Text className="font-code-sm text-on-surface-variant text-[10px]">
                Offline UPI is deferred settlement. The packet is queued in the mesh. Account balance deducts when a bridge node flushes it to the backend.
              </Text>
            </View>
          </View>

          {/* Right: Encryption Inspector */}
          <View className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.03)] flex-col">
            <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold tracking-widest mb-6 uppercase">Encryption Inspector</Text>

            <View className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
              {encryptionStep === 0 && (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-4xl opacity-50 mb-4">🔐</Text>
                  <Text className="font-code-sm text-outline-variant text-[12px] text-center">Awaiting payload formulation...</Text>
                </View>
              )}

              {encryptionStep >= 1 && (
                <View className="mb-4">
                  <Text className="font-label-caps text-primary-container text-[11px] font-bold mb-1">1. PAYLOAD HASHING (SHA-256)</Text>
                  <Text className="font-code-sm text-on-surface text-[10px] opacity-70">
                    sender={senderVpa}{'\n'}receiver={recipient}{'\n'}amount={amount || '0'}{'\n'}hash: computing...
                  </Text>
                </View>
              )}

              {encryptionStep >= 2 && (
                <View className="mb-4">
                  <Text className="font-label-caps text-primary-container text-[11px] font-bold mb-1">2. RSA-OAEP + AES-256-GCM ENCRYPTION</Text>
                  <Text className="font-code-sm text-on-surface text-[10px] opacity-70">
                    Fetching server public key...{'\n'}
                    Generating AES session key...{'\n'}
                    Encrypting payment instruction...
                  </Text>
                </View>
              )}

              {encryptionStep >= 3 && (
                <View className="mb-4">
                  <Text className="font-label-caps text-on-surface-variant text-[11px] font-bold mb-1">3. CONTACTING BACKEND...</Text>
                  <ActivityIndicator color="#00f0ff" size="small" />
                </View>
              )}

              {encryptionStep >= 4 && lastPacketId && (
                <View className="gap-3">
                  <View className="border border-primary-container/50 rounded-lg p-3 bg-primary-container/5">
                    <Text className="font-label-caps text-primary-container text-[11px] font-bold mb-1">✓ PACKET SIGNED & INJECTED</Text>
                    <Text className="font-code-sm text-on-surface text-[10px]">ID: {lastPacketId.substring(0, 16)}...</Text>
                  </View>
                  {lastCiphertext && (
                    <View>
                      <Text className="font-label-caps text-on-surface-variant text-[10px] font-bold mb-1">CIPHERTEXT PREVIEW</Text>
                      <Text className="font-code-sm text-on-surface text-[10px] opacity-70 break-all">{lastCiphertext}</Text>
                    </View>
                  )}
                  <View className="border border-surface-tint/30 rounded-lg p-3 bg-surface-tint/5">
                    <Text className="font-label-caps text-surface-tint text-[10px] font-bold mb-1">MESH ROUTING</Text>
                    <Text className="font-code-sm text-on-surface-variant text-[10px]">
                      Packet in mesh queue.{'\n'}Go to Home → Gossip → Flush to settle.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
