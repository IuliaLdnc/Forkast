import React from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { sanitizeInteger } from '../lib/numberInput';
import { colors, font, radius, spacing } from '../theme';

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textFaint}
      {...props}
      style={[styles.textInput, props.style]}
    />
  );
}

export function NumberField({
  label,
  value,
  onChange,
  size = 'sm',
  keyboardType = 'decimal-pad',
  maxLength = 7,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'lg';
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  placeholder?: string;
}) {
  const lg = size === 'lg';
  return (
    <View style={styles.flex}>
      <Text style={[styles.numberLabel, lg && styles.numberLabelLg]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={[styles.numberInput, lg && styles.numberInputLg]}
      />
    </View>
  );
}

export function GramsInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={v => onChange(sanitizeInteger(v))}
      keyboardType="number-pad"
      maxLength={4}
      placeholder="0"
      placeholderTextColor={colors.textFaint}
      style={styles.gramsInput}
      autoFocus={autoFocus}
    />
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'lg',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'lg';
}) {
  const sm = size === 'sm';
  return (
    <View style={[styles.segmented, sm && styles.segmentedSm]}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, sm && styles.segmentSm, active && styles.segmentActive]}
          >
            <Text
              style={[
                styles.segmentText,
                sm && styles.segmentTextSm,
                active && styles.segmentTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SelectChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.selectChip, active && styles.selectChipActive]}>
      <Text style={[styles.selectChipText, active && styles.selectChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={styles.back}>{label}</Text>
    </Pressable>
  );
}

export function SubmitButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.submit}>
      <Text style={styles.submitText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },

  numberLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  numberLabelLg: { marginBottom: 6, textAlign: 'left' },
  numberInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  numberInputLg: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: font.h3,
  },
  gramsInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },

  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: 4,
  },
  segmentedSm: { gap: 4 },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentSm: { paddingVertical: spacing.sm },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: font.body, fontWeight: '700', color: colors.textMuted },
  segmentTextSm: { fontSize: font.small },
  segmentTextActive: { color: colors.white },

  selectChip: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  selectChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  selectChipText: { fontSize: font.small, fontWeight: '700', color: colors.textMuted },
  selectChipTextActive: { color: colors.primaryDark },

  fieldLabel: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  back: {
    fontSize: font.body,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  submit: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  submitText: { color: colors.white, fontWeight: '700', fontSize: font.h3 },
});
