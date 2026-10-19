import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { scaleMacros } from '../data/foods';
import { Macros } from '../data/recipes';
import { DiaryEntry } from '../profile/ProfileContext';
import { useLang } from '../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../theme';

const parseNum = (s: string): number => Number(s.replace(',', '.')) || 0;
const sanitize = (s: string): string => s.replace(/[^0-9.,]/g, '').replace('.', ',');

export function EditEntryModal({
  entry,
  onSaveGrams,
  onSaveManual,
  onClose,
}: {
  entry: DiaryEntry | null;
  onSaveGrams: (grams: number) => void;
  onSaveManual: (grams: number, macros: Macros) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [grams, setGrams] = useState('100');
  const [mKcal, setMKcal] = useState('');
  const [mProtein, setMProtein] = useState('');
  const [mFat, setMFat] = useState('');
  const [mCarbs, setMCarbs] = useState('');

  useEffect(() => {
    if (!entry) return;
    // Show the grams that were actually logged. If grams weren't stored but we
    // know the per-100g values, recover them from the logged calories.
    let g = entry.grams ?? null;
    if (g == null && entry.per100 && entry.per100.kcal > 0) {
      g = Math.round((entry.macros.kcal / entry.per100.kcal) * 100);
    }
    setGrams(g != null ? String(g) : '');
    setMKcal(String(entry.macros.kcal));
    setMProtein(String(entry.macros.protein));
    setMFat(String(entry.macros.fat));
    setMCarbs(String(entry.macros.carbs));
  }, [entry]);

  // Per-100g basis: stored, or derived from the logged amount.
  const per100 =
    entry?.per100 ??
    (entry?.grams ? scaleMacros(entry.macros, 10000 / entry.grams) : null);
  const hasBasis = per100 != null;

  if (!entry) {
    return <Modal visible={false} transparent onRequestClose={onClose} />;
  }

  const g = Number(grams) || 0;
  const preview = hasBasis ? scaleMacros(per100!, g) : null;
  const portion = entry.portion;

  const save = () => {
    if (hasBasis) {
      if (!g) return;
      onSaveGrams(g);
    } else {
      const kcal = parseNum(mKcal);
      if (!kcal) return;
      onSaveManual(g, {
        kcal: Math.round(kcal),
        protein: parseNum(mProtein),
        fat: parseNum(mFat),
        carbs: parseNum(mCarbs),
      });
    }
    onClose();
  };

  return (
    <Modal
      visible={entry !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('entry.editTitle')}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.name}>{entry.name}</Text>

            {hasBasis && portion && (
              <>
                <Text style={styles.portionInfo}>
                  {t('food.portionOf', { label: portion.label, grams: portion.grams })}
                </Text>
                <View style={styles.portionChips}>
                  {[1, 2, 3, 4, 5].map(nn => {
                    const pg = nn * portion.grams;
                    const active = g === pg;
                    return (
                      <Pressable
                        key={nn}
                        onPress={() => setGrams(String(pg))}
                        style={[styles.portionChip, active && styles.portionChipActive]}>
                        <Text
                          style={[
                            styles.portionChipText,
                            active && styles.portionChipTextActive,
                          ]}>
                          ×{nn}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.label}>{t('food.grams')}</Text>
            <TextInput
              value={grams}
              onChangeText={v => setGrams(v.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              style={styles.gramsInput}
              autoFocus={hasBasis && !portion}
            />

            {hasBasis ? (
              <>
                <Text style={styles.caption}>
                  {g} {t('food.gUnit')}
                </Text>
                <View style={styles.stats}>
                  <Stat value={preview!.kcal} label={t('detail.kcal')} color={colors.kcal} />
                  <Stat value={preview!.protein} label={t('macro.protein')} color={colors.protein} />
                  <Stat value={preview!.fat} label={t('macro.fat')} color={colors.fat} />
                  <Stat value={preview!.carbs} label={t('macro.carbs')} color={colors.carbs} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>{t('entry.editMacros')}</Text>
                <View style={styles.macroInputs}>
                  <NumField label={t('detail.kcal')} value={mKcal} onChange={v => setMKcal(sanitize(v))} />
                  <NumField label={t('macro.pShort')} value={mProtein} onChange={v => setMProtein(sanitize(v))} />
                  <NumField label={t('macro.fShort')} value={mFat} onChange={v => setMFat(sanitize(v))} />
                  <NumField label={t('macro.cShort')} value={mCarbs} onChange={v => setMCarbs(sanitize(v))} />
                </View>
              </>
            )}

            <Pressable onPress={save} style={styles.saveBtn}>
              <Text style={styles.saveText}>{t('goals.save')}</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Stat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View
      style={[styles.stat, { backgroundColor: `${color}1A`, borderColor: `${color}55` }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.numField}>
      <Text style={styles.numLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        maxLength={7}
        style={styles.numInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  closeBtn: { fontSize: font.h3, fontWeight: '800', color: colors.textMuted },
  body: { padding: spacing.lg },
  name: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  portionInfo: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.lg,
  },
  portionChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  portionChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  portionChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  portionChipText: { fontSize: font.body, fontWeight: '800', color: colors.textMuted },
  portionChipTextActive: { color: colors.primaryDark },
  label: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  gramsInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  caption: {
    marginTop: spacing.md,
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  macroInputs: { flexDirection: 'row', gap: spacing.sm },
  numField: { flex: 1 },
  numLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  numInput: {
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
  saveBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  saveText: { color: colors.white, fontWeight: '700', fontSize: font.h3 },
});
