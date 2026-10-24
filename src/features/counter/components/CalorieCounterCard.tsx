import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Macros } from '../../../core/macros';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { colors, font, radius, shadow, spacing } from '../../../shared/theme';
import { calorieBudget } from '../../profile/domain/calorieBudget';

export function CalorieCounterCard({
  consumed,
  target,
}: {
  consumed: Macros;
  target: Macros | null;
}) {
  const { t } = useLang();
  const budget = target ? calorieBudget(consumed, target) : null;

  const eaten = (key: keyof Macros) => Math.round(consumed[key]);
  const macroValue = (key: 'protein' | 'fat' | 'carbs') =>
    target ? `${eaten(key)}/${target[key]}` : t('macro.eatenShort', { n: eaten(key) });

  return (
    <View style={[styles.card, budget?.over && styles.cardOver]}>
      <Text style={styles.label}>{t('diary.eaten')}</Text>
      <Text style={styles.big}>{eaten('kcal')}</Text>
      {target && budget ? (
        <>
          <Text style={styles.of}>{t('counter.ofTarget', { target: target.kcal })}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${budget.progress * 100}%` }]} />
          </View>
          <Text style={styles.sub}>
            {budget.over
              ? t('diary.overSub', { n: Math.round(Math.abs(budget.remaining)) })
              : t('diary.leftSub', { n: Math.round(budget.remaining) })}
          </Text>
        </>
      ) : (
        <Text style={styles.sub}>{t('counter.trackHint')}</Text>
      )}
      <View style={styles.pills}>
        <MacroPill
          color={colors.protein}
          label={t('macro.protein')}
          value={macroValue('protein')}
        />
        <MacroPill color={colors.fat} label={t('macro.fat')} value={macroValue('fat')} />
        <MacroPill color={colors.carbs} label={t('macro.carbs')} value={macroValue('carbs')} />
      </View>
    </View>
  );
}

function MacroPill({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.counter,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  cardOver: { backgroundColor: colors.counterOver },
  label: {
    color: '#FFFFFFCC',
    fontSize: font.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  big: {
    color: colors.white,
    fontSize: 76,
    fontWeight: '900',
    lineHeight: 82,
    marginVertical: 2,
  },
  of: { color: '#FFFFFFDD', fontSize: font.body, fontWeight: '700' },
  track: {
    width: '100%',
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF3D',
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  fill: { height: 14, borderRadius: radius.pill, backgroundColor: colors.white },
  sub: { color: colors.white, fontSize: font.h3, fontWeight: '800', marginTop: spacing.md },
  pills: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, width: '100%' },
  pill: {
    flex: 1,
    backgroundColor: '#FFFFFF26',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  pillLabel: { color: '#FFFFFFDD', fontSize: font.tiny, fontWeight: '700' },
  pillValue: { color: colors.white, fontSize: font.body, fontWeight: '800', marginTop: 1 },
});
