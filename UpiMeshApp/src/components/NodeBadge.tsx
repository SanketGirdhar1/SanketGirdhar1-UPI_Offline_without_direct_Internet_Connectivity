import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { DeviceState } from '../api/apiClient';
import { theme } from '../theme/theme';

interface NodeBadgeProps {
  device: DeviceState;
  x: number;
  y: number;
  pulse?: boolean;
}

export const NodeBadge: React.FC<NodeBadgeProps> = ({ device, x, y, pulse }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [pulse]);

  const isBridge = device.hasInternet;
  const nodeColor = isBridge ? theme.colors.nodeBridge : theme.colors.nodeOffline;
  const hasPackets = device.packetCount > 0;

  return (
    <View style={[styles.container, { left: x - 30, top: y - 30 }]}>
      {/* Pulse ring */}
      {pulse && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: nodeColor,
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
      )}

      {/* Node body */}
      <View style={[styles.node, { borderColor: nodeColor, backgroundColor: isBridge ? theme.colors.successGlow : 'rgba(42,48,80,0.9)' }]}>
        <Text style={styles.icon}>{isBridge ? '📡' : '📱'}</Text>
      </View>

      {/* Packet count badge */}
      {hasPackets && (
        <View style={[styles.badge, { backgroundColor: theme.colors.warning }]}>
          <Text style={styles.badgeText}>{device.packetCount}</Text>
        </View>
      )}

      {/* Label */}
      <Text style={[styles.label, { color: isBridge ? theme.colors.success : theme.colors.subtext }]} numberOfLines={1}>
        {device.deviceId.replace('phone-', '')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 60,
    height: 70,
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    top: 2,
  },
  node: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.bg,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  label: {
    fontSize: 9,
    fontWeight: theme.fontWeight.medium,
    marginTop: 4,
    textAlign: 'center',
  },
});
