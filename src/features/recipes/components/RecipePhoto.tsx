import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Recipe } from '../data/recipes';
import { recipeImages } from '../data/recipeImages';

// The recipe's photo, or its emoji on a plain background if it has none.
export function RecipePhoto({
  recipe,
  style,
  emojiSize,
}: {
  recipe: Recipe;
  style: StyleProp<ImageStyle>;
  emojiSize: number;
}) {
  const photo = recipeImages[recipe.id];
  if (photo) return <Image source={photo} style={style} resizeMode="cover" />;
  return (
    <View style={[style as StyleProp<ViewStyle>, styles.fallback]}>
      <Text style={{ fontSize: emojiSize }}>{recipe.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
