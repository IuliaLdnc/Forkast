import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Macros } from '../../../../core/macros';
import { useLang } from '../../../../shared/i18n/LanguageContext';
import { parseNumber, sanitizeDecimal } from '../../../../shared/lib/numberInput';
import {
  BackLink,
  FieldLabel,
  Segmented,
  SubmitButton,
  TextField,
} from '../../../../shared/ui/FormControls';
import { colors, font, radius, spacing } from '../../../../shared/theme';
import {
  FoodProduct,
  makeCustomFood,
  per100FromPortion,
  Portion,
} from '../../../foods/domain/foods';
import {
  EMPTY_MACRO_DRAFT,
  MacroDraft,
  MacroInputs,
  parseMacroDraft,
} from '../../../foods/components/MacroInputs';

type Basis = 'per100' | 'portion';

// Step 1b: describe a product that wasn't found, from its nutrition label.
// Macros can be entered per 100 g or per portion (converted to per 100 g).
export function ManualFoodStep({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (food: FoodProduct) => void;
}) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [basis, setBasis] = useState<Basis>('per100');
  const [portionGrams, setPortionGrams] = useState('');
  const [portionLabel, setPortionLabel] = useState('');
  const [draft, setDraft] = useState<MacroDraft>(EMPTY_MACRO_DRAFT);

  const save = () => {
    const entered = parseMacroDraft(draft);
    if (!name.trim() || !entered.kcal) return;

    let per100: Macros = entered;
    let portion: Portion | undefined;
    if (basis === 'portion') {
      const g = parseNumber(portionGrams);
      if (!g) return;
      per100 = per100FromPortion(entered, g);
      portion = { grams: g, label: portionLabel.trim() || t('food.portionDefault') };
    }
    onCreate(makeCustomFood('custom', name.trim(), brand.trim(), per100, portion));
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <BackLink label={t('goals.back')} onPress={onBack} />
      <TextField value={name} onChangeText={setName} placeholder={t('food.namePh')} />
      <TextField
        value={brand}
        onChangeText={setBrand}
        placeholder={t('food.brand')}
        style={styles.gap}
      />

      <View style={styles.basis}>
        <Segmented
          size="sm"
          value={basis}
          onChange={setBasis}
          options={[
            { value: 'per100', label: t('food.basis.per100') },
            { value: 'portion', label: t('food.basis.portion') },
          ]}
        />
      </View>

      {basis === 'portion' && (
        <View style={styles.portionFields}>
          <View style={styles.portionGrams}>
            <Text style={styles.smallLabel}>{t('food.portionGrams')}</Text>
            <TextInput
              value={portionGrams}
              onChangeText={v => setPortionGrams(sanitizeDecimal(v))}
              keyboardType="decimal-pad"
              maxLength={6}
              placeholder="15"
              placeholderTextColor={colors.textFaint}
              style={styles.smallInput}
            />
          </View>
          <View style={styles.portionLabel}>
            <Text style={styles.smallLabel}>{t('food.portionLabel')}</Text>
            <TextInput
              value={portionLabel}
              onChangeText={setPortionLabel}
              placeholder={t('food.portionDefault')}
              placeholderTextColor={colors.textFaint}
              style={styles.smallInput}
            />
          </View>
        </View>
      )}

      <FieldLabel>{basis === 'portion' ? t('food.perPortion') : t('food.per100')}</FieldLabel>
      <MacroInputs value={draft} onChange={setDraft} />
      <SubmitButton label={t('food.saveUse')} onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  gap: { marginTop: spacing.sm },
  basis: { marginTop: spacing.lg },
  portionFields: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  portionGrams: { width: 130 },
  portionLabel: { flex: 1 },
  smallLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  smallInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
