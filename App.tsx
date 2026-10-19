import React, { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FridgeScreen } from './src/screens/FridgeScreen';
import { RecipesScreen } from './src/screens/RecipesScreen';
import { RecipeDetailScreen } from './src/screens/RecipeDetailScreen';
import { CounterScreen } from './src/screens/CounterScreen';
import { StreakCelebration } from './src/components/StreakCelebration';
import { Recipe } from './src/data/recipes';
import { LanguageProvider, useLang } from './src/i18n/LanguageContext';
import { ProfileProvider } from './src/profile/ProfileContext';
import { colors, font, radius, spacing } from './src/theme';

// Two swipeable sections live side by side: the recipe flow on the left
// (index 0, shown first) and the counter on the right (index 1). Recipe results
// and the recipe detail open as full-screen overlays on top of the pager.
type Overlay =
  | { name: 'recipes' }
  | { name: 'detail'; recipe: Recipe }
  | null;

const RECIPES_PAGE = 0;
const COUNTER_PAGE = 1;

function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider initial="en">
        <ProfileProvider>
          <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
          <AppContent />
        </ProfileProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const positioned = useRef(false);

  const [page, setPage] = useState(RECIPES_PAGE);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const goToPage = useCallback(
    (i: number) => {
      pagerRef.current?.scrollTo({ x: i * width, animated: true });
      setPage(i);
    },
    [width],
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={pagerRef}
        style={styles.pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={onMomentumEnd}
        onLayout={() => {
          if (!positioned.current) {
            positioned.current = true;
            pagerRef.current?.scrollTo({ x: RECIPES_PAGE * width, animated: false });
          }
        }}>
        <View style={{ width, height }}>
          <FridgeScreen
            selected={selected}
            toggle={toggle}
            clear={clear}
            onSearch={() => setOverlay({ name: 'recipes' })}
            insets={insets}
          />
        </View>
        <View style={{ width, height }}>
          <CounterScreen insets={insets} />
        </View>
      </ScrollView>

      <SectionTabs page={page} onSelect={goToPage} insets={insets} />

      {overlay?.name === 'recipes' && (
        <View style={styles.overlay}>
          <RecipesScreen
            selected={selected}
            onBack={() => setOverlay(null)}
            onOpenRecipe={recipe => setOverlay({ name: 'detail', recipe })}
            insets={insets}
          />
        </View>
      )}

      {overlay?.name === 'detail' && (
        <View style={styles.overlay}>
          <RecipeDetailScreen
            recipe={overlay.recipe}
            selected={selected}
            onBack={() => setOverlay({ name: 'recipes' })}
            insets={insets}
          />
        </View>
      )}

      <StreakCelebration />
    </View>
  );
}

function SectionTabs({
  page,
  onSelect,
  insets,
}: {
  page: number;
  onSelect: (i: number) => void;
  insets: { top: number };
}) {
  const { t } = useLang();
  const tabs = [
    { index: RECIPES_PAGE, label: `🍴 ${t('nav.recipes')}` },
    { index: COUNTER_PAGE, label: `🔥 ${t('nav.counter')}` },
  ];
  return (
    <View style={[styles.tabsWrap, { top: insets.top + 4 }]} pointerEvents="box-none">
      <View style={styles.tabs}>
        {tabs.map(tab => {
          const active = page === tab.index;
          return (
            <Pressable
              key={tab.index}
              onPress={() => onSelect(tab.index)}
              style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  pager: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
  },
  tabsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
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
  tab: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.white,
  },
});

export default App;
