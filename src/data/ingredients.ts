

import { LocalizedText } from '../i18n/LanguageContext';

export type IngredientCategory =
  | 'veg'
  | 'protein'
  | 'dairy'
  | 'grain'
  | 'fruit'
  | 'other';

export interface Ingredient {
  id: string;
  name: LocalizedText;
  emoji: string;
  category: IngredientCategory;
  
  pantry?: boolean;
}

export const categories: {
  id: IngredientCategory;
  title: LocalizedText;
  emoji: string;
}[] = [
  { id: 'veg', title: { en: 'Vegetables & greens', ru: 'Овощи и зелень' }, emoji: '🥬' },
  { id: 'protein', title: { en: 'Proteins', ru: 'Белки' }, emoji: '🍗' },
  { id: 'dairy', title: { en: 'Dairy & eggs', ru: 'Молочное и яйца' }, emoji: '🧀' },
  { id: 'grain', title: { en: 'Grains & bread', ru: 'Крупы и мучное' }, emoji: '🌾' },
  { id: 'fruit', title: { en: 'Fruit', ru: 'Фрукты' }, emoji: '🍎' },
  { id: 'other', title: { en: 'Other', ru: 'Прочее' }, emoji: '🫙' },
];

export const ingredients: Ingredient[] = [

  { id: 'tomato', name: { en: 'Tomato', ru: 'Помидор' }, emoji: '🍅', category: 'veg' },
  { id: 'cucumber', name: { en: 'Cucumber', ru: 'Огурец' }, emoji: '🥒', category: 'veg' },
  { id: 'onion', name: { en: 'Onion', ru: 'Лук' }, emoji: '🧅', category: 'veg' },
  { id: 'garlic', name: { en: 'Garlic', ru: 'Чеснок' }, emoji: '🧄', category: 'veg' },
  { id: 'carrot', name: { en: 'Carrot', ru: 'Морковь' }, emoji: '🥕', category: 'veg' },
  { id: 'potato', name: { en: 'Potato', ru: 'Картофель' }, emoji: '🥔', category: 'veg' },
  { id: 'pepper_bell', name: { en: 'Bell pepper', ru: 'Болгарский перец' }, emoji: '🫑', category: 'veg' },
  { id: 'zucchini', name: { en: 'Zucchini', ru: 'Кабачок' }, emoji: '🥒', category: 'veg' },
  { id: 'eggplant', name: { en: 'Eggplant', ru: 'Баклажан' }, emoji: '🍆', category: 'veg' },
  { id: 'cabbage', name: { en: 'Cabbage', ru: 'Капуста' }, emoji: '🥬', category: 'veg' },
  { id: 'broccoli', name: { en: 'Broccoli', ru: 'Брокколи' }, emoji: '🥦', category: 'veg' },
  { id: 'spinach', name: { en: 'Spinach', ru: 'Шпинат' }, emoji: '🥬', category: 'veg' },
  { id: 'mushroom', name: { en: 'Mushrooms', ru: 'Грибы' }, emoji: '🍄', category: 'veg' },
  { id: 'corn', name: { en: 'Corn', ru: 'Кукуруза' }, emoji: '🌽', category: 'veg' },
  { id: 'greens', name: { en: 'Fresh herbs', ru: 'Зелень' }, emoji: '🌿', category: 'veg' },

  { id: 'chicken', name: { en: 'Chicken', ru: 'Курица' }, emoji: '🍗', category: 'protein' },
  { id: 'beef', name: { en: 'Beef', ru: 'Говядина' }, emoji: '🥩', category: 'protein' },
  { id: 'pork', name: { en: 'Pork', ru: 'Свинина' }, emoji: '🥓', category: 'protein' },
  { id: 'mince', name: { en: 'Ground meat', ru: 'Фарш' }, emoji: '🍖', category: 'protein' },
  { id: 'tuna', name: { en: 'Tuna', ru: 'Тунец' }, emoji: '🐟', category: 'protein' },
  { id: 'salmon', name: { en: 'Salmon', ru: 'Лосось' }, emoji: '🍣', category: 'protein' },
  { id: 'shrimp', name: { en: 'Shrimp', ru: 'Креветки' }, emoji: '🦐', category: 'protein' },
  { id: 'tofu', name: { en: 'Tofu', ru: 'Тофу' }, emoji: '🧊', category: 'protein' },
  { id: 'beans', name: { en: 'Beans', ru: 'Фасоль' }, emoji: '🫘', category: 'protein' },
  { id: 'chickpeas', name: { en: 'Chickpeas', ru: 'Нут' }, emoji: '🫛', category: 'protein' },
  { id: 'lentils', name: { en: 'Lentils', ru: 'Чечевица' }, emoji: '🟤', category: 'protein' },

  { id: 'egg', name: { en: 'Eggs', ru: 'Яйца' }, emoji: '🥚', category: 'dairy' },
  { id: 'milk', name: { en: 'Milk', ru: 'Молоко' }, emoji: '🥛', category: 'dairy' },
  { id: 'cheese', name: { en: 'Cheese', ru: 'Сыр' }, emoji: '🧀', category: 'dairy' },
  { id: 'cottage', name: { en: 'Cottage cheese', ru: 'Творог' }, emoji: '🍦', category: 'dairy' },
  { id: 'sour_cream', name: { en: 'Sour cream', ru: 'Сметана' }, emoji: '🥣', category: 'dairy' },
  { id: 'yogurt', name: { en: 'Yogurt', ru: 'Йогурт' }, emoji: '🥛', category: 'dairy' },
  { id: 'butter', name: { en: 'Butter', ru: 'Сливочное масло' }, emoji: '🧈', category: 'dairy' },
  { id: 'cream', name: { en: 'Cream', ru: 'Сливки' }, emoji: '🥛', category: 'dairy' },

  { id: 'rice', name: { en: 'Rice', ru: 'Рис' }, emoji: '🍚', category: 'grain' },
  { id: 'buckwheat', name: { en: 'Buckwheat', ru: 'Гречка' }, emoji: '🌾', category: 'grain' },
  { id: 'pasta', name: { en: 'Pasta', ru: 'Паста' }, emoji: '🍝', category: 'grain' },
  { id: 'oats', name: { en: 'Oats', ru: 'Овсянка' }, emoji: '🥣', category: 'grain' },
  { id: 'bread', name: { en: 'Bread', ru: 'Хлеб' }, emoji: '🍞', category: 'grain' },
  { id: 'flour', name: { en: 'Flour', ru: 'Мука' }, emoji: '🌾', category: 'grain' },
  { id: 'tortilla', name: { en: 'Tortilla / flatbread', ru: 'Тортилья / лаваш' }, emoji: '🫓', category: 'grain' },

  { id: 'apple', name: { en: 'Apple', ru: 'Яблоко' }, emoji: '🍎', category: 'fruit' },
  { id: 'banana', name: { en: 'Banana', ru: 'Банан' }, emoji: '🍌', category: 'fruit' },
  { id: 'lemon', name: { en: 'Lemon', ru: 'Лимон' }, emoji: '🍋', category: 'fruit' },
  { id: 'berries', name: { en: 'Berries', ru: 'Ягоды' }, emoji: '🫐', category: 'fruit' },

  { id: 'olive_oil', name: { en: 'Olive oil', ru: 'Оливковое масло' }, emoji: '🫒', category: 'other', pantry: true },
  { id: 'oil', name: { en: 'Vegetable oil', ru: 'Растительное масло' }, emoji: '🛢️', category: 'other', pantry: true },
  { id: 'salt', name: { en: 'Salt', ru: 'Соль' }, emoji: '🧂', category: 'other', pantry: true },
  { id: 'pepper', name: { en: 'Black pepper', ru: 'Перец чёрный' }, emoji: '🌶️', category: 'other', pantry: true },
  { id: 'sugar', name: { en: 'Sugar', ru: 'Сахар' }, emoji: '🍬', category: 'other', pantry: true },
  { id: 'tomato_paste', name: { en: 'Tomato paste', ru: 'Томатная паста' }, emoji: '🥫', category: 'other' },
  { id: 'soy_sauce', name: { en: 'Soy sauce', ru: 'Соевый соус' }, emoji: '🍶', category: 'other' },
  { id: 'honey', name: { en: 'Honey', ru: 'Мёд' }, emoji: '🍯', category: 'other' },
  { id: 'nuts', name: { en: 'Nuts', ru: 'Орехи' }, emoji: '🥜', category: 'other' },
  { id: 'peanut_butter', name: { en: 'Peanut butter', ru: 'Арахисовая паста' }, emoji: '🥜', category: 'other' },
];

export const ingredientById: Record<string, Ingredient> = ingredients.reduce(
  (acc, ing) => {
    acc[ing.id] = ing;
    return acc;
  },
  {} as Record<string, Ingredient>,
);
