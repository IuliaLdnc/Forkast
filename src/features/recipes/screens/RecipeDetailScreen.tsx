import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { Tag } from '../../../shared/ui/Chip';
import { MacroBar } from '../../../shared/ui/MacroBar';
import { colors, font, radius, shadow, spacing } from '../../../shared/theme';
import { useDiary } from '../../diary/DiaryContext';
import { ingredientById } from '../../fridge/data/ingredients';
import { useFridge } from '../../fridge/FridgeContext';
import { BrandPickerModal } from '../../foods/components/BrandPickerModal';
import { useProfile } from '../../profile/ProfileContext';
import { AddToDiaryButton } from '../components/AddToDiaryButton';
import { IngredientRow } from '../components/IngredientRow';
import { RecipePhoto } from '../components/RecipePhoto';
import { Recipe, tagLabels } from '../data/recipes';
import { useRecipeBuilder } from '../hooks/useRecipeBuilder';

export function RecipeDetailScreen({
  recipe,
  onBack,
  insets,
}: {
  recipe: Recipe;
  onBack: () => void;
  insets: EdgeInsets;
}) {
  const { t, tx, lang } = useLang();
  const { isActivated } = useProfile();
  const { addFood } = useDiary();
  const { selected } = useFridge();
  const builder = useRecipeBuilder(recipe, selected);
  const { plan, macros } = builder;
  // Index of the ingredient whose brand is being picked.
  const [brandIdx, setBrandIdx] = useState<number | null>(null);
  const brandIngredient =
    brandIdx !== null ? ingredientById[plan.items[brandIdx].effectiveId] : undefined;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoWrap}>
          <RecipePhoto recipe={recipe} style={styles.photo} emojiSize={84} />
          <View style={styles.photoScrim} />
          <Pressable
            onPress={onBack}
            style={[styles.backFab, { top: insets.top + spacing.sm }]}
            hitSlop={10}
          >
            <Text style={styles.backFabText}>‹</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{tx(recipe.title)}</Text>
          <Text style={styles.description}>{tx(recipe.description)}</Text>
          <View style={styles.metaRow}>
            <MetaItem icon="⏱" label={`${recipe.time} ${t('card.minShort')}`} />
            <MetaItem icon="🍽" label={`${recipe.servings} ${t('card.servShort')}`} />
            <MetaItem icon="📊" label={t(`difficulty.${recipe.difficulty}`)} />
          </View>
          <View style={styles.tags}>
            {recipe.tags.map(tag => (
              <Tag key={tag} label={tx(tagLabels[tag].label)} emoji={tagLabels[tag].emoji} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.sectionTitle}>{t('detail.nutrition')}</Text>
              <Text style={styles.perServing}>{t('detail.perServing')}</Text>
            </View>
            <View style={styles.kcalRow}>
              <Text style={styles.kcalValue}>{macros.kcal}</Text>
              <Text style={styles.kcalUnit}>{t('detail.kcal')}</Text>
            </View>
            <MacroBar macros={macros} />
          </View>

          {isActivated && (
            <AddToDiaryButton
              onAdd={meal => addFood(tx(recipe.title), macros, meal, builder.diarySource)}
            />
          )}

          <Text style={styles.blockTitle}>{t('detail.ingredients')}</Text>
          <Text style={styles.hint}>{t('detail.hint')}</Text>
          <View style={styles.ingCard}>
            {plan.items.map((item, idx) =>
              item.status === 'optional_out' ? null : (
                <IngredientRow
                  key={`${item.ingredient.id}-${idx}`}
                  item={item}
                  included={builder.included(idx)}
                  brand={builder.brands[idx]}
                  onToggle={() => builder.toggle(idx)}
                  onPickBrand={() => setBrandIdx(idx)}
                />
              ),
            )}
          </View>

          <Text style={styles.blockTitle}>{t('detail.steps')}</Text>
          <View style={styles.stepsCard}>
            {recipe.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{tx(step)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footerNote}>{t('detail.footer')}</Text>
        </View>
      </ScrollView>

      <BrandPickerModal
        visible={brandIdx !== null}
        title={brandIngredient ? tx(brandIngredient.name) : ''}
        initialQuery={brandIngredient ? brandIngredient.name[lang] ?? brandIngredient.name.en : ''}
        current={brandIdx !== null ? builder.brands[brandIdx] ?? null : null}
        onPick={food => brandIdx !== null && builder.setBrand(brandIdx, food)}
        onClose={() => setBrandIdx(null)}
      />
    </View>
  );
}

function MetaItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  photoWrap: { height: 260, backgroundColor: colors.bgWarm },
  photo: { width: '100%', height: '100%' },
  photoScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,30,25,0.12)',
  },
  backFab: {
    position: 'absolute',
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  backFabText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: -3,
    marginLeft: -2,
  },
  hero: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderRadius: radius.lg,
    marginTop: -spacing.lg,
  },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  description: {
    fontSize: font.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    gap: 5,
  },
  metaIcon: { fontSize: 13 },
  metaLabel: { fontSize: font.small, color: colors.text, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  body: { padding: spacing.lg },
  macroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: font.h3, fontWeight: '700', color: colors.text },
  perServing: {
    fontSize: font.tiny,
    color: colors.textMuted,
    backgroundColor: colors.bg,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  kcalRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: spacing.md },
  kcalValue: { fontSize: 40, fontWeight: '800', color: colors.primary },
  kcalUnit: { fontSize: font.h3, color: colors.textMuted, marginLeft: 6, fontWeight: '600' },
  blockTitle: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  hint: { fontSize: font.small, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 18 },
  ingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.soft,
  },
  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  stepRow: { flexDirection: 'row', marginBottom: spacing.lg },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumText: { color: colors.white, fontWeight: '800', fontSize: font.small },
  stepText: { flex: 1, fontSize: font.body, color: colors.text, lineHeight: 22, paddingTop: 3 },
  footerNote: {
    fontSize: font.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
});
