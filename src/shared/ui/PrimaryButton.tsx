import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  disabled: {
    backgroundColor: colors.borderStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    backgroundColor: colors.primaryDark,
  },
  label: {
    color: colors.white,
    fontSize: font.h3,
    fontWeight: '700',
  },
  labelDisabled: {
    color: colors.surface,
  },
});
