
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Macros } from '../data/recipes';
import { useLang } from '../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../theme';

export function MacroBar({ macros, compact }: { macros: Macros; compact?: boolean }) {
  const { t } = useLang();
  const pCal = macros.protein * 4;
  const fCal = macros.fat * 9;
  const cCal = macros.carbs * 4;
  const totalCal = Math.max(pCal + fCal + cCal, 1);

  const pPct = (pCal / totalCal) * 100;
  const fPct = (fCal / totalCal) * 100;
  const cPct = (cCal / totalCal) * 100;

  return (
    <View>
      <View style={[styles.bar, compact && styles.barCompact]}>
        <View style={{ width: `${pPct}%`, backgroundColor: colors.protein }} />
        <View style={{ width: `${fPct}%`, backgroundColor: colors.fat }} />
        <View style={{ width: `${cPct}%`, backgroundColor: colors.carbs }} />
      </View>

      {!compact && (
        <View style={styles.legend}>
          <MacroChip color={colors.protein} label={t('macro.protein')} value={macros.protein} />
          <MacroChip color={colors.fat} label={t('macro.fat')} value={macros.fat} />
          <MacroChip color={colors.carbs} label={t('macro.carbs')} value={macros.carbs} />
        </View>
      )}
    </View>
  );
}

function MacroChip({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  const { t } = useLang();
  return (
    <View style={styles.macroChip}>
      <View style={styles.macroChipHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>
        {value} {t('food.gUnit')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.bgWarm,
  },
  barCompact: {
    height: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  macroChip: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  macroChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  macroLabel: {
    fontSize: font.tiny,
    color: colors.textMuted,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: font.h3,
    color: colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
});
