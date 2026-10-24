// Interchangeable ingredients: any member of a group can stand in for another.
export const substitutionGroups: string[][] = [
  ['tomato', 'pepper_bell', 'cucumber', 'zucchini', 'eggplant'],
  ['broccoli', 'cabbage', 'spinach', 'greens'],
  ['rice', 'buckwheat', 'pasta'],
  ['chicken', 'pork', 'beef', 'mince'],
  ['tuna', 'salmon', 'shrimp'],
  ['beans', 'chickpeas', 'lentils'],
  ['cheese', 'cottage'],
  ['cream', 'sour_cream', 'milk'],
  ['olive_oil', 'oil', 'butter'],
  ['nuts', 'peanut_butter'],
  ['apple', 'banana', 'berries'],
  ['yogurt', 'sour_cream', 'cottage'],
];

export function substitutesFor(id: string): string[] {
  const result: string[] = [];
  for (const group of substitutionGroups) {
    if (group.includes(id)) {
      for (const other of group) {
        if (other !== id && !result.includes(other)) result.push(other);
      }
    }
  }
  return result;
}
