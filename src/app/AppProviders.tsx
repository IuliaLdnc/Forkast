import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../shared/i18n/LanguageContext';
import { DiaryProvider } from '../features/diary/DiaryContext';
import { FoodsProvider } from '../features/foods/FoodsContext';
import { FridgeProvider } from '../features/fridge/FridgeContext';
import { ProfileProvider } from '../features/profile/ProfileContext';
import { StreakProvider } from '../features/streak/StreakContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <LanguageProvider initial="en">
        <ProfileProvider>
          <StreakProvider>
            <DiaryProvider>
              <FoodsProvider>
                <FridgeProvider>{children}</FridgeProvider>
              </FoodsProvider>
            </DiaryProvider>
          </StreakProvider>
        </ProfileProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
