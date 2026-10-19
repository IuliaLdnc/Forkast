import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { RecipePlan } from '../utils/match';
import { macrosFor } from '../utils/macros';
import { ingredientById } from '../data/ingredients';
import { tagLabels } from '../data/recipes';
import { recipeImages } from '../data/recipeImages';
import { useLang } from '../i18n/LanguageContext';
import { colors, font, radius, shadow, spacing } from '../theme';
import { MacroBar } from './MacroBar';
import { Tag } from './Chip';

export function RecipeCard({
  plan,
  onPress,
}: {
  plan: RecipePlan;
  onPress: () => void;
}) {
  const { t, tx } = useLang();
  const { recipe, swaps } = plan;
  const photo = recipeImages[recipe.id];

  const macros = macrosFor(
    plan.items
      .filter(i => i.included)
      .map(i => ({ id: i.effectiveId, g: i.ingredient.g })),
    recipe.servings,
  );

  const swapText = swaps
    .map(
      s =>
        `${tx(ingredientById[s.to].name)} ${t('detail.swapFor', {
          name: tx(ingredientById[s.from].name),
        })}`,
    )
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.banner}>
        {photo ? (
          <Image source={photo} style={styles.bannerImg} resizeMode="cover" />
        ) : (
          <View style={[styles.bannerImg, styles.bannerFallback]}>
            <Text style={styles.bannerEmoji}>{recipe.emoji}</Text>
          </View>
        )}
        <View style={styles.bannerScrim} />
        {swaps.length > 0 ? (
          <View style={[styles.badge, styles.swapBadge]}>
            <Text style={styles.swapBadgeText}>🔄</Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.readyBadge]}>
            <Text style={styles.readyBadgeText}>✓</Text>
          </View>
        )}
        <Text style={styles.bannerTitle} numberOfLines={2}>
          {tx(recipe.title)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.meta}>
          {t('card.meta', {
            time: recipe.time,
            kcal: macros.kcal,
            servings: recipe.servings,
          })}
        </Text>

        <View style={styles.tags}>
          {recipe.tags.slice(0, 3).map(tag => (
            <Tag key={tag} label={tx(tagLabels[tag].label)} emoji={tagLabels[tag].emoji} />
          ))}
        </View>

        <MacroBar macros={macros} compact />

        <View style={styles.footer}>
          {swaps.length > 0 ? (
            <Text style={styles.swapText} numberOfLines={2}>
              🔄 {swapText}
            </Text>
          ) : (
            <Text style={styles.readyText}>{t('card.ready')}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  banner: {
    height: 168,
    backgroundColor: colors.bgWarm,
    justifyContent: 'flex-end',
  },
  bannerImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEmoji: {
    fontSize: 64,
  },
  bannerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,30,25,0.28)',
  },
  bannerTitle: {
    color: colors.white,
    fontSize: font.h2,
    fontWeight: '800',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyBadge: {
    backgroundColor: colors.primary,
  },
  readyBadgeText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: font.h3,
  },
  swapBadge: {
    backgroundColor: colors.surface,
  },
  swapBadgeText: {
    fontSize: 16,
  },
  content: {
    padding: spacing.lg,
  },
  meta: {
    fontSize: font.small,
    color: colors.textMuted,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  readyText: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '700',
  },
  swapText: {
    fontSize: font.small,
    color: colors.accent,
    fontWeight: '600',
    lineHeight: 18,
  },
});
