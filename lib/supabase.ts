import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
     process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co');

export type UserProfile = {
  id: string;
  full_name: string;
  year_of_birth: number;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  goal: 'lose' | 'maintain' | 'gain';
  goal_speed: 'slow' | 'medium' | 'fast';
  exercise_days_per_week: number;
  heard_from: string;
  tried_tracking_before: boolean;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  onboarding_complete: boolean;
  created_at: string;
};

export type MealRecord = {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount?: string;
  source?: string;
  created_at: string;
};
