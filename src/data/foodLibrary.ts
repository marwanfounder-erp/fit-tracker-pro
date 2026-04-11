export interface FoodItem {
  name: string;
  emoji: string;
  category: "protein" | "carbs" | "dairy" | "fats" | "fruits" | "vegetables";
  unit: "g" | "piece" | "scoop" | "slice";
  gramsPerUnit: number; // for "g": 1; for piece/scoop/slice: grams per unit
  proteinPer100g: number;
  caloriesPer100g: number;
  defaultQty: number;
}

export const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbs" },
  { key: "dairy", label: "Dairy" },
  { key: "fats", label: "Fats" },
  { key: "fruits", label: "Fruits" },
  { key: "vegetables", label: "Veg" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export function calcNutrition(food: FoodItem, qty: number) {
  const totalGrams = qty * food.gramsPerUnit;
  return {
    protein: Math.round((totalGrams / 100) * food.proteinPer100g * 10) / 10,
    calories: Math.round((totalGrams / 100) * food.caloriesPer100g),
    gramsTotal: totalGrams,
  };
}

export const foodLibrary: FoodItem[] = [
  // Protein
  { name: "Chicken Breast", emoji: "🍗", category: "protein", unit: "g", gramsPerUnit: 1, proteinPer100g: 31, caloriesPer100g: 165, defaultQty: 150 },
  { name: "Tuna (Canned)", emoji: "🐟", category: "protein", unit: "g", gramsPerUnit: 1, proteinPer100g: 28, caloriesPer100g: 132, defaultQty: 100 },
  { name: "Salmon", emoji: "🐠", category: "protein", unit: "g", gramsPerUnit: 1, proteinPer100g: 25, caloriesPer100g: 208, defaultQty: 150 },
  { name: "Egg", emoji: "🥚", category: "protein", unit: "piece", gramsPerUnit: 50, proteinPer100g: 13, caloriesPer100g: 155, defaultQty: 3 },
  { name: "Ground Beef (lean)", emoji: "🥩", category: "protein", unit: "g", gramsPerUnit: 1, proteinPer100g: 26, caloriesPer100g: 152, defaultQty: 150 },
  { name: "Whey Protein", emoji: "💪", category: "protein", unit: "scoop", gramsPerUnit: 30, proteinPer100g: 75, caloriesPer100g: 360, defaultQty: 1 },
  { name: "Turkey Breast", emoji: "🦃", category: "protein", unit: "g", gramsPerUnit: 1, proteinPer100g: 29, caloriesPer100g: 135, defaultQty: 150 },
  { name: "Shrimp", emoji: "🍤", category: "protein", unit: "g", gramsPerUnit: 1, proteinPer100g: 24, caloriesPer100g: 99, defaultQty: 150 },
  // Carbs
  { name: "White Rice", emoji: "🍚", category: "carbs", unit: "g", gramsPerUnit: 1, proteinPer100g: 2.7, caloriesPer100g: 130, defaultQty: 200 },
  { name: "Brown Rice", emoji: "🌾", category: "carbs", unit: "g", gramsPerUnit: 1, proteinPer100g: 2.6, caloriesPer100g: 112, defaultQty: 200 },
  { name: "Oats", emoji: "🥣", category: "carbs", unit: "g", gramsPerUnit: 1, proteinPer100g: 17, caloriesPer100g: 389, defaultQty: 80 },
  { name: "Sweet Potato", emoji: "🍠", category: "carbs", unit: "g", gramsPerUnit: 1, proteinPer100g: 2, caloriesPer100g: 86, defaultQty: 200 },
  { name: "Whole Wheat Bread", emoji: "🍞", category: "carbs", unit: "slice", gramsPerUnit: 35, proteinPer100g: 12, caloriesPer100g: 247, defaultQty: 2 },
  { name: "Pasta (cooked)", emoji: "🍝", category: "carbs", unit: "g", gramsPerUnit: 1, proteinPer100g: 5, caloriesPer100g: 158, defaultQty: 200 },
  { name: "Rice Cakes", emoji: "🍘", category: "carbs", unit: "piece", gramsPerUnit: 9, proteinPer100g: 8, caloriesPer100g: 390, defaultQty: 3 },
  // Dairy
  { name: "Greek Yogurt", emoji: "🥛", category: "dairy", unit: "g", gramsPerUnit: 1, proteinPer100g: 10, caloriesPer100g: 59, defaultQty: 200 },
  { name: "Cottage Cheese", emoji: "🧀", category: "dairy", unit: "g", gramsPerUnit: 1, proteinPer100g: 11, caloriesPer100g: 98, defaultQty: 200 },
  { name: "Milk (2%)", emoji: "🥛", category: "dairy", unit: "g", gramsPerUnit: 1, proteinPer100g: 3.3, caloriesPer100g: 50, defaultQty: 250 },
  { name: "Cheese (cheddar)", emoji: "🧀", category: "dairy", unit: "g", gramsPerUnit: 1, proteinPer100g: 25, caloriesPer100g: 402, defaultQty: 30 },
  // Fats
  { name: "Almonds", emoji: "🌰", category: "fats", unit: "g", gramsPerUnit: 1, proteinPer100g: 21, caloriesPer100g: 579, defaultQty: 30 },
  { name: "Peanut Butter", emoji: "🥜", category: "fats", unit: "g", gramsPerUnit: 1, proteinPer100g: 25, caloriesPer100g: 588, defaultQty: 30 },
  { name: "Avocado", emoji: "🥑", category: "fats", unit: "g", gramsPerUnit: 1, proteinPer100g: 2, caloriesPer100g: 160, defaultQty: 100 },
  { name: "Olive Oil", emoji: "🫒", category: "fats", unit: "g", gramsPerUnit: 1, proteinPer100g: 0, caloriesPer100g: 884, defaultQty: 15 },
  { name: "Walnuts", emoji: "🌰", category: "fats", unit: "g", gramsPerUnit: 1, proteinPer100g: 15, caloriesPer100g: 654, defaultQty: 30 },
  // Fruits
  { name: "Banana", emoji: "🍌", category: "fruits", unit: "piece", gramsPerUnit: 120, proteinPer100g: 1.3, caloriesPer100g: 89, defaultQty: 1 },
  { name: "Apple", emoji: "🍎", category: "fruits", unit: "piece", gramsPerUnit: 150, proteinPer100g: 0.3, caloriesPer100g: 52, defaultQty: 1 },
  { name: "Blueberries", emoji: "🫐", category: "fruits", unit: "g", gramsPerUnit: 1, proteinPer100g: 0.7, caloriesPer100g: 57, defaultQty: 100 },
  { name: "Orange", emoji: "🍊", category: "fruits", unit: "piece", gramsPerUnit: 130, proteinPer100g: 0.9, caloriesPer100g: 47, defaultQty: 1 },
  // Vegetables
  { name: "Broccoli", emoji: "🥦", category: "vegetables", unit: "g", gramsPerUnit: 1, proteinPer100g: 2.8, caloriesPer100g: 34, defaultQty: 150 },
  { name: "Spinach", emoji: "🥬", category: "vegetables", unit: "g", gramsPerUnit: 1, proteinPer100g: 2.9, caloriesPer100g: 23, defaultQty: 100 },
  { name: "Mixed Salad", emoji: "🥗", category: "vegetables", unit: "g", gramsPerUnit: 1, proteinPer100g: 1.5, caloriesPer100g: 20, defaultQty: 150 },
];
