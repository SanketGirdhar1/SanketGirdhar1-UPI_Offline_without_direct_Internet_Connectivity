import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

type Outcome = 'SETTLED' | 'DUPLICATE_DROPPED' | 'INVALID';

interface OutcomeChipProps {
  outcome: Outcome;
}

const config: Record<Outcome, { label: string; color: string; bg: string }> = {
  SETTLED: { label: '✓ SETTLED', color: theme.colors.success, bg: theme.colors.successGlow },
  DUPLICATE_DROPPED: { label: '⊘ DUPLICATE', color: theme.colors.warning, bg: theme.colors.warningGlow },
  INVALID: { label: '✕ INVALID', color: theme.colors.danger, bg: theme.colors.dangerGlow },
};

export const OutcomeChip: React.FC<OutcomeChipProps> = ({ outcome }) => {
  const c = config[outcome] ?? config.INVALID;
  return (
    <View style={[styles.chip, { backgroundColor: c.bg, borderColor: c.color }]}>
      <Text style={[styles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
