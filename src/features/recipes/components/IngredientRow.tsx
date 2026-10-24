import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { colors, font, radius, spacing } from '../../../shared/theme';
import { ingredientById } from '../../fridge/data/ingredients';
import { FoodProduct, foodLabel } from '../../foods/domain/foods';
import { PlannedItem } from '../domain/match';
import { isToggleable } from '../domain/serving';

export const canBrand = (id: string): boolean => {
  const cat = ingredientById[id]?.category;
  return cat !== 'veg' && cat !== 'fruit';
};

export function IngredientRow({
  item,
  included,
  brand,
  onToggle,
  onPickBrand,
}: {
  item: PlannedItem;
  included: boolean;
  brand: FoodProduct | undefined;
  onToggle: () => void;
  onPickBrand: () => void;
}) {
  const { t, tx, lang } = useLang();
  const effective = ingredientById[item.effectiveId];
  const original = ingredientById[item.ingredient.id];

  return (
    <View style={styles.row}>
      <Text style={[styles.emoji, !included && styles.dim]}>{effective?.emoji ?? '•'}</Text>
      <View style={styles.nameWrap}>
        <Text style={[styles.name, !included && styles.struck]}>
          {effective ? tx(effective.name) : item.ingredient.id}
        </Text>
        {item.status === 'swap' && (
          <Text style={styles.swapNote}>
            {t('detail.swapFor', {
              name: original ? tx(original.name) : item.ingredient.id,
            })}
          </Text>
        )}
        {included &&
          canBrand(item.effectiveId) &&
          (brand ? (
            <Pressable onPress={onPickBrand} style={styles.brandSet}>
              <Text style={styles.brandSetText} numberOfLines={1}>
                🏷 {foodLabel(brand, lang)}
                {'  '}
                <Text style={styles.brandKcal}>
                  {brand.per100.kcal} {t('detail.kcal')}
                </Text>
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={onPickBrand} style={styles.brandAdd}>
              <Text style={styles.brandAddText}>＋ {t('brand.add')}</Text>
            </Pressable>
          ))}
      </View>
      <Text style={[styles.amount, !included && styles.dim]}>{tx(item.ingredient.amount)}</Text>

      {isToggleable(item.status) ? (
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          style={[styles.toggle, included ? styles.toggleRemove : styles.toggleAdd]}
        >
          <Text
            style={[styles.toggleText, included ? styles.toggleRemoveText : styles.toggleAddText]}
          >
            {included ? '−' : '+'}
          </Text>
        </Pressable>
      ) : (
        <StatusChip pantry={item.status === 'pantry'} />
      )}
    </View>
  );
}

function StatusChip({ pantry }: { pantry: boolean }) {
  const { t } = useLang();
  return (
    <View style={[styles.chip, pantry ? styles.chipPantry : styles.chipBuy]}>
      <Text style={[styles.chipText, pantry ? styles.chipPantryText : styles.chipBuyText]}>
        {pantry ? t('detail.status.pantry') : t('detail.status.buy')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  emoji: { fontSize: 18, width: 26 },
  nameWrap: { flex: 1, paddingRight: spacing.sm },
  name: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  swapNote: { fontSize: font.tiny, color: colors.accent, fontWeight: '600', marginTop: 1 },
  brandAdd: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  brandAddText: { fontSize: font.tiny, fontWeight: '700', color: colors.primary },
  brandSet: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    maxWidth: '100%',
  },
  brandSetText: { fontSize: font.tiny, fontWeight: '700', color: colors.primaryDark },
  brandKcal: { fontSize: font.tiny, fontWeight: '700', color: colors.primary },
  struck: { textDecorationLine: 'line-through', color: colors.textFaint },
  dim: { opacity: 0.4 },
  amount: { fontSize: font.small, color: colors.textMuted, marginRight: spacing.md },
  toggle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRemove: { backgroundColor: colors.accentLight },
  toggleAdd: { backgroundColor: colors.primaryLight },
  toggleText: { fontSize: 20, fontWeight: '800', marginTop: -2 },
  toggleRemoveText: { color: colors.accent },
  toggleAddText: { color: colors.primary },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    minWidth: 58,
    alignItems: 'center',
  },
  chipPantry: { backgroundColor: colors.bgWarm },
  chipBuy: { backgroundColor: colors.accentLight },
  chipText: { fontSize: font.tiny, fontWeight: '700' },
  chipPantryText: { color: colors.textMuted },
  chipBuyText: { color: colors.accent },
});
