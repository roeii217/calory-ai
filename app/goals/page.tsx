'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ProgressRing from '@/components/ProgressRing';
import { useAppStore } from '@/lib/store';

const PRESETS = [
  { label:'ירידה במשקל', emoji:'🔥', calories:1500, protein:130, carbs:150, fat:50, desc:'גירעון קלורי עם חלבון גבוה' },
  { label:'תחזוקה', emoji:'⚖️', calories:2000, protein:150, carbs:250, fat:65, desc:'מאקרו מאוזן לשמירה' },
  { label:'עלייה בשרירים', emoji:'💪', calories:2800, protein:200, carbs:350, fat:80, desc:'עודף קלורי, חלבון גבוה' },
  { label:'ספורטאי', emoji:'⚡', calories:3200, protein:220, carbs:420, fat:90, desc:'דלק לביצועים גבוהים' },
];

export default function GoalsPage() {
  const { goals, setGoals, getTodaysTotals } = useAppStore();
  const [localGoals, setLocalGoals] = useState(goals);
  const [saved, setSaved] = useState(false);
  const totals = getTodaysTotals();

  const handleSave = () => {
    setGoals(localGoals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const macroGoals = [
    { key:'calories' as const, label:'קלוריות', emoji:'🔥', unit:'kcal', color:'#FFFFFF', min:1000, max:5000, step:50 },
    { key:'protein'  as const, label:'חלבון',   emoji:'💪', unit:'g',    color:'#60a5fa', min:50,   max:400,  step:5  },
    { key:'carbs'    as const, label:'פחמימות', emoji:'🌾', unit:'g',    color:'#fb923c', min:50,   max:600,  step:5  },
    { key:'fat'      as const, label:'שומן',    emoji:'🥑', unit:'g',    color:'#a78bfa', min:20,   max:200,  step:5  },
  ];

  return (
    <div className="min-h-screen bg-black pb-36 dir-rtl" dir="rtl">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full opacity-[0.04]"
          style={{background:'radial-gradient(circle, rgba(167,139,250,0.8) 0%, transparent 70%)'}} />
      </div>

      <div className="relative z-10 px-4 pt-16">
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-5">
          <h1 className="text-[26px] font-black tracking-tight">יעדים</h1>
          <p className="text-white/35 text-[13px] mt-0.5">הגדר יעדי תזונה יומיים</p>
        </motion.div>

        {/* Today progress */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
          className="liquid-glass-card rounded-[24px] p-5 mb-3">
          <p className="text-[11px] text-white/35 tracking-wider mb-4">התקדמות היום</p>
          <div className="flex items-center justify-around">
            {[
              {label:'קלוריות', current:totals.calories, goal:localGoals.calories, color:'#FFFFFF'},
              {label:'חלבון',   current:totals.protein,  goal:localGoals.protein,  color:'#60a5fa'},
              {label:'פחמימות',current:totals.carbs,    goal:localGoals.carbs,    color:'#fb923c'},
              {label:'שומן',   current:totals.fat,      goal:localGoals.fat,      color:'#a78bfa'},
            ].map((m,i) => (
              <motion.div key={m.label} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:i*0.07}}
                className="flex flex-col items-center gap-2">
                <ProgressRing size={58} strokeWidth={4} progress={(m.current/m.goal)*100} color={m.color}>
                  <span className="text-[10px] font-black">{Math.round((m.current/m.goal)*100)}%</span>
                </ProgressRing>
                <p className="text-[11px] text-white/45">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Presets */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="liquid-glass-card rounded-[24px] p-4 mb-3">
          <p className="text-[11px] text-white/35 tracking-wider mb-3">פריסטים מהירים</p>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESETS.map(preset => {
              const isActive = localGoals.calories===preset.calories && localGoals.protein===preset.protein;
              return (
                <motion.button key={preset.label} whileTap={{scale:0.96}}
                  onClick={() => setLocalGoals({calories:preset.calories,protein:preset.protein,carbs:preset.carbs,fat:preset.fat})}
                  className={`text-right p-4 rounded-[20px] border transition-all ${
                    isActive ? 'bg-white text-black border-white' : 'border-white/8 text-white hover:border-white/20'
                  }`} style={isActive?{}:{background:'rgba(255,255,255,0.04)'}}>
                  <p className="text-[20px] mb-1.5">{preset.emoji}</p>
                  <p className="font-bold text-[14px]">{preset.label}</p>
                  <p className={`text-[12px] mt-0.5 ${isActive?'text-black/50':'text-white/30'}`}>{preset.calories} קל׳</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Sliders */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          className="liquid-glass-card rounded-[24px] p-5 mb-3 space-y-6">
          <p className="text-[11px] text-white/35 tracking-wider">יעדים מותאמים אישית</p>
          {macroGoals.map(({key,label,emoji,unit,color,min,max,step}) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">{emoji}</span>
                  <span className="font-medium text-[14px] text-white">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="number" value={localGoals[key]}
                    onChange={e => setLocalGoals(p => ({...p,[key]:Number(e.target.value)}))}
                    className="w-20 text-right rounded-xl px-2 py-1.5 text-[14px] font-bold text-white border border-white/12 outline-none"
                    style={{background:'rgba(255,255,255,0.07)'}} />
                  <span className="text-[12px] text-white/38">{unit}</span>
                </div>
              </div>
              <input type="range" min={min} max={max} step={step} value={localGoals[key]}
                onChange={e => setLocalGoals(p => ({...p,[key]:Number(e.target.value)}))}
                style={{background:`linear-gradient(to right, ${color} 0%, ${color} ${((localGoals[key]-min)/(max-min))*100}%, rgba(255,255,255,0.1) ${((localGoals[key]-min)/(max-min))*100}%, rgba(255,255,255,0.1) 100%)`}}
              />
            </div>
          ))}
        </motion.div>

        {/* Macro split */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="liquid-glass-card rounded-[24px] p-5 mb-4">
          <p className="text-[11px] text-white/35 tracking-wider mb-3">פיצול מאקרו</p>
          {[
            {label:'חלבון',   cals:localGoals.protein*4, color:'#60a5fa'},
            {label:'פחמימות', cals:localGoals.carbs*4,   color:'#fb923c'},
            {label:'שומן',    cals:localGoals.fat*9,     color:'#a78bfa'},
          ].map(m => {
            const pct = Math.round((m.cals/localGoals.calories)*100);
            return (
              <div key={m.label} className="flex items-center gap-3 mb-2.5 last:mb-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:m.color}} />
                <div className="flex-1">
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-white/55">{m.label}</span>
                    <span className="text-white/55">{pct}% · {m.cals} קל׳</span>
                  </div>
                  <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${Math.min(pct,100)}%`,background:m.color}} />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        <motion.button whileTap={{scale:0.97}} onClick={handleSave}
          className={`w-full py-4 rounded-[20px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-white text-black'
          }`}>
          {saved ? <><Check size={20}/> נשמר!</> : 'שמור יעדים'}
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
