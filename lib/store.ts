'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount?: string;
  source?: 'ai' | 'barcode' | 'manual' | 'search';
  imageUrl?: string;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  foods: FoodItem[];
  timestamp: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayData {
  date: string;
  meals: MealEntry[];
}

interface AppState {
  goals: DailyGoals;
  meals: MealEntry[];
  setGoals: (goals: Partial<DailyGoals>) => void;
  addMealEntry: (entry: MealEntry) => void;
  updateMealEntry: (id: string, entry: Partial<MealEntry>) => void;
  deleteMealEntry: (id: string) => void;
  addFoodToMeal: (mealId: string, food: FoodItem) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  getTodaysMeals: () => MealEntry[];
  getDayMeals: (date: string) => MealEntry[];
  getTodaysTotals: () => { calories: number; protein: number; carbs: number; fat: number };
  getDayTotals: (date: string) => { calories: number; protein: number; carbs: number; fat: number };
  getWeekData: () => DayData[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      goals: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
      },
      meals: [],

      setGoals: (goals) =>
        set((state) => ({ goals: { ...state.goals, ...goals } })),

      addMealEntry: (entry) =>
        set((state) => ({ meals: [...state.meals, entry] })),

      updateMealEntry: (id, updated) =>
        set((state) => ({
          meals: state.meals.map((m) => (m.id === id ? { ...m, ...updated } : m)),
        })),

      deleteMealEntry: (id) =>
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),

      addFoodToMeal: (mealId, food) =>
        set((state) => ({
          meals: state.meals.map((m) =>
            m.id === mealId ? { ...m, foods: [...m.foods, food] } : m
          ),
        })),

      removeFoodFromMeal: (mealId, foodId) =>
        set((state) => ({
          meals: state.meals.map((m) =>
            m.id === mealId
              ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) }
              : m
          ),
        })),

      getTodaysMeals: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().meals.filter((m) => m.date === today);
      },

      getDayMeals: (date) => {
        return get().meals.filter((m) => m.date === date);
      },

      getTodaysTotals: () => {
        const todayMeals = get().getTodaysMeals();
        return calculateTotals(todayMeals);
      },

      getDayTotals: (date) => {
        const dayMeals = get().getDayMeals(date);
        return calculateTotals(dayMeals);
      },

      getWeekData: () => {
        const result: DayData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = format(date, 'yyyy-MM-dd');
          result.push({
            date: dateStr,
            meals: get().getDayMeals(dateStr),
          });
        }
        return result;
      },
    }),
    {
      name: 'calorieai-storage',
    }
  )
);

function calculateTotals(meals: MealEntry[]) {
  return meals.reduce(
    (acc, meal) => {
      meal.foods.forEach((food) => {
        acc.calories += food.calories;
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
