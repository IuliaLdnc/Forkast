import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../../../shared/i18n/LanguageContext';
import { dayNoun } from '../../../shared/i18n/plural';
import { colors, font, radius, spacing } from '../../../shared/theme';
import { useStreak } from '../StreakContext';

// Milestones are usually reached from the "add food" sheet, which closes in
// the same render. iOS can't present a modal while another one is still
// sliding away (the new one silently never shows), so wait for that first.
const SHOW_DELAY_MS = 600;

// Full-screen "wow" when the streak hits a milestone (3, 7, 14… days).
export function StreakCelebration() {
  const { t, lang } = useLang();
  const { celebrate, dismissCelebrate } = useStreak();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (celebrate === null) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [celebrate]);

  const pop = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pop, pulse]);

  const cardStyle = {
    opacity: pop,
    transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
  };
  const flameStyle = {
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
  };

  const n = celebrate ?? 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissCelebrate}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
          <Text style={styles.count}>{n}</Text>
          <Text style={styles.title}>{t('streak.wow.title')}</Text>
          <Text style={styles.body}>{t('streak.wow.body', { n, noun: dayNoun(n, lang) })}</Text>
          <Pressable onPress={dismissCelebrate} style={styles.cta}>
            <Text style={styles.ctaText}>{t('streak.wow.cta')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#1E2B25CC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  flame: {
    fontSize: 72,
  },
  count: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.accent,
    lineHeight: 70,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  body: {
    fontSize: font.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  ctaText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: font.h3,
  },
});
