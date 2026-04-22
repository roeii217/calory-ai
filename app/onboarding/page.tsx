'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '@/lib/auth-store';
import { useAppStore } from '@/lib/store';

interface OnboardingData {
  full_name: string;
  year_of_birth: number;
  height_cm: number;
  weight_kg: number;
  exercise_days_per_week: number;
  heard_from: string;
  tried_tracking_before: boolean | null;
  goal: 'lose' | 'maintain' | 'gain' | '';
  target_weight_kg: number;
  goal_speed: 'slow' | 'medium' | 'fast' | '';
}

function calcGoals(d: OnboardingData) {
  const age = new Date().getFullYear() - d.year_of_birth;
  const bmr = 10 * d.weight_kg + 6.25 * d.height_cm - 5 * age;
  const m = d.exercise_days_per_week <= 1 ? 1.2 : d.exercise_days_per_week <= 3 ? 1.375 : d.exercise_days_per_week <= 5 ? 1.55 : 1.725;
  const tdee = Math.round(bmr * m);
  const delta = d.goal_speed === 'slow' ? 250 : d.goal_speed === 'fast' ? 750 : 500;
  const cal = d.goal === 'lose' ? tdee - delta : d.goal === 'gain' ? tdee + delta : tdee;
  return { daily_calorie_goal: Math.max(cal, 1200), daily_protein_goal: Math.round(d.weight_kg * 1.8) };
}

const OptionBtn = ({ selected, onClick, emoji, label, desc }: any) => (
  <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-[22px] text-right transition-all"
    style={selected
      ? { background: 'var(--accent)', color: 'var(--accentfg)', border: '2px solid var(--accent)' }
      : { background: 'rgba(128,128,128,0.08)', color: 'var(--text)', border: '1px solid var(--border)' }}>
    {emoji && <span className="text-[28px] flex-shrink-0">{emoji}</span>}
    <div className="flex-1 text-right">
      <p className="font-bold text-[15px]">{label}</p>
      {desc && <p className="text-[12px] mt-0.5 opacity-55">{desc}</p>}
    </div>
    {selected && <Check size={18} className="flex-shrink-0" />}
  </motion.button>
);

const SliderCard = ({ emoji, label, value, min, max, unit, onChange }: any) => (
  <div className="rounded-[22px] p-5" style={{ background: 'rgba(128,128,128,0.08)', border: '1px solid var(--border)' }}>
    <div className="flex items-center justify-between mb-4">
      <p className="text-[14px] font-medium" style={{ color: 'var(--text2)' }}>{emoji} {label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-[32px] font-black tabular-nums" style={{ color: 'var(--text)' }}>{value}</span>
        <span className="text-[13px]" style={{ color: 'var(--text3)' }}>{unit}</span>
      </div>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} className="w-full" />
    <div className="flex justify-between mt-1">
      <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{min}</span>
      <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{max}</span>
    </div>
  </div>
);

