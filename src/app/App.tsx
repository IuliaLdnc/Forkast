import React from 'react';
import { StatusBar } from 'react-native';
import { colors } from '../shared/theme';
import { AppProviders } from './AppProviders';
import { RootNavigator } from './RootNavigator';

export default function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <RootNavigator />
    </AppProviders>
  );
}
