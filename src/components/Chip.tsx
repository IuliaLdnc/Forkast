import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, font, radius, spacing } from '../theme';

export function IngredientChip({
  label,
  emoji,
  selected,
  onPress,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
      {selected && <Text style={styles.check}>✓</Text>}
    </Pressable>
  );
}

export function Tag({
  label,
  emoji,
  style,
}: {
  label: string;
  emoji?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.tag, style]}>
      {emoji ? <Text style={styles.tagEmoji}>{emoji}</Text> : null}
      <Text style={styles.tagLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.7,
  },
  emoji: {
    fontSize: 15,
  },
  label: {
    fontSize: font.small,
    color: colors.text,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.primaryDark,
  },
  check: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '800',
    marginLeft: 2,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    gap: 4,
  },
  tagEmoji: {
    fontSize: 11,
  },
  tagLabel: {
    fontSize: font.tiny,
    color: colors.accent,
    fontWeight: '700',
  },
});
