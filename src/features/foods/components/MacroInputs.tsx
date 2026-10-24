import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Macros } from '../../../core/macros';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { parseNumber, sanitizeDecimal } from '../../../shared/lib/numberInput';
import { NumberField } from '../../../shared/ui/FormControls';
import { spacing } from '../../../shared/theme';

export type MacroDraft = Record<keyof Macros, string>;

export const EMPTY_MACRO_DRAFT: MacroDraft = { kcal: '', protein: '', fat: '', carbs: '' };

export function macroDraftFrom(m: Macros): MacroDraft {
  return {
    kcal: String(m.kcal),
    protein: String(m.protein),
    fat: String(m.fat),
    carbs: String(m.carbs),
  };
}

export function parseMacroDraft(d: MacroDraft): Macros {
  return {
    kcal: parseNumber(d.kcal),
    protein: parseNumber(d.protein),
    fat: parseNumber(d.fat),
    carbs: parseNumber(d.carbs),
  };
}

export function MacroInputs({
  value,
  onChange,
  shortLabels,
}: {
  value: MacroDraft;
  onChange: (next: MacroDraft) => void;
  shortLabels?: boolean;
}) {
  const { t } = useLang();
  const fields: { key: keyof Macros; label: string }[] = [
    { key: 'kcal', label: t('detail.kcal') },
    { key: 'protein', label: t(shortLabels ? 'macro.pShort' : 'macro.protein') },
    { key: 'fat', label: t(shortLabels ? 'macro.fShort' : 'macro.fat') },
    { key: 'carbs', label: t(shortLabels ? 'macro.cShort' : 'macro.carbs') },
  ];
  return (
    <View style={styles.row}>
      {fields.map(f => (
        <NumberField
          key={f.key}
          label={f.label}
          value={value[f.key]}
          onChange={v => onChange({ ...value, [f.key]: sanitizeDecimal(v) })}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
});
