'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Flame, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import ProgressRing from '@/components/ProgressRing';
import AddFoodModal from '@/components/AddFoodModal';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { useSettings } from '@/lib/settings-store';
import { getMealEmoji, formatCalories } from '@/lib/utils';
import { t } from '@/lib/i18n';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

export default function Dashboard() {
  const [addingTo, setAddingTo] = useState<typeof MEAL_TYPES[number] | null>(null);
  const [greeting, setGreeting] = useState('');
  const [mounted, setMounted] = useState(false);
  const { goals, getTodaysMeals, getTodaysTotals, removeFoodFromMeal } = useAppStore();
  const { user, loading } = useAuthStore();
  const { lang } = useSettings();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    if (h < 12) setGreeting(t('goodMorning', lang));
    else if (h < 17) setGreeting(t('goodAfternoon', lang));
    else setGreeting(t('goodEvening', lang));
  }, [lang]);

  useEffect(() => {
    if (!mounted) return;
    const isGuest = localStorage.getItem('calorieai-guest') === 'true';
    const onboardingDone = localStorage.getItem('calorieai-onboarding-done') === 'true';
    if (!loading && !user && !isGuest) { router.replace('/login'); return; }
    if (!onboardingDone && !isGuest) { router.replace('/login'); }
  }, [mounted, user, loading]);

  const localProfile = mounted ? (() => { try { return JSON.parse(localStorage.getItem('calorieai-profile') || 'null'); } catch { return null; } })() : null;
  const calGoal = localProfile?.daily_calorie_goal || goals.calories;
  const protGoal = localProfile?.daily_protein_goal || goals.protein;
  const displayName = localProfile?.full_name?.split(' ')[0] || user?.displayName || '';

  const todayMeals = getTodaysMeals();
  const totals = getTodaysTotals();
  const calPct = Math.min((totals.calories / calGoal) * 100, 100);
  const remaining = Math.max(calGoal - totals.calories, 0);

  const MEAL_LABELS: Record<string, string> = {
    breakfast: t('breakfast', lang), lunch: t('lunch', lang),
    dinner: t('dinner', lang), snacks: t('snacks', lang),
  };

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text)' }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-nav" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-16 pb-5">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text3)' }}>
              {format(new Date(), 'EEEE, d בMMMM')}
            </p>
            <h1 className="text-[24px] font-black mt-0.5" style={{ color: 'var(--text)' }}>
              {greeting}{displayName ? `, ${displayName}` : ''} 👋
            </h1>
          </motion.div>
        </div>

        {/* Calorie Ring Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mx-4 mb-3 rounded-[28px] p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] mb-1" style={{ color: 'var(--text3)' }}>{t('caloriesToday', lang)}</p>
              <motion.p key={totals.calories} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="text-[42px] font-black tracking-tight leading-none" style={{ color: 'var(--text)' }}>
                {formatCalories(totals.calories)}
              </motion.p>
              <p className="text-[13px] mt-1.5" style={{ color: 'var(--text3)' }}>
                {t('ofGoal', lang)} <span className="font-semibold" style={{ color: 'var(--text2)' }}>{formatCalories(calGoal)}</span>
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[13px]" style={{ color: 'var(--text2)' }}>
                    {formatCalories(remaining)} {t('remaining', lang)}
                  </span>
                </div>
                {totals.calories > calGoal && (
                  <div className="flex items-center gap-2">
                    <Flame size={12} className="text-red-400" />
                    <span className="text-red-400 text-[12px] font-medium">
                      {t('exceededBy', lang)}{formatCalories(totals.calories - calGoal)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <ProgressRing size={110} strokeWidth={7} progress={calPct}
              color={totals.calories > calGoal ? '#f87171' : 'var(--accent)'}>
              <div className="text-center">
                <p className="text-[20px] font-black leading-none" style={{ color: 'var(--text)' }}>{Math.round(calPct)}%</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>{lang === 'he' ? 'מהיעד' : 'of goal'}</p>
              </div>
            </ProgressRing>
          </div>
        </motion.div>

        {/* Macro Cards */}
        <div className="mx-4 mb-3 grid grid-cols-3 gap-2.5">
          {[
            { labelKey: 'protein' as const, current: totals.protein, goal: protGoal, color: '#60a5fa', icon: '💪', unit: 'g' },
            { labelKey: 'carbs' as const, current: totals.carbs, goal: goals.carbs, color: '#fb923c', icon: '🌾', unit: 'g' },
            { labelKey: 'fat' as const, current: totals.fat, goal: goals.fat, color: '#a78bfa', icon: '🥑', unit: 'g' },
          ].map((m, i) => {
            const pct = Math.min((m.current / m.goal) * 100, 100);
            return (
              <motion.div key={m.labelKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.05 }}
                className="rounded-[22px] p-3.5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p className="text-[15px] mb-1.5">{m.icon}</p>
                <p className="text-[18px] font-black leading-none" style={{ color: 'var(--text)' }}>
                  {Math.round(m.current)}<span className="text-[10px] font-normal" style={{ color: 'var(--text3)' }}>{m.unit}</span>
                </p>
                <p className="text-[11px] mt-0.5 mb-2.5" style={{ color: 'var(--text3)' }}>{t(m.labelKey, lang)}</p>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: m.color }}
                    initial={{ width: '0%' }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1 }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Meals */}
        <div className="px-4 space-y-2.5">
          {MEAL_TYPES.map((mealType, i) => {
            const entries = todayMeals.filter(m => m.mealType === mealType);
            const allFoods = entries.flatMap(m => m.foods);
            const mealCals = allFoods.reduce((s, f) => s + f.calories, 0);
            const mealProt = allFoods.reduce((s, f) => s + f.protein, 0);
            return (
              <motion.div key={mealType} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.06 }}
                className="rounded-[24px] overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]">{getMealEmoji(mealType)}</span>
                    <div>
                      <p className="font-bold text-[15px]" style={{ color: 'var(--text)' }}>{MEAL_LABELS[mealType]}</p>
                      {allFoods.length > 0 && (
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--text3)' }}>
                          {Math.round(mealCals)} {lang === 'he' ? 'קל׳' : 'cal'} · {Math.round(mealProt)}g {t('protein', lang)}
                        </p>
                      )}
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.88 }} onClick={() => setAddingTo(mealType)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <Plus size={16} style={{ color: 'var(--text)' }} />
                  </motion.button>
                </div>
                <AnimatePresence>
                  {allFoods.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      {entries.map(entry => entry.foods.map(food => (
                        <motion.div key={food.id} layout
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between px-4 py-3"
                          style={{ borderBottom: '1px solid var(--border)' }}>
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-[14px] font-medium truncate" style={{ color: 'var(--text)' }}>{food.name}</p>
                            {food.amount && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text3)' }}>{food.amount}</p>}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>{Math.round(food.calories)}</p>
                              <p className="text-[10px]" style={{ color: 'var(--text3)' }}>{Math.round(food.protein)}g P</p>
                            </div>
                            <button onClick={() => removeFoodFromMeal(entry.id, food.id)}
                              className="p-1 transition-colors hover:text-red-400"
                              style={{ color: 'var(--text3)' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </motion.div>
                      )))}
                    </div>
                  )}
                </AnimatePresence>
                {allFoods.length === 0 && (
                  <button onClick={() => setAddingTo(mealType)}
                    className="w-full pb-4 text-[12px] text-center" style={{ color: 'var(--text3)' }}>
                    {t('tapToAdd', lang)}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <BottomNav />
      {addingTo && (
        <AddFoodModal isOpen={true} onClose={() => setAddingTo(null)} mealType={addingTo} />
      )}
    </div>
  );
}
