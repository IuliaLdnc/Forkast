import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useLang } from '../../shared/i18n/LanguageContext';
import { IngredientChip } from '../../shared/ui/Chip';
import { LanguageToggle } from '../../shared/ui/LanguageToggle';
import { PrimaryButton } from '../../shared/ui/PrimaryButton';
import { colors, font, radius, shadow, spacing } from '../../shared/theme';
import { categories, ingredients, IngredientCategory } from './data/ingredients';
import { useFridge } from './FridgeContext';

export function FridgeScreen({ onSearch, insets }: { onSearch: () => void; insets: EdgeInsets }) {
  const { t, tx } = useLang();
  const { selected, toggle, clear } = useFridge();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;

    return ingredients.filter(
      i => i.name.en.toLowerCase().includes(q) || i.name.ru.toLowerCase().includes(q),
    );
  }, [query]);

  const byCategory = (cat: IngredientCategory) => filtered.filter(i => i.category === cat);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          styles.contentBottom,
          { paddingTop: insets.top + 48 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.brand}>🍴 Forkast</Text>
            <Text style={styles.subtitle}>{t('app.subtitle')}</Text>
          </View>
          <LanguageToggle />
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('fridge.search')}
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.hintRow}>
          <Text style={styles.hint}>{t('fridge.hint')}</Text>
          {selected.size > 0 && (
            <Text style={styles.clear} onPress={clear}>
              {t('fridge.clear')}
            </Text>
          )}
        </View>

        {categories.map(cat => {
          const items = byCategory(cat.id);
          if (items.length === 0) return null;
          return (
            <View key={cat.id} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {cat.emoji} {tx(cat.title)}
              </Text>
              <View style={styles.chipWrap}>
                {items.map(ing => (
                  <IngredientChip
                    key={ing.id}
                    label={tx(ing.name)}
                    emoji={ing.emoji}
                    selected={selected.has(ing.id)}
                    onPress={() => toggle(ing.id)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && <Text style={styles.empty}>{t('fridge.empty')}</Text>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={
            selected.size === 0
              ? t('fridge.cta.empty')
              : t('fridge.cta.find', { count: selected.size })
          }
          disabled={selected.size === 0}
          onPress={onSearch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  contentBottom: {
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  brand: {
    fontSize: font.h1,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: font.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  clear: {
    fontSize: font.small,
    color: colors.accent,
    fontWeight: '700',
    paddingLeft: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hint: {
    flex: 1,
    fontSize: font.small,
    color: colors.textMuted,
    lineHeight: 19,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontSize: font.body,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
