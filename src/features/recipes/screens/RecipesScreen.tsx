import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { subtractMacros } from '../../../core/macros';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { pluralForm } from '../../../shared/i18n/plural';
import { colors, font, radius, spacing } from '../../../shared/theme';
import { useDiary } from '../../diary/DiaryContext';
import { useFridge } from '../../fridge/FridgeContext';
import { useProfile } from '../../profile/ProfileContext';
import { goalLabel } from '../../profile/labels';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe, tagLabels } from '../data/recipes';
import { matchRecipes } from '../domain/match';
import { applyFilter, FILTER_TAGS, rankForGoal, RecipeFilter } from '../domain/ranking';

export function RecipesScreen({
  onBack,
  onOpenRecipe,
  insets,
}: {
  onBack: () => void;
  onOpenRecipe: (recipe: Recipe) => void;
  insets: EdgeInsets;
}) {
  const { t, tx, lang } = useLang();
  const { profile, target } = useProfile();
  const { consumed } = useDiary();
  const { selected } = useFridge();
  const [filter, setFilter] = useState<RecipeFilter>('all');

  const goal = target && profile ? profile.goal : null;
  const remaining = useMemo(
    () => (target ? subtractMacros(target, consumed) : null),
    [target, consumed],
  );

  const makeable = useMemo(() => {
    const plans = matchRecipes(selected).filter(p => p.makeable);
    return goal && remaining ? rankForGoal(plans, goal, remaining) : plans;
  }, [selected, goal, remaining]);

  const visible = useMemo(
    () => applyFilter(makeable, filter, remaining),
    [makeable, filter, remaining],
  );

  const filterOptions: { id: RecipeFilter; label: string; emoji: string }[] = [
    { id: 'all', label: t('recipes.filter.all'), emoji: '🍽' },
    ...(goal ? [{ id: 'fits' as const, label: t('recipes.filter.fits'), emoji: '🎯' }] : []),
    { id: 'noswap', label: t('recipes.filter.noswap'), emoji: '✅' },
    ...FILTER_TAGS.map(tag => ({
      id: tag,
      label: tx(tagLabels[tag].label),
      emoji: tagLabels[tag].emoji,
    })),
  ];

  const count = makeable.length;
  const noun = t(`recipes.noun.${pluralForm(count, lang)}`);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backText}>{t('recipes.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('recipes.title')}</Text>
        <Text style={styles.summary}>
          {count > 0 ? t('recipes.summary.ready', { count, noun }) : t('recipes.summary.default')}
        </Text>

        {goal && target && (
          <View style={styles.goalChip}>
            <Text style={styles.goalChipText}>
              🎯 {t('goals.entry.on', { goal: t(goalLabel[goal]), kcal: target.kcal })}
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterOptions.map(opt => {
            const active = filter === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setFilter(opt.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                  {opt.emoji} {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <Text style={styles.empty}>{t('recipes.empty')}</Text>
        ) : (
          visible.map(plan => (
            <RecipeCard
              key={plan.recipe.id}
              plan={plan}
              onPress={() => onOpenRecipe(plan.recipe)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontSize: font.body, color: colors.primary, fontWeight: '600' },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  summary: { fontSize: font.small, color: colors.textMuted, marginTop: 4 },
  goalChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  goalChipText: { fontSize: font.small, color: colors.primaryDark, fontWeight: '700' },
  filterRow: { gap: spacing.sm, paddingTop: spacing.md, paddingRight: spacing.lg },
  filterChip: {
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: font.small, color: colors.textMuted, fontWeight: '600' },
  filterLabelActive: { color: colors.white },
  list: { padding: spacing.lg },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xxl,
    fontSize: font.body,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
});
