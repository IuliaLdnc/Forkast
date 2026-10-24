import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n/LanguageContext';
import { Lang } from '../i18n/types';
import { colors, font, radius } from '../theme';

const OPTIONS: Lang[] = ['en', 'ru'];

export function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <View style={styles.wrap}>
      {OPTIONS.map(option => {
        const active = lang === option;
        return (
          <Pressable
            key={option}
            onPress={() => setLang(option)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.bgWarm,
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.white,
  },
});
