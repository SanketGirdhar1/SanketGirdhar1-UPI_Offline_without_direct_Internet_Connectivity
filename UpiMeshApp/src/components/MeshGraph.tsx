import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { DeviceState } from '../api/apiClient';
import { NodeBadge } from './NodeBadge';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');
const GRAPH_SIZE = width - 48;
const CX = GRAPH_SIZE / 2;
const CY = GRAPH_SIZE / 2;
const RADIUS = GRAPH_SIZE * 0.35;

// Pentagon positions: top, top-right, bottom-right, bottom-left, top-left
const angles = [-90, -18, 54, 126, 198];
const getPos = (i: number) => ({
  x: CX + RADIUS * Math.cos((angles[i] * Math.PI) / 180),
  y: CY + RADIUS * Math.sin((angles[i] * Math.PI) / 180),
});

interface MeshGraphProps {
  devices: DeviceState[];
  pulsing?: boolean;
}

export const MeshGraph: React.FC<MeshGraphProps> = ({ devices, pulsing = false }) => {
  const positions = devices.map((_, i) => getPos(i));

  return (
    <View style={[styles.container, { width: GRAPH_SIZE, height: GRAPH_SIZE }]}>
      {/* SVG edges */}
      <Svg width={GRAPH_SIZE} height={GRAPH_SIZE} style={StyleSheet.absoluteFill}>
        {positions.map((from, i) =>
          positions.slice(i + 1).map((to, j) => (
            <Line
              key={`${i}-${i + j + 1}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={theme.colors.primaryGlow}
              strokeWidth={1.5}
              strokeDasharray="4 6"
            />
          ))
        )}
        {/* Glowing node circles behind badges */}
        {positions.map((pos, i) => {
          const dev = devices[i];
          const color = dev?.hasInternet ? theme.colors.successGlow : theme.colors.primaryGlow;
          return (
            <Circle
              key={`glow-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={28}
              fill={color}
              opacity={0.12}
            />
          );
        })}
      </Svg>

      {/* Node badges */}
      {devices.map((device, i) => (
        <NodeBadge
          key={device.deviceId}
          device={device}
          x={positions[i].x}
          y={positions[i].y}
          pulse={pulsing || device.packetCount > 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
});
