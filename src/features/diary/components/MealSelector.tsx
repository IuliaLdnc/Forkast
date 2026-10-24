import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { colors, font, radius, spacing } from '../../../shared/theme';
import { Meal, MEALS } from '../domain/diary';
import { mealLabel } from '../labels';

export function MealSelector({ value, onChange }: { value: Meal; onChange: (meal: Meal) => void }) {
  const { t } = useLang();
  return (
    <View style={styles.row}>
      {MEALS.map(m => {
        const active = value === m;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{t(mealLabel[m])}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  chip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  text: { fontSize: font.tiny, fontWeight: '700', color: colors.textMuted },
  textActive: { color: colors.primaryDark },
});
