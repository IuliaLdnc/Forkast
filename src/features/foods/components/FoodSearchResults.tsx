import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { MacroTags } from '../../../shared/ui/MacroDisplay';
import { colors, font, radius, spacing } from '../../../shared/theme';
import { FoodProduct, foodLabel } from '../domain/foods';

export function FoodSearchResults({
  results,
  loading,
  noResults,
  onSelect,
}: {
  results: FoodProduct[];
  loading: boolean;
  noResults: boolean;
  onSelect: (food: FoodProduct) => void;
}) {
  const { t, lang } = useLang();
  return (
    <ScrollView
      style={styles.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {results.map(food => (
        <Pressable key={food.id} onPress={() => onSelect(food)} style={styles.row}>
          <Text style={styles.name} numberOfLines={2}>
            {foodLabel(food, lang)}
          </Text>
          <MacroTags macros={food.per100} note={t('food.per100')} />
        </Pressable>
      ))}
      {loading && <Text style={styles.searching}>{t('food.searching')}</Text>}
      {noResults && <Text style={styles.empty}>{t('food.noResults')}</Text>}
    </ScrollView>
  );
}

export function ManualEntryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.manualBtn}>
      <Text style={styles.manualText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, marginTop: spacing.md },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  name: { fontSize: font.body, color: colors.text, fontWeight: '700' },
  empty: {
    fontSize: font.small,
    color: colors.textFaint,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  searching: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  manualBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  manualText: { color: colors.primary, fontWeight: '700', fontSize: font.body },
});
