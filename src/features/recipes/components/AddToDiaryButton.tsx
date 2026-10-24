import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { colors, font, radius, shadow, spacing } from '../../../shared/theme';
import { Meal, MEALS } from '../../diary/domain/diary';
import { mealLabel } from '../../diary/labels';

// "Add to diary" → pick a meal → "Added ✓". One serving per screen visit.
export function AddToDiaryButton({ onAdd }: { onAdd: (meal: Meal) => void }) {
  const { t } = useLang();
  const [state, setState] = useState<'idle' | 'picking' | 'added'>('idle');

  if (state === 'added') {
    return (
      <View style={[styles.btn, styles.btnAdded]}>
        <Text style={[styles.btnText, styles.btnTextAdded]}>{t('detail.added')}</Text>
      </View>
    );
  }

  if (state === 'idle') {
    return (
      <Pressable onPress={() => setState('picking')} style={styles.btn}>
        <Text style={styles.btnText}>{t('detail.addToDiary')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.picker}>
      <Text style={styles.prompt}>{t('detail.addPrompt')}</Text>
      <View style={styles.row}>
        {MEALS.map(m => (
          <Pressable
            key={m}
            onPress={() => {
              onAdd(m);
              setState('added');
            }}
            style={styles.mealBtn}
          >
            <Text style={styles.mealText}>{t(mealLabel[m])}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    ...shadow.soft,
  },
  btnAdded: { backgroundColor: colors.primaryLight, shadowOpacity: 0, elevation: 0 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: font.body },
  btnTextAdded: { color: colors.primary },
  picker: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  prompt: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.xs },
  mealBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
  },
  mealText: { fontSize: font.tiny, fontWeight: '800', color: colors.primaryDark },
});
