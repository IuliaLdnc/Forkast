import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { scaleMacros } from '../../../../core/macros';
import { useLang } from '../../../../shared/i18n/LanguageContext';
import { BackLink, FieldLabel, GramsInput, SubmitButton } from '../../../../shared/ui/FormControls';
import { MacroStatGrid, MacroTags, PortionPicker } from '../../../../shared/ui/MacroDisplay';
import { colors, font, spacing } from '../../../../shared/theme';
import { FoodProduct, foodLabel } from '../../../foods/domain/foods';
import { Meal } from '../../domain/diary';
import { MealSelector } from '../MealSelector';

export function PortionStep({
  food,
  grams,
  onGramsChange,
  meal,
  onMealChange,
  onBack,
  onConfirm,
}: {
  food: FoodProduct;
  grams: string;
  onGramsChange: (grams: string) => void;
  meal: Meal;
  onMealChange: (meal: Meal) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { t, lang } = useLang();
  const g = Number(grams) || 0;

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <BackLink label={t('goals.back')} onPress={onBack} />
      <Text style={styles.title}>{foodLabel(food, lang)}</Text>
      <MacroTags macros={food.per100} note={t('food.per100')} />

      {food.portion && (
        <PortionPicker portion={food.portion} grams={g} onSelect={v => onGramsChange(String(v))} />
      )}

      <FieldLabel>{t('food.grams')}</FieldLabel>
      <GramsInput value={grams} onChange={onGramsChange} />

      <MealSelector value={meal} onChange={onMealChange} />

      <Text style={styles.caption}>
        {g} {t('food.gUnit')}
      </Text>
      <MacroStatGrid macros={scaleMacros(food.per100, g)} />

      <SubmitButton label={t('food.addToDiary')} onPress={onConfirm} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  title: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  caption: {
    marginTop: spacing.lg,
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
