import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { formatDecimal } from '../../../shared/lib/numberInput';
import { colors, font, radius, shadow, spacing } from '../../../shared/theme';
import { Profile } from '../domain/targets';
import { activityLabel, genderLabel } from '../labels';

export function ProfileSummary({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  const { t, lang } = useLang();
  return (
    <View style={styles.card}>
      <Text style={styles.text}>
        {t('goals.summary', {
          gender: t(genderLabel[profile.gender]),
          age: profile.age,
          height: profile.height,
          weight: formatDecimal(profile.weight, lang),
          activity: t(activityLabel[profile.activity]),
        })}
      </Text>
      <Pressable onPress={onEdit} hitSlop={8}>
        <Text style={styles.edit}>{t('goals.edit')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.soft,
  },
  text: { flex: 1, fontSize: font.small, color: colors.text, fontWeight: '600' },
  edit: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '700',
    paddingLeft: spacing.md,
  },
});
