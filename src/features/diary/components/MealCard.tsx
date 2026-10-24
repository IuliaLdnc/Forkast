import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Macros } from '../../../core/macros';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { colors, font, radius, shadow, spacing } from '../../../shared/theme';
import { DiaryEntry, Meal, totals } from '../domain/diary';
import { mealLabel, mealStyle } from '../labels';

// One meal of the day: header with totals and "+", and a collapsible list of
// logged entries (tap to edit, "−" to remove).
export function MealCard({
  meal,
  items,
  expanded,
  onToggle,
  onAdd,
  onEdit,
  onRemove,
}: {
  meal: Meal;
  items: DiaryEntry[];
  expanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (entry: DiaryEntry) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useLang();
  const ms = mealStyle[meal];
  const total = totals(items);
  const hasItems = items.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: ms.light, borderColor: ms.color }]}>
      <View style={styles.header}>
        <Pressable onPress={hasItems ? onToggle : onAdd} style={styles.titleRow} hitSlop={6}>
          <Text style={styles.emoji}>{ms.emoji}</Text>
          <Text style={styles.title}>{t(mealLabel[meal])}</Text>
          {hasItems && (
            <Text style={[styles.chevron, { color: ms.color }]}>{expanded ? '▾' : '▸'}</Text>
          )}
        </Pressable>
        <View style={styles.headerRight}>
          {total.kcal > 0 && (
            <Text style={[styles.kcal, { color: ms.color }]}>
              {total.kcal} {t('detail.kcal')}
            </Text>
          )}
          <Pressable
            onPress={onAdd}
            style={[styles.addBtn, { backgroundColor: ms.color }]}
            hitSlop={6}
          >
            <Text style={styles.addPlus}>＋</Text>
          </Pressable>
        </View>
      </View>

      {total.kcal > 0 && <PfcLine macros={total} style={styles.totalMacros} big />}

      {!hasItems && (
        <Pressable onPress={onAdd}>
          <Text style={styles.empty}>{t('meal.addHint')}</Text>
        </Pressable>
      )}

      {hasItems &&
        expanded &&
        items.map(e => (
          <EntryRow key={e.id} entry={e} onEdit={() => onEdit(e)} onRemove={() => onRemove(e.id)} />
        ))}
    </View>
  );
}

function EntryRow({
  entry,
  onEdit,
  onRemove,
}: {
  entry: DiaryEntry;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useLang();
  return (
    <View style={styles.entryRow}>
      <Pressable style={styles.entryMain} onPress={onEdit}>
        <View style={styles.entryText}>
          <Text style={styles.entryName} numberOfLines={1}>
            {entry.name}
          </Text>
          <View style={styles.entryMacroLine}>
            {entry.grams != null && (
              <Text style={styles.entryGrams}>
                {entry.grams} {t('food.gUnit')}
              </Text>
            )}
            <PfcLine macros={entry.macros} />
            <Text style={styles.entryEditMark}>✎</Text>
          </View>
        </View>
        <Text style={styles.entryKcal}>
          {entry.macros.kcal} {t('detail.kcal')}
        </Text>
      </Pressable>
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={styles.entryRemove}>−</Text>
      </Pressable>
    </View>
  );
}

// "P 10  F 5  C 20" in macro colors.
function PfcLine({
  macros,
  big,
  style,
}: {
  macros: Macros;
  big?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useLang();
  const text = big ? styles.pfcBig : styles.pfcSmall;
  return (
    <View style={[styles.pfc, big && styles.pfcGapBig, style]}>
      <Text style={[text, { color: colors.protein }]}>
        {t('macro.pShort')} {Math.round(macros.protein)}
      </Text>
      <Text style={[text, { color: colors.fat }]}>
        {t('macro.fShort')} {Math.round(macros.fat)}
      </Text>
      <Text style={[text, { color: colors.carbs }]}>
        {t('macro.cShort')} {Math.round(macros.carbs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.soft,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chevron: { fontSize: font.body, fontWeight: '800' },
  emoji: { fontSize: 22 },
  title: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kcal: { fontSize: font.small, fontWeight: '800' },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: { color: colors.white, fontSize: font.h3, fontWeight: '800', lineHeight: 22 },
  empty: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  totalMacros: { marginTop: spacing.sm },

  pfc: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pfcGapBig: { gap: spacing.lg },
  pfcBig: { fontSize: font.small, fontWeight: '800' },
  pfcSmall: { fontSize: font.tiny, fontWeight: '800' },

  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000014',
  },
  entryMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  entryText: { flexShrink: 1 },
  entryName: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  entryMacroLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },
  entryGrams: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '700' },
  entryEditMark: { fontSize: font.tiny, color: colors.primary, fontWeight: '800' },
  entryKcal: { fontSize: font.small, color: colors.textMuted, marginRight: spacing.md },
  entryRemove: {
    fontSize: 22,
    color: colors.accent,
    fontWeight: '800',
    width: 24,
    textAlign: 'center',
  },
});
