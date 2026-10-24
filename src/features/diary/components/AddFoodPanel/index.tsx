import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { scaleMacros } from '../../../../core/macros';
import { useLang } from '../../../../shared/i18n/LanguageContext';
import { TextField } from '../../../../shared/ui/FormControls';
import { SheetModal } from '../../../../shared/ui/SheetModal';
import { spacing } from '../../../../shared/theme';
import { useFoods } from '../../../foods/FoodsContext';
import { FoodProduct, foodLabel, isOnlineFood } from '../../../foods/domain/foods';
import { useFoodSearch } from '../../../foods/hooks/useFoodSearch';
import { FoodSearchResults, ManualEntryButton } from '../../../foods/components/FoodSearchResults';
import { useDiary } from '../../DiaryContext';
import { Meal } from '../../domain/diary';
import { ManualFoodStep } from './ManualFoodStep';
import { PortionStep } from './PortionStep';

type Step = { name: 'search' } | { name: 'manual' } | { name: 'portion'; food: FoodProduct };

const DEFAULT_GRAMS = '100';

// Sheet for logging a food: search (local + online) or describe it manually,
// then pick the amount and meal.
export function AddFoodPanel({
  visible,
  onClose,
  initialMeal = 'breakfast',
}: {
  visible: boolean;
  onClose: () => void;
  initialMeal?: Meal;
}) {
  const { t, lang } = useLang();
  const { catalog, saveCustomFood } = useFoods();
  const { addFood } = useDiary();

  const [step, setStep] = useState<Step>({ name: 'search' });
  const [query, setQuery] = useState('');
  const [grams, setGrams] = useState(DEFAULT_GRAMS);
  const [meal, setMeal] = useState<Meal>(initialMeal);
  const search = useFoodSearch(query, catalog);

  useEffect(() => {
    if (visible) setMeal(initialMeal);
  }, [visible, initialMeal]);

  const close = () => {
    setStep({ name: 'search' });
    setQuery('');
    setGrams(DEFAULT_GRAMS);
    onClose();
  };

  // A product defaults to one portion when it defines one, otherwise 100 g.
  const selectFood = (food: FoodProduct) => {
    setStep({ name: 'portion', food });
    setGrams(String(food.portion ? food.portion.grams : 100));
  };

  const createFood = (food: FoodProduct) => {
    saveCustomFood(food);
    selectFood(food);
  };

  const confirm = (food: FoodProduct) => {
    const g = Number(grams);
    if (!g) return;
    // Remember online products so they show up in local search next time.
    if (isOnlineFood(food)) saveCustomFood(food);
    addFood(foodLabel(food, lang), scaleMacros(food.per100, g), meal, {
      grams: g,
      per100: food.per100,
      portion: food.portion,
    });
    close();
  };

  const backToSearch = () => setStep({ name: 'search' });

  return (
    <SheetModal visible={visible} title={t('food.title')} onClose={close} onDismiss={close}>
      {step.name === 'portion' && (
        <PortionStep
          food={step.food}
          grams={grams}
          onGramsChange={setGrams}
          meal={meal}
          onMealChange={setMeal}
          onBack={backToSearch}
          onConfirm={() => confirm(step.food)}
        />
      )}
      {step.name === 'manual' && <ManualFoodStep onBack={backToSearch} onCreate={createFood} />}
      {step.name === 'search' && (
        <View style={styles.searchWrap}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={t('food.search')}
            autoFocus
          />
          <ManualEntryButton
            label={t('food.addManual')}
            onPress={() => setStep({ name: 'manual' })}
          />
          <FoodSearchResults {...search} onSelect={selectFood} />
        </View>
      )}
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
