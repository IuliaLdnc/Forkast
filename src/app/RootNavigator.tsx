import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../shared/theme';
import { CounterScreen } from '../features/counter/CounterScreen';
import { FridgeScreen } from '../features/fridge/FridgeScreen';
import { Recipe } from '../features/recipes/data/recipes';
import { RecipeDetailScreen } from '../features/recipes/screens/RecipeDetailScreen';
import { RecipesScreen } from '../features/recipes/screens/RecipesScreen';
import { StreakCelebration } from '../features/streak/components/StreakCelebration';
import { Section, SectionTabs } from './SectionTabs';

// Two swipeable sections live side by side: the recipe flow on the left
// (shown first) and the counter on the right. Recipe results and the recipe
// detail open as full-screen overlays on top of the pager. The results stay
// mounted under the detail, so going back keeps their filter and scroll.

const SECTIONS: Section[] = [
  { icon: '🍴', label: 'nav.recipes' },
  { icon: '🔥', label: 'nav.counter' },
];

export function RootNavigator() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [detail, setDetail] = useState<Recipe | null>(null);

  const goToPage = useCallback(
    (i: number) => {
      pagerRef.current?.scrollTo({ x: i * width, animated: true });
      setPage(i);
    },
    [width],
  );

  // Android back closes the top overlay first (detail → results → pager)
  // instead of leaving the app.
  useEffect(() => {
    if (!recipesOpen && !detail) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (detail) setDetail(null);
      else setRecipesOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [recipesOpen, detail]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const pageSize = { width, height };

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
      >
        <View style={pageSize}>
          <FridgeScreen onSearch={() => setRecipesOpen(true)} insets={insets} />
        </View>
        <View style={pageSize}>
          <CounterScreen insets={insets} />
        </View>
      </ScrollView>

      <SectionTabs sections={SECTIONS} active={page} onSelect={goToPage} top={insets.top + 4} />

      {recipesOpen && (
        <View style={styles.overlay}>
          <RecipesScreen
            onBack={() => setRecipesOpen(false)}
            onOpenRecipe={setDetail}
            insets={insets}
          />
        </View>
      )}

      {detail && (
        <View style={styles.overlay}>
          <RecipeDetailScreen
            key={detail.id}
            recipe={detail}
            onBack={() => setDetail(null)}
            insets={insets}
          />
        </View>
      )}

      <StreakCelebration />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pager: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
  },
});
