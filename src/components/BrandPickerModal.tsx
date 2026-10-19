import React, { useEffect, useMemo, useState } from 'react';
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
import {
  FoodProduct,
  foodLabel,
  searchFoods,
  searchOnline,
} from '../data/foods';
import { useLang } from '../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../theme';

function sanitizeDecimal(text: string): string {
  const s = text.replace(/[^0-9.,]/g, '').replace('.', ',');
  const [intPart, decPart] = s.split(',');
  let out = intPart.slice(0, 4);
  if (s.includes(',')) out += ',' + (decPart ?? '').slice(0, 2);
  return out;
}

const parseNum = (s: string): number => Number(s.replace(',', '.')) || 0;

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
  const { t, lang } = useLang();

  const [query, setQuery] = useState(initialQuery);
  const [manual, setManual] = useState(false);
  const [online, setOnline] = useState<FoodProduct[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(false);

  const [mName, setMName] = useState('');
  const [mKcal, setMKcal] = useState('');
  const [mProtein, setMProtein] = useState('');
  const [mFat, setMFat] = useState('');
  const [mCarbs, setMCarbs] = useState('');

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      setManual(false);
      setOnline([]);
      setLoadingOnline(false);
      setMName('');
      setMKcal('');
      setMProtein('');
      setMFat('');
      setMCarbs('');
    }
  }, [visible, initialQuery]);

  const localResults = useMemo(() => searchFoods(query, []), [query]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setOnline([]);
      setLoadingOnline(false);
      return;
    }
    setLoadingOnline(true);
    let cancelled = false;
    const id = setTimeout(() => {
      searchOnline(q).then(r => {
        if (!cancelled) {
          setOnline(r);
          setLoadingOnline(false);
        }
      });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  const results = useMemo(() => {
    const seen = new Set(localResults.map(r => `${r.name.en}|${r.brand}`));
    const extra = online.filter(o => !seen.has(`${o.name.en}|${o.brand}`));
    return [...localResults, ...extra];
  }, [localResults, online]);

  const saveManual = () => {
    const kcal = parseNum(mKcal);
    const name = mName.trim();
    if (!name || !kcal) return;
    onPick({
      id: `brand-${Date.now()}`,
      name: { en: name, ru: name },
      brand: '',
      per100: {
        kcal,
        protein: parseNum(mProtein),
        fat: parseNum(mFat),
        carbs: parseNum(mCarbs),
      },
    });
    onClose();
  };

  const pick = (food: FoodProduct) => {
    onPick(food);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{t('brand.title')}</Text>
            <Text style={styles.headerSub}>{t('brand.for', { name: title })}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {manual ? (
            <ScrollView
              contentContainerStyle={styles.scrollBody}
              keyboardShouldPersistTaps="handled">
              <Pressable onPress={() => setManual(false)} hitSlop={8}>
                <Text style={styles.back}>{t('goals.back')}</Text>
              </Pressable>
              <TextInput
                value={mName}
                onChangeText={setMName}
                placeholder={t('brand.namePh')}
                placeholderTextColor={colors.textFaint}
                style={styles.textInput}
              />
              <Text style={styles.label}>{t('food.per100')}</Text>
              <View style={styles.macroInputs}>
                <NumField label={t('detail.kcal')} value={mKcal} onChange={v => setMKcal(sanitizeDecimal(v))} />
                <NumField label={t('macro.pShort')} value={mProtein} onChange={v => setMProtein(sanitizeDecimal(v))} />
                <NumField label={t('macro.fShort')} value={mFat} onChange={v => setMFat(sanitizeDecimal(v))} />
                <NumField label={t('macro.cShort')} value={mCarbs} onChange={v => setMCarbs(sanitizeDecimal(v))} />
              </View>
              <Pressable onPress={saveManual} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>{t('brand.save')}</Text>
              </Pressable>
            </ScrollView>
          ) : (
            <View style={styles.searchWrap}>
              <Text style={styles.intro}>{t('brand.intro')}</Text>

              {current && (
                <Pressable onPress={() => { onPick(null); onClose(); }} style={styles.resetBtn}>
                  <Text style={styles.resetText}>{t('brand.reset')}</Text>
                </Pressable>
              )}

              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('brand.search')}
                placeholderTextColor={colors.textFaint}
                style={styles.textInput}
              />

              <Pressable onPress={() => setManual(true)} style={styles.manualBtn}>
                <Text style={styles.manualText}>{t('brand.manual')}</Text>
              </Pressable>

              <ScrollView
                style={styles.results}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag">
                {results.map(food => (
                  <Pressable key={food.id} onPress={() => pick(food)} style={styles.resultRow}>
                    <Text style={styles.resultName} numberOfLines={2}>
                      {foodLabel(food, lang)}
                    </Text>
                    <View style={styles.resultMacros}>
                      <View style={styles.kcalPill}>
                        <Text style={styles.kcalPillText}>
                          {food.per100.kcal} {t('detail.kcal')}
                        </Text>
                      </View>
                      <Text style={[styles.macroTag, { color: colors.protein }]}>
                        {t('macro.pShort')} {food.per100.protein}
                      </Text>
                      <Text style={[styles.macroTag, { color: colors.fat }]}>
                        {t('macro.fShort')} {food.per100.fat}
                      </Text>
                      <Text style={[styles.macroTag, { color: colors.carbs }]}>
                        {t('macro.cShort')} {food.per100.carbs}
                      </Text>
                      <Text style={styles.per100Tag}>{t('food.per100')}</Text>
                    </View>
                  </Pressable>
                ))}
                {loadingOnline && (
                  <Text style={styles.searching}>{t('food.searching')}</Text>
                )}
                {query.trim().length > 1 && !loadingOnline && results.length === 0 && (
                  <Text style={styles.noResults}>{t('food.noResults')}</Text>
                )}
              </ScrollView>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
  headerText: { flex: 1, paddingRight: spacing.md },
  headerTitle: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  closeBtn: { fontSize: font.h3, fontWeight: '800', color: colors.textMuted },

  searchWrap: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  scrollBody: { padding: spacing.lg },
  results: { flex: 1, marginTop: spacing.md },
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

  back: {
    fontSize: font.body,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  resultRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultName: { fontSize: font.body, color: colors.text, fontWeight: '700' },
  resultMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  kcalPill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
  },
  kcalPillText: { color: colors.white, fontWeight: '800', fontSize: font.small },
  macroTag: { fontSize: font.small, fontWeight: '800' },
  per100Tag: { fontSize: font.tiny, color: colors.textFaint, fontWeight: '600' },
  noResults: {
    fontSize: font.small,
    color: colors.textFaint,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  searching: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  manualBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  manualText: { color: colors.primary, fontWeight: '700', fontSize: font.body },
  label: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
  confirmBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  confirmText: { color: colors.white, fontWeight: '700', fontSize: font.h3 },
});
