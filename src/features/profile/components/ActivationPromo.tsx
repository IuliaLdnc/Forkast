import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { colors, font, radius, shadow, spacing } from '../../../shared/theme';

export function ActivationPromo({ onActivate }: { onActivate: () => void }) {
  const { t } = useLang();
  return (
    <View>
      <View style={styles.promo}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('goals.promo.badge')}</Text>
        </View>
        <Text style={styles.title}>{t('goals.promo.title')}</Text>
        <Text style={styles.body}>{t('goals.promo.body')}</Text>
        <View style={styles.features}>
          <Text style={styles.feature}>{t('goals.promo.f1')}</Text>
          <Text style={styles.feature}>{t('goals.promo.f2')}</Text>
          <Text style={styles.feature}>{t('goals.promo.f3')}</Text>
        </View>
      </View>
      <PrimaryButton label={t('goals.activate')} onPress={onActivate} />
    </View>
  );
}

const styles = StyleSheet.create({
  promo: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  badgeText: { color: colors.white, fontWeight: '800', fontSize: font.tiny },
  title: { color: colors.white, fontSize: font.h2, fontWeight: '800', marginBottom: spacing.sm },
  body: {
    color: colors.primaryLight,
    fontSize: font.body,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  features: { gap: spacing.sm },
  feature: { color: colors.white, fontSize: font.body, fontWeight: '600' },
});
