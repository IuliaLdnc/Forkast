import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { scaleMacros } from '../../../core/macros';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { FieldLabel, GramsInput, SubmitButton } from '../../../shared/ui/FormControls';
import { MacroStatGrid, PortionPicker } from '../../../shared/ui/MacroDisplay';
import { SheetModal } from '../../../shared/ui/SheetModal';
import { colors, font, spacing } from '../../../shared/theme';
import {
  EMPTY_MACRO_DRAFT,
  MacroDraft,
  macroDraftFrom,
  MacroInputs,
  parseMacroDraft,
} from '../../foods/components/MacroInputs';
import { useDiary } from '../DiaryContext';
import { DiaryEntry, entryGrams, entryPer100 } from '../domain/diary';

export function EditEntryModal({
  entry,
  onClose,
}: {
  entry: DiaryEntry | null;
  onClose: () => void;
}) {
  const { t } = useLang();
  const { regramEntry, overrideEntry } = useDiary();
  const [grams, setGrams] = useState('');
  const [draft, setDraft] = useState<MacroDraft>(EMPTY_MACRO_DRAFT);

  useEffect(() => {
    if (!entry) return;
    const g = entryGrams(entry);
    setGrams(g != null ? String(g) : '');
    setDraft(macroDraftFrom(entry.macros));
  }, [entry]);

  if (!entry) return null;

  const per100 = entryPer100(entry);
  const g = Number(grams) || 0;
  const portion = entry.portion;

  const save = () => {
    if (per100) {
      if (!g) return;
      regramEntry(entry.id, g);
    } else {
      const macros = parseMacroDraft(draft);
      if (!macros.kcal) return;
      overrideEntry(entry.id, g, { ...macros, kcal: Math.round(macros.kcal) });
    }
    onClose();
  };

  return (
    <SheetModal visible title={t('entry.editTitle')} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.name}>{entry.name}</Text>

        {per100 && portion && (
          <PortionPicker portion={portion} grams={g} onSelect={v => setGrams(String(v))} />
        )}

        <FieldLabel>{t('food.grams')}</FieldLabel>
        <GramsInput value={grams} onChange={setGrams} autoFocus={per100 != null && !portion} />

        {per100 ? (
          <>
            <Text style={styles.caption}>
              {g} {t('food.gUnit')}
            </Text>
            <MacroStatGrid macros={scaleMacros(per100, g)} compact />
          </>
        ) : (
          <>
            <FieldLabel>{t('entry.editMacros')}</FieldLabel>
            <MacroInputs value={draft} onChange={setDraft} shortLabels />
          </>
        )}

        <SubmitButton label={t('goals.save')} onPress={save} />
      </ScrollView>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  name: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  caption: {
    marginTop: spacing.md,
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
