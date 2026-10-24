import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Macros } from '../../core/macros';
import { useLang } from '../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../theme';

// Inline "123 kcal  P 10  F 5  C 20  per 100 g" row.
export function MacroTags({ macros, note }: { macros: Macros; note?: string }) {
  const { t } = useLang();
  return (
    <View style={styles.tags}>
      <View style={styles.kcalPill}>
        <Text style={styles.kcalPillText}>
          {macros.kcal} {t('detail.kcal')}
        </Text>
      </View>
      <Text style={[styles.tag, { color: colors.protein }]}>
        {t('macro.pShort')} {macros.protein}
      </Text>
      <Text style={[styles.tag, { color: colors.fat }]}>
        {t('macro.fShort')} {macros.fat}
      </Text>
      <Text style={[styles.tag, { color: colors.carbs }]}>
        {t('macro.cShort')} {macros.carbs}
      </Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

// Four tinted tiles with large kcal / protein / fat / carbs numbers.
export function MacroStatGrid({ macros, compact }: { macros: Macros; compact?: boolean }) {
  const { t } = useLang();
  const stats = [
    { value: macros.kcal, label: t('detail.kcal'), color: colors.kcal },
    { value: macros.protein, label: t('macro.protein'), color: colors.protein },
    { value: macros.fat, label: t('macro.fat'), color: colors.fat },
    { value: macros.carbs, label: t('macro.carbs'), color: colors.carbs },
  ];
  return (
    <View style={[styles.statRow, compact && styles.statRowCompact]}>
      {stats.map(s => (
        <View
          key={s.label}
          style={[styles.stat, { backgroundColor: `${s.color}1A`, borderColor: `${s.color}55` }]}
        >
          <Text style={[styles.statValue, compact && styles.statValueCompact, { color: s.color }]}>
            {s.value}
          </Text>
          <Text style={styles.statLabel} numberOfLines={1}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// "1 cracker = 15 g" plus ×1…×5 shortcuts that set the grams.
export function PortionPicker({
  portion,
  grams,
  onSelect,
}: {
  portion: { grams: number; label: string };
  grams: number;
  onSelect: (grams: number) => void;
}) {
  const { t } = useLang();
  return (
    <>
      <Text style={styles.portionInfo}>
        {t('food.portionOf', { label: portion.label, grams: portion.grams })}
      </Text>
      <View style={styles.portionChips}>
        {[1, 2, 3, 4, 5].map(n => {
          const g = n * portion.grams;
          const active = grams === g;
          return (
            <Pressable
              key={n}
              onPress={() => onSelect(g)}
              style={[styles.portionChip, active && styles.portionChipActive]}
            >
              <Text style={[styles.portionChipText, active && styles.portionChipTextActive]}>
                ×{n}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  kcalPill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
  },
  kcalPillText: { color: colors.white, fontWeight: '800', fontSize: font.small },
  tag: { fontSize: font.small, fontWeight: '800' },
  note: { fontSize: font.tiny, color: colors.textFaint, fontWeight: '600' },

  statRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  statRowCompact: { marginTop: spacing.md },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '900' },
  statValueCompact: { fontSize: 24 },
  statLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },

  portionInfo: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.lg,
  },
  portionChips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  portionChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  portionChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  portionChipText: { fontSize: font.body, fontWeight: '800', color: colors.textMuted },
  portionChipTextActive: { color: colors.primaryDark },
});
