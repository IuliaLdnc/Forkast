import React, { createContext, useContext, useMemo } from 'react';
import { Macros } from '../../core/macros';
import { StorageKeys, usePersistedState } from '../../shared/storage/usePersistedState';
import { Profile, targetsFor } from './domain/targets';

interface ProfileContextValue {
  profile: Profile | null;
  isActivated: boolean;
  target: Macros | null;
  save: (profile: Profile) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile, hydrated] = usePersistedState<Profile | null>(
    StorageKeys.profile,
    null,
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      isActivated: profile !== null,
      target: profile && !profile.track ? targetsFor(profile, profile.goal) : null,
      save: setProfile,
    }),
    [profile, setProfile],
  );

  if (!hydrated) return null;
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
