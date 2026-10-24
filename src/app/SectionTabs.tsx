import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../shared/i18n/LanguageContext';
import { UiKey } from '../shared/i18n/ui';
import { colors, font, radius, spacing } from '../shared/theme';

export interface Section {
  icon: string;
  label: UiKey;
}

export function SectionTabs({
  sections,
  active,
  onSelect,
  top,
}: {
  sections: Section[];
  active: number;
  onSelect: (index: number) => void;
  top: number;
}) {
  const { t } = useLang();
  return (
    <View style={[styles.wrap, { top }]} pointerEvents="box-none">
      <View style={styles.tabs}>
        {sections.map((s, i) => {
          const isActive = i === active;
          return (
            <Pressable
              key={s.label}
              onPress={() => onSelect(i)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.text, isActive && styles.textActive]}>
                {s.icon} {t(s.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFFF2',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.primary },
  text: { fontSize: font.small, fontWeight: '700', color: colors.textMuted },
  textActive: { color: colors.white },
});
