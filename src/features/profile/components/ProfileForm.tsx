import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { parseNumber, sanitizeDecimal, sanitizeInteger } from '../../../shared/lib/numberInput';
import { NumberField, Segmented, SelectChip } from '../../../shared/ui/FormControls';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { colors, font, spacing } from '../../../shared/theme';
import { Activity, Gender, Goal, Profile } from '../domain/targets';
import { ACTIVITIES, activityLabel, genderLabel, GOALS, goalLabel } from '../labels';

export function isValidBody(age: number, height: number, weight: number): boolean {
  return age >= 5 && height >= 80 && weight >= 20;
}

export function ProfileForm({
  initial,
  onSave,
}: {
  initial: Profile | null;
  onSave: (profile: Profile) => void;
}) {
  const { t } = useLang();
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'male');
  const [age, setAge] = useState(initial ? String(initial.age) : '');
  const [height, setHeight] = useState(initial ? String(initial.height) : '');
  const [weight, setWeight] = useState(initial ? String(initial.weight).replace('.', ',') : '');
  const [activity, setActivity] = useState<Activity>(initial?.activity ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? 'maintain');
  const [track, setTrack] = useState(initial?.track ?? false);
  const [error, setError] = useState(false);

  const submit = () => {
    const a = Number(age);
    const h = Number(height);
    const w = parseNumber(weight);
    if (!isValidBody(a, h, w)) {
      setError(true);
      return;
    }
    onSave({ gender, age: a, height: h, weight: w, activity, goal, track });
  };

  return (
    <View>
      <Text style={styles.title}>{t('goals.form.title')}</Text>

      <Text style={styles.label}>{t('goals.gender')}</Text>
      <Segmented
        options={(['male', 'female'] as Gender[]).map(g => ({
          value: g,
          label: t(genderLabel[g]),
        }))}
        value={gender}
        onChange={setGender}
      />

      <View style={styles.numberRow}>
        <NumberField
          size="lg"
          label={t('goals.age')}
          value={age}
          onChange={v => setAge(sanitizeInteger(v, 3))}
          keyboardType="number-pad"
          maxLength={3}
        />
        <NumberField
          size="lg"
          label={t('goals.height')}
          value={height}
          onChange={v => setHeight(sanitizeInteger(v, 3))}
          keyboardType="number-pad"
          maxLength={3}
        />
        <NumberField
          size="lg"
          label={t('goals.weight')}
          value={weight}
          onChange={v => setWeight(sanitizeDecimal(v, 3))}
          maxLength={6}
        />
      </View>

      <Text style={styles.label}>{t('goals.activity')}</Text>
      <View style={styles.chipWrap}>
        {ACTIVITIES.map(a => (
          <SelectChip
            key={a}
            label={t(activityLabel[a])}
            active={activity === a}
            onPress={() => setActivity(a)}
          />
        ))}
      </View>

      <Text style={styles.label}>{t('goals.goal')}</Text>
      <View style={styles.chipWrap}>
        {GOALS.map(g => (
          <SelectChip
            key={g}
            label={t(goalLabel[g])}
            active={!track && goal === g}
            onPress={() => {
              setTrack(false);
              setGoal(g);
            }}
          />
        ))}
        <SelectChip label={t('goals.goal.track')} active={track} onPress={() => setTrack(true)} />
      </View>

      {error && <Text style={styles.error}>{t('goals.invalid')}</Text>}

      <View style={styles.saveBtn}>
        <PrimaryButton label={t('goals.save')} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  numberRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: {
    color: colors.danger,
    fontSize: font.small,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  saveBtn: { marginTop: spacing.xl },
});
