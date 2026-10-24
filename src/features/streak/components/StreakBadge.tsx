import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../../shared/theme';

export function StreakBadge({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={[styles.count, active && styles.countActive]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgWarm,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pillActive: { backgroundColor: colors.accentLight },
  flame: { fontSize: 18 },
  count: { fontSize: font.h3, fontWeight: '900', color: colors.textFaint },
  countActive: { color: colors.accent },
});
