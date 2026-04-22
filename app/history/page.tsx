'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';
import { getMealEmoji } from '@/lib/utils';

type View = 'week' | 'log';
const MEAL_HE: Record<string, string> = { breakfast:'ארוחת בוקר', lunch:'צהריים', dinner:'ערב', snacks:'חטיפים' };

export default function HistoryPage() {
  const [view, setView] = useState<View>('week');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const { getWeekData, goals, getDayMeals } = useAppStore();
  const weekData = getWeekData();

  const DAY_HE = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];

  const chartData = weekData.map(day => {
    const totals = day.meals.reduce((acc, meal) => {
      meal.foods.forEach(f => { acc.calories+=f.calories; acc.protein+=f.protein; });
      return acc;
    }, { calories:0, protein:0 });
    const date = parseISO(day.date);
    return { date:day.date, label:DAY_HE[date.getDay()], isToday:day.date===format(new Date(),'yyyy-MM-dd'), ...totals };
  });

  const logged = chartData.filter(d => d.calories > 0);
  const avgCal = logged.length ? Math.round(logged.reduce((s,d)=>s+d.calories,0)/logged.length) : 0;
  const avgProt = logged.length ? Math.round(logged.reduce((s,d)=>s+d.protein,0)/logged.length) : 0;

  const displayDay = selectedDay || format(new Date(), 'yyyy-MM-dd');
  const displayMeals = getDayMeals(displayDay);
  const dayTotals = displayMeals.reduce((acc, m) => {
    m.foods.forEach(f => { acc.calories+=f.calories; acc.protein+=f.protein; });
    return acc;
  }, { calories:0, protein:0 });

  const TooltipStyle = { background:'#111', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white', fontSize:'12px' };

  return (
    <div className="min-h-screen bg-black pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.04]"
          style={{background:'radial-gradient(circle, rgba(251,146,60,0.8) 0%, transparent 70%)'}} />
      </div>

      <div className="relative z-10 px-4 pt-16">
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-5">
          <h1 className="text-[26px] font-black tracking-tight">היסטוריה</h1>
          <p className="text-white/35 text-[13px] mt-0.5">תזונה לאורך זמן</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{background:'rgba(255,255,255,0.06)'}}>
          {([['week','📊 שבועי'],['log','📋 יומן']] as const).map(([v,l]) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all ${view===v?'bg-white text-black':'text-white/45'}`}>
              {l}
            </button>
          ))}
        </div>

        {view === 'week' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {label:'קל׳ ממוצע', val:avgCal||'—'},
                {label:'חלבון ממוצע', val:avgProt?`${avgProt}g`:'—'},
                {label:'ימים מעוקבים', val:logged.length},
              ].map((s,i) => (
                <motion.div key={s.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                  className="liquid-glass-card rounded-[22px] p-3.5 text-center">
                  <p className="text-[20px] font-black text-white">{s.val}</p>
                  <p className="text-[11px] text-white/38 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Calorie chart */}
            <div className="liquid-glass-card rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[14px] font-semibold text-white">קלוריות</p>
                <p className="text-[12px] text-white/35">יעד: {goals.calories}</p>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={chartData} barSize={26}>
                  <XAxis dataKey="label" tick={{fill:'rgba(255,255,255,0.35)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TooltipStyle} cursor={false}
                    formatter={(v:number) => [`${Math.round(v)} קל׳`, 'קלוריות']} />
                  <Bar dataKey="calories" radius={[8,8,2,2]}
                    fill="rgba(255,255,255,0.15)" activeBar={{fill:'rgba(255,255,255,0.7)'}} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Protein chart */}
            <div className="liquid-glass-card rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[14px] font-semibold text-white">חלבון</p>
                <p className="text-[12px] text-white/35">יעד: {goals.protein}g</p>
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={chartData}>
                  <XAxis dataKey="label" tick={{fill:'rgba(255,255,255,0.35)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TooltipStyle} formatter={(v:number) => [`${Math.round(v)}g`, 'חלבון']} />
                  <Line type="monotone" dataKey="protein" stroke="#60a5fa" strokeWidth={2.5}
                    dot={{fill:'#60a5fa',r:4,strokeWidth:0}} activeDot={{r:6,fill:'#60a5fa'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Daily breakdown */}
            <div className="liquid-glass-card rounded-[24px] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <p className="text-[14px] font-semibold">פירוט יומי</p>
              </div>
              {chartData.map((day, i) => {
                const calPct = Math.min((day.calories/goals.calories)*100,100);
                const protPct = Math.min((day.protein/goals.protein)*100,100);
                return (
                  <motion.div key={day.date} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                    className="px-5 py-3.5 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-[14px] font-semibold ${day.isToday?'text-white':'text-white/55'}`}>
                        {day.isToday ? 'היום' : format(parseISO(day.date), 'EEE, d/M')}
                      </p>
                      {day.calories > 0 ? (
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-white">{Math.round(day.calories)} קל׳</p>
                          <p className="text-[11px] text-white/30">{Math.round(day.protein)}g חלבון</p>
                        </div>
                      ) : <p className="text-[12px] text-white/20">אין נתונים</p>}
                    </div>
                    {day.calories > 0 && (
                      <div className="space-y-1.5">
                        <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{width:`${calPct}%`}} />
                        </div>
                        <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{width:`${protPct}%`}} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === 'log' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
            {/* Day selector */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
              {Array.from({length:7},(_,i) => {
                const date = subDays(new Date(), 6-i);
                const dateStr = format(date,'yyyy-MM-dd');
                const isSelected = displayDay === dateStr;
                const isToday = dateStr === format(new Date(),'yyyy-MM-dd');
                const hasData = getDayMeals(dateStr).length > 0;
                return (
                  <button key={dateStr} onClick={() => setSelectedDay(dateStr)}
                    className={`flex-shrink-0 flex flex-col items-center py-3 px-4 rounded-[18px] min-w-[56px] transition-all ${
                      isSelected ? 'bg-white text-black' : 'liquid-glass-card text-white/55'
                    }`}>
                    <p className="text-[11px] font-medium">{DAY_HE[date.getDay()]}</p>
                    <p className="text-[20px] font-black">{format(date,'d')}</p>
                    {hasData && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected?'bg-black':'bg-white/45'}`} />}
                  </button>
                );
              })}
            </div>

            <div className="liquid-glass-card rounded-[24px] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-[14px] font-semibold">
                  {displayDay===format(new Date(),'yyyy-MM-dd') ? 'היום' : format(parseISO(displayDay),'d בMMMM')}
                </p>
                {dayTotals.calories > 0 && (
                  <p className="text-[12px] text-white/38">
                    {Math.round(dayTotals.calories)} קל׳ · {Math.round(dayTotals.protein)}g חלבון
                  </p>
                )}
              </div>

              {displayMeals.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[32px] mb-2">🍽️</p>
                  <p className="text-white/25 text-[14px]">לא נרשמו ארוחות ביום זה</p>
                </div>
              ) : displayMeals.map(meal => (
                <div key={meal.id} className="border-b border-white/[0.04] last:border-0">
                  <div className="px-5 py-3 flex items-center gap-2">
                    <span className="text-[16px]">{getMealEmoji(meal.mealType)}</span>
                    <p className="text-[13px] font-semibold text-white/60">{MEAL_HE[meal.mealType]}</p>
                  </div>
                  {meal.foods.map(food => (
                    <div key={food.id} className="flex items-center justify-between px-5 py-2.5" style={{background:'rgba(255,255,255,0.02)'}}>
                      <div>
                        <p className="text-[13px] text-white">{food.name}</p>
                        {food.amount && <p className="text-[11px] text-white/28 mt-0.5">{food.amount}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-white">{Math.round(food.calories)}</p>
                        <p className="text-[11px] text-white/30">{Math.round(food.protein)}g P</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
