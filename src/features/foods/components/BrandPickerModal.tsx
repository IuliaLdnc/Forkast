import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { SheetModal } from '../../../shared/ui/SheetModal';
import { BackLink, FieldLabel, SubmitButton, TextField } from '../../../shared/ui/FormControls';
import { colors, font, radius, spacing } from '../../../shared/theme';
import { builtinFoods } from '../data/builtinFoods';
import { FoodProduct, makeCustomFood } from '../domain/foods';
import { useFoodSearch } from '../hooks/useFoodSearch';
import { EMPTY_MACRO_DRAFT, MacroDraft, MacroInputs, parseMacroDraft } from './MacroInputs';
import { FoodSearchResults, ManualEntryButton } from './FoodSearchResults';

export function BrandPickerModal({
  visible,
  title,
  initialQuery,
  current,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  initialQuery: string;
  current: FoodProduct | null;
  onPick: (food: FoodProduct | null) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [query, setQuery] = useState(initialQuery);
  const [manual, setManual] = useState(false);
  const [name, setName] = useState('');
  const [draft, setDraft] = useState<MacroDraft>(EMPTY_MACRO_DRAFT);
  const search = useFoodSearch(query, builtinFoods);

  useEffect(() => {
    if (!visible) return;
    setQuery(initialQuery);
    setManual(false);
    setName('');
    setDraft(EMPTY_MACRO_DRAFT);
  }, [visible, initialQuery]);

  const pick = (food: FoodProduct | null) => {
    onPick(food);
    onClose();
  };

  const saveManual = () => {
    const per100 = parseMacroDraft(draft);
    if (!name.trim() || !per100.kcal) return;
    pick(makeCustomFood('brand', name.trim(), '', per100));
  };

  return (
    <SheetModal
      visible={visible}
      title={t('brand.title')}
      subtitle={t('brand.for', { name: title })}
      onClose={onClose}
    >
      {manual ? (
        <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
          <BackLink label={t('goals.back')} onPress={() => setManual(false)} />
          <TextField value={name} onChangeText={setName} placeholder={t('brand.namePh')} />
          <FieldLabel>{t('food.per100')}</FieldLabel>
          <MacroInputs value={draft} onChange={setDraft} shortLabels />
          <SubmitButton label={t('brand.save')} onPress={saveManual} />
        </ScrollView>
      ) : (
        <View style={styles.searchWrap}>
          <Text style={styles.intro}>{t('brand.intro')}</Text>
          {current && (
            <Pressable onPress={() => pick(null)} style={styles.resetBtn}>
              <Text style={styles.resetText}>{t('brand.reset')}</Text>
            </Pressable>
          )}
          <TextField value={query} onChangeText={setQuery} placeholder={t('brand.search')} />
          <ManualEntryButton label={t('brand.manual')} onPress={() => setManual(true)} />
          <FoodSearchResults {...search} onSelect={pick} />
        </View>
      )}
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  scrollBody: { padding: spacing.lg },
  intro: {
    fontSize: font.small,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgWarm,
    marginBottom: spacing.md,
  },
  resetText: { color: colors.textMuted, fontWeight: '700', fontSize: font.small },
});