function OnboardingContent() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    full_name: '', year_of_birth: 2000, height_cm: 170, weight_kg: 70,
    exercise_days_per_week: 3, heard_from: '', tried_tracking_before: null,
    goal: '', target_weight_kg: 65, goal_speed: '',
  });
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  const { setGoals } = useAppStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams?.get('guest') === 'true';

  useEffect(() => {
    const name = user?.displayName;
    if (name) setData(p => ({ ...p, full_name: name }));
  }, [user]);

  const u = (k: keyof OnboardingData, v: any) => setData(p => ({ ...p, [k]: v }));

  const currentYear = new Date().getFullYear();

  const steps = [
    {
      title: 'שלום! מה שמך?',
      subtitle: 'נתאים את האפליקציה עבורך',
      valid: data.full_name.trim().length > 1,
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-[36px] font-black"
            style={{ background: 'var(--card)', border: '2px solid var(--border)' }}>
            {data.full_name?.[0]?.toUpperCase() || '👤'}
          </div>
          <input value={data.full_name} onChange={e => u('full_name', e.target.value)}
            placeholder="הכנס את שמך"
            className="w-full text-center text-[22px] font-bold bg-transparent outline-none placeholder-opacity-30 border-b-2 pb-3"
            style={{ color: 'var(--text)', borderColor: 'var(--border)', direction: 'rtl' }}
            autoFocus />
          <p className="text-[13px]" style={{ color: 'var(--text3)' }}>השם שלך לא יוצג לאחרים</p>
        </div>
      ),
    },
    {
      title: 'מתי נולדת?',
      subtitle: 'לחישוב הצרכים הקלוריים שלך',
      valid: true,
      content: (
        <div className="space-y-6">
          <SliderCard emoji="🎂" label="שנת לידה" value={data.year_of_birth}
            min={1940} max={currentYear - 10} unit=""
            onChange={(v: number) => u('year_of_birth', v)} />
          <div className="rounded-[20px] p-4 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>הגיל שלך</p>
            <p className="text-[48px] font-black" style={{ color: 'var(--text)' }}>{currentYear - data.year_of_birth}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'גובה ומשקל',
      subtitle: 'לחישוב BMI ויעדים מדויקים',
      valid: true,
      content: (
        <div className="space-y-4">
          <SliderCard emoji="📏" label="גובה" value={data.height_cm} min={140} max={220} unit='ס"מ' onChange={(v: number) => u('height_cm', v)} />
          <SliderCard emoji="⚖️" label="משקל" value={data.weight_kg} min={30} max={250} unit='ק"ג' onChange={(v: number) => u('weight_kg', v)} />
          {(() => {
            const bmi = data.weight_kg / ((data.height_cm / 100) ** 2);
            const label = bmi < 18.5 ? 'תת משקל' : bmi < 25 ? 'תקין ✓' : bmi < 30 ? 'עודף משקל' : 'השמנה';
            const color = bmi < 18.5 ? '#60a5fa' : bmi < 25 ? '#30d158' : bmi < 30 ? '#fb923c' : '#f87171';
            return (
              <div className="rounded-[18px] p-3.5 flex items-center justify-between"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <span className="text-[13px]" style={{ color: 'var(--text2)' }}>BMI: {bmi.toFixed(1)}</span>
                <span className="text-[13px] font-bold" style={{ color }}>{label}</span>
              </div>
            );
          })()}
        </div>
      ),
    },
    {
      title: 'כמה פעמים בשבוע אתה מתאמן?',
      subtitle: 'משפיע על חישוב הקלוריות היומיות',
      valid: true,
      content: (
        <div className="space-y-3">
          {[
            { n: 0, label: 'בכלל לא', desc: 'אורח חיים יושבני', emoji: '🛋️' },
            { n: 2, label: '1-2 פעמים', desc: 'פעילות קלה', emoji: '🚶' },
            { n: 3, label: '3-4 פעמים', desc: 'פעילות בינונית', emoji: '🏃' },
            { n: 5, label: '5-6 פעמים', desc: 'פעילות גבוהה', emoji: '💪' },
            { n: 7, label: 'כל יום', desc: 'ספורטאי', emoji: '🏋️' },
          ].map(opt => (
            <OptionBtn key={opt.n}
              selected={data.exercise_days_per_week === opt.n}
              onClick={() => u('exercise_days_per_week', opt.n)}
              emoji={opt.emoji} label={opt.label} desc={opt.desc} />
          ))}
        </div>
      ),
    },
    {
      title: 'מה המטרה שלך?',
      subtitle: '',
      valid: data.goal !== '',
      content: (
        <div className="space-y-3">
          <OptionBtn selected={data.goal === 'lose'} onClick={() => u('goal', 'lose')} emoji="🔥" label="ירידה במשקל" desc="לרדת במשקל בצורה בריאה ומאוזנת" />
          <OptionBtn selected={data.goal === 'maintain'} onClick={() => u('goal', 'maintain')} emoji="⚖️" label="שמירה על משקל" desc="לשמור על המשקל הנוכחי" />
          <OptionBtn selected={data.goal === 'gain'} onClick={() => u('goal', 'gain')} emoji="💪" label="עלייה בשרירים" desc="לבנות שרירים ולעלות במשקל" />
        </div>
      ),
    },
    {
      title: 'מה משקל היעד שלך?',
      subtitle: `משקל נוכחי: ${data.weight_kg} ק"ג`,
      valid: true,
      content: (
        <div className="space-y-4">
          <SliderCard emoji="🎯" label="משקל יעד" value={data.target_weight_kg} min={30} max={250} unit='ק"ג' onChange={(v: number) => u('target_weight_kg', v)} />
          <div className="rounded-[18px] p-4 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
              {data.goal === 'lose' ? 'לרדת' : data.goal === 'gain' ? 'לעלות' : 'לשמור על'}{' '}
              <span className="font-black text-[20px]" style={{ color: 'var(--text)' }}>
                {Math.abs(data.weight_kg - data.target_weight_kg)}
              </span>
              {' '}ק"ג
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'באיזה קצב?',
      subtitle: '',
      valid: data.goal_speed !== '',
      content: (
        <div className="space-y-3">
          <OptionBtn selected={data.goal_speed === 'slow'} onClick={() => u('goal_speed', 'slow')} emoji="🐢" label="איטי ובטוח" desc="~0.25 ק״ג בשבוע — הכי בריא לגוף" />
          <OptionBtn selected={data.goal_speed === 'medium'} onClick={() => u('goal_speed', 'medium')} emoji="🚶" label="בינוני" desc="~0.5 ק״ג בשבוע — מאוזן ויעיל" />
          <OptionBtn selected={data.goal_speed === 'fast'} onClick={() => u('goal_speed', 'fast')} emoji="🏃" label="מהיר" desc="~0.75 ק״ג בשבוע — דורש מאמץ" />
        </div>
      ),
    },
    {
      title: 'איך שמעת עלינו?',
      subtitle: '',
      valid: data.heard_from !== '',
      content: (
        <div className="grid grid-cols-2 gap-2.5">
          {['חבר/ה 👥', 'אינסטגרם 📸', 'טיקטוק 🎵', 'גוגל 🔍', 'App Store 📱', 'אחר ✨'].map(src => {
            const val = src.split(' ')[0];
            return (
              <motion.button key={src} whileTap={{ scale: 0.94 }} onClick={() => u('heard_from', val)}
                className="py-4 rounded-2xl font-medium text-[14px] transition-all"
                style={data.heard_from === val
                  ? { background: 'var(--accent)', color: 'var(--accentfg)' }
                  : { background: 'rgba(128,128,128,0.08)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                {src}
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: 'ניסית לעקוב אחר קלוריות בעבר?',
      subtitle: '',
      valid: data.tried_tracking_before !== null,
      content: (
        <div className="space-y-3">
          <OptionBtn selected={data.tried_tracking_before === true} onClick={() => u('tried_tracking_before', true)} emoji="✅" label="כן, ניסיתי בעבר" desc="אני מכיר את הרעיון" />
          <OptionBtn selected={data.tried_tracking_before === false} onClick={() => u('tried_tracking_before', false)} emoji="🆕" label="לא, פעם ראשונה" desc="חדש לגמרי בעולם המעקב" />
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const finish = async () => {
    setSaving(true);
    const goals = calcGoals(data);
    setGoals({ calories: goals.daily_calorie_goal, protein: goals.daily_protein_goal });
    localStorage.setItem('calorieai-onboarding-done', 'true');
    localStorage.setItem('calorieai-profile', JSON.stringify({ ...data, ...goals }));
    if (!isGuest && user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
           profile: { ...data, ...goals, onboarding_complete: true }
        }, { merge: true });
      } catch (e) {}
    }
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[430px] mx-auto" style={{ background: 'var(--bg)' }}>
      {/* Progress */}
      <div className="px-6 pt-14">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'var(--accent)' }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
          <span className="text-[12px] font-medium flex-shrink-0" style={{ color: 'var(--text3)' }}>
            {step + 1}/{steps.length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
            className="flex-1 flex flex-col">
            <div className="mb-6">
              <h1 className="text-[24px] font-black leading-tight" style={{ color: 'var(--text)' }}>{cur.title}</h1>
              {cur.subtitle && <p className="text-[13px] mt-1.5" style={{ color: 'var(--text3)' }}>{cur.subtitle}</p>}
            </div>
            <div className="flex-1 overflow-y-auto">{cur.content}</div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6 flex-shrink-0">
          {step > 0 && (
            <motion.button whileTap={{ scale: 0.94 }} onClick={() => setStep(s => s - 1)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <ChevronLeft size={20} style={{ color: 'var(--text)' }} />
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={step < steps.length - 1 ? () => setStep(s => s + 1) : finish}
            disabled={!cur.valid || saving}
            className="flex-1 py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-35"
            style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>
            {saving
              ? <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accentfg)', borderTopColor: 'transparent' }} />
              : step === steps.length - 1
                ? <><Check size={18} />בוא נתחיל! 🚀</>
                : <>המשך <ChevronRight size={18} /></>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
