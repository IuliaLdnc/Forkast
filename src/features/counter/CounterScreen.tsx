import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useLang } from '../../shared/i18n/LanguageContext';
import { dayNoun } from '../../shared/i18n/plural';
import { useToggleSet } from '../../shared/hooks/useToggleSet';
import { colors, font, radius, spacing } from '../../shared/theme';
import { useDiary } from '../diary/DiaryContext';
import { DiaryEntry, entriesForMeal, Meal, MEALS } from '../diary/domain/diary';
import { AddFoodPanel } from '../diary/components/AddFoodPanel';
import { EditEntryModal } from '../diary/components/EditEntryModal';
import { MealCard } from '../diary/components/MealCard';
import { useProfile } from '../profile/ProfileContext';
import { Profile } from '../profile/domain/targets';
import { goalLabel } from '../profile/labels';
import { ActivationPromo } from '../profile/components/ActivationPromo';
import { ProfileForm } from '../profile/components/ProfileForm';
import { ProfileSummary } from '../profile/components/ProfileSummary';
import { useStreak } from '../streak/StreakContext';
import { StreakBadge } from '../streak/components/StreakBadge';
import { CalorieCounterCard } from './components/CalorieCounterCard';

export function CounterScreen({ insets }: { insets: EdgeInsets }) {
  const { t } = useLang();
  const { profile, save } = useProfile();
  const [editing, setEditing] = useState(false);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 48 }]}>
        <Text style={styles.title}>{t('counter.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {editing ? (
          <ProfileForm
            initial={profile}
            onSave={next => {
              save(next);
              setEditing(false);
            }}
          />
        ) : profile ? (
          <DailyLog profile={profile} onEditProfile={() => setEditing(true)} />
        ) : (
          <ActivationPromo onActivate={() => setEditing(true)} />
        )}
      </ScrollView>
    </View>
  );
}

function DailyLog({ profile, onEditProfile }: { profile: Profile; onEditProfile: () => void }) {
  const { t, lang } = useLang();
  const { target } = useProfile();
  const { entries, consumed, removeEntry } = useDiary();
  const { streak } = useStreak();
  const expanded = useToggleSet<Meal>();
  const [addMeal, setAddMeal] = useState<Meal | null>(null);
  const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null);

  return (
    <View>
      <View style={styles.topRow}>
        <View style={styles.goalBadge}>
          {target ? (
            <>
              <Text style={styles.goalBadgeText}>🎯 {t(goalLabel[profile.goal])}</Text>
              <Text style={styles.goalBadgeKcal}>
                {target.kcal} {t('detail.kcal')}
              </Text>
            </>
          ) : (
            <Text style={styles.goalBadgeText}>📋 {t('counter.trackMode')}</Text>
          )}
        </View>
        <StreakBadge streak={streak} />
      </View>

      <Text style={[styles.streakText, streak > 0 ? styles.streakLabel : styles.streakHint]}>
        {streak > 0 ? t('streak.row', { noun: dayNoun(streak, lang) }) : t('streak.none')}
      </Text>

      <CalorieCounterCard consumed={consumed} target={target} />

      {MEALS.map(meal => (
        <MealCard
          key={meal}
          meal={meal}
          items={entriesForMeal(entries, meal)}
          expanded={expanded.set.has(meal)}
          onToggle={() => expanded.toggle(meal)}
          onAdd={() => setAddMeal(meal)}
          onEdit={setEditEntry}
          onRemove={removeEntry}
        />
      ))}

      <ProfileSummary profile={profile} onEdit={onEditProfile} />

      <AddFoodPanel
        visible={addMeal !== null}
        initialMeal={addMeal ?? 'breakfast'}
        onClose={() => setAddMeal(null)}
      />
      <EditEntryModal entry={editEntry} onClose={() => setEditEntry(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  body: { padding: spacing.lg },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  goalBadge: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  goalBadgeText: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  goalBadgeKcal: { fontSize: font.small, fontWeight: '700', color: colors.primary },
  streakText: { fontSize: font.small, marginTop: spacing.sm, textAlign: 'right' },
  streakLabel: { fontWeight: '700', color: colors.accent },
  streakHint: { fontWeight: '600', color: colors.textMuted },
});
