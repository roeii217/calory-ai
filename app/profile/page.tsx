'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut, Moon, Sun, Smartphone, Scale, Flame, Dumbbell, Check, AlertCircle, Target, RefreshCw, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useAuthStore } from '@/lib/auth-store';
import { useSettings } from '@/lib/settings-store';
import { useAppStore } from '@/lib/store';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { t } from '@/lib/i18n';

export default function ProfilePage() {
  const { user, signOut } = useAuthStore();
  const { lang, theme, setLang, setTheme } = useSettings();
  const { goals, setGoals } = useAppStore();
  const router = useRouter();
  const [showSignOut, setShowSignOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const localProfile = mounted ? (() => { try { return JSON.parse(localStorage.getItem('calorieai-profile') || 'null'); } catch { return null; } })() : null;
  const isGuest = mounted ? (!user && localStorage.getItem('calorieai-guest') === 'true') : false;

  const [localGoals, setLocalGoals] = useState({
    weight: 70, targetWeight: 65,
    calories: goals.calories, protein: goals.protein,
    goal: 'maintain',
  });

  useEffect(() => {
    if (!mounted) return;
    setLocalGoals({
      weight: localProfile?.weight_kg || 70,
      targetWeight: localProfile?.target_weight_kg || 65,
      calories: localProfile?.daily_calorie_goal || goals.calories,
      protein: localProfile?.daily_protein_goal || goals.protein,
      goal: localProfile?.goal || 'maintain',
    });
  }, [mounted, goals]);

  const displayName = localProfile?.full_name || user?.displayName || user?.email?.split('@')[0] || (isGuest ? 'אורח' : '');
  const displayEmail = user?.email || '';
  const avatarLetter = displayName?.[0]?.toUpperCase() || '?';

  const handleSave = async () => {
    setSaving(true);
    setGoals({ calories: localGoals.calories, protein: localGoals.protein });
    const existing = localProfile || {};
    const updatedProfile = { ...existing, weight_kg: localGoals.weight, target_weight_kg: localGoals.targetWeight, daily_calorie_goal: localGoals.calories, daily_protein_goal: localGoals.protein, goal: localGoals.goal, full_name: user?.displayName };
    localStorage.setItem('calorieai-profile', JSON.stringify(updatedProfile));
    
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          profile: updatedProfile,
        }, { merge: true });
      } catch (err) {
        console.error('Failed to save profile to cloud', err);
      }
    }
    
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => { if (user) await signOut(); router.replace('/login'); };
  const handleReset = () => {
    localStorage.removeItem('calorieai-guest');
    localStorage.removeItem('calorieai-onboarding-done');
    localStorage.removeItem('calorieai-profile');
    router.replace('/login');
  };

  // Smart number input — tap to edit, supports keyboard
  const NumField = ({ label, icon: Icon, value, onChange, unit, min = 0, max = 9999, step = 1 }: any) => {
    const [editing, setEditing] = useState(false);
    const [raw, setRaw] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
    useEffect(() => { if (!editing) setRaw(String(value)); }, [value, editing]);

    const commit = () => {
      const n = parseInt(raw);
      if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
      setEditing(false);
    };

    return (
      <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--input-bg)' }}>
          <Icon size={15} style={{ color: 'var(--text2)' }} />
        </div>
        <span className="flex-1 text-[14px] font-medium" style={{ color: 'var(--text)' }}>{label}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onChange(Math.max(min, value - step))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[20px] font-bold transition-all active:scale-90"
            style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>−</button>

          {editing ? (
            <input ref={inputRef} type="number" value={raw}
              onChange={e => setRaw(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === 'Enter' && commit()}
              className="w-16 text-center rounded-xl px-2 py-1 text-[15px] font-bold outline-none border"
              style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--accent)' }} />
          ) : (
            <button onClick={() => setEditing(true)}
              className="min-w-[48px] text-center px-2 py-1 rounded-xl text-[15px] font-bold"
              style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>
              {value}
            </button>
          )}

          <button onClick={() => onChange(Math.min(max, value + step))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[20px] font-bold transition-all active:scale-90"
            style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>+</button>

          <span className="text-[12px] w-8 text-right" style={{ color: 'var(--text3)' }}>{unit}</span>
        </div>
      </div>
    );
  };

  const Section = ({ title, children }: any) => (
    <div className="mb-4">
      {title && <p className="text-[11px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--text3)' }}>{title}</p>}
      <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen pb-nav" style={{ background: 'var(--bg)' }}>
      <div className="px-4 pt-16 pb-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-[26px] font-black" style={{ color: 'var(--text)' }}>{t('profile', lang)}</h1>
        </motion.div>

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-[24px] p-5 mb-4 flex items-center gap-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-[24px] font-black flex-shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>{avatarLetter}</div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[18px] truncate" style={{ color: 'var(--text)' }}>{displayName}</p>
            {displayEmail && <p className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--text2)' }}>{displayEmail}</p>}
            {user && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px]" style={{ color: 'var(--text3)' }}>מחובר עם Google</span>
              </div>
            )}
            {isGuest && <span className="text-[12px]" style={{ color: 'var(--text3)' }}>👤 אורח</span>}
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title={lang === 'he' ? 'גוף ויעדים' : 'Body & Goals'}>
            {/* Goal type */}
            <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-[13px] mb-2.5" style={{ color: 'var(--text2)' }}>מטרה</p>
              <div className="flex gap-2">
                {[{ v: 'lose', he: '🔥 ירידה', en: '🔥 Lose' }, { v: 'maintain', he: '⚖️ תחזוקה', en: '⚖️ Keep' }, { v: 'gain', he: '💪 עלייה', en: '💪 Gain' }].map(g => (
                  <button key={g.v} onClick={() => setLocalGoals(p => ({ ...p, goal: g.v }))}
                    className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all"
                    style={localGoals.goal === g.v ? { background: 'var(--accent)', color: 'var(--accentfg)' } : { background: 'var(--input-bg)', color: 'var(--text2)' }}>
                    {lang === 'he' ? g.he : g.en}
                  </button>
                ))}
              </div>
            </div>
            <NumField label="משקל נוכחי" icon={Scale} value={localGoals.weight} onChange={(v: number) => setLocalGoals(p => ({ ...p, weight: v }))} unit='ק"ג' min={30} max={300} />
            <NumField label="משקל יעד" icon={Target} value={localGoals.targetWeight} onChange={(v: number) => setLocalGoals(p => ({ ...p, targetWeight: v }))} unit='ק"ג' min={30} max={300} />
            <NumField label="יעד קלורי יומי" icon={Flame} value={localGoals.calories} onChange={(v: number) => setLocalGoals(p => ({ ...p, calories: v }))} unit={lang === 'he' ? 'קל׳' : 'cal'} min={1000} max={5000} step={50} />
            <div style={{ borderBottom: 'none' }}>
              <NumField label="יעד חלבון יומי" icon={Dumbbell} value={localGoals.protein} onChange={(v: number) => setLocalGoals(p => ({ ...p, protein: v }))} unit="g" min={50} max={400} step={5} />
            </div>
          </Section>

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-[18px] font-bold text-[15px] flex items-center justify-center gap-2 mb-4"
            style={{ background: saved ? '#30d158' : 'var(--accent)', color: saved ? '#fff' : 'var(--accentfg)' }}>
            {saved ? <><Check size={18} />נשמר!</> : saving
              ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accentfg)', borderTopColor: 'transparent' }} />
              : 'שמור שינויים'}
          </motion.button>

          {/* Language */}
          <Section title={t('language', lang)}>
            <div className="flex p-2 gap-2">
              {[{ v: 'he', label: 'עברית 🇮🇱' }, { v: 'en', label: 'English 🇺🇸' }].map(l => (
                <button key={l.v} onClick={() => setLang(l.v as any)}
                  className="flex-1 py-2.5 rounded-[14px] text-[14px] font-semibold flex items-center justify-center gap-1.5"
                  style={lang === l.v ? { background: 'var(--accent)', color: 'var(--accentfg)' } : { background: 'var(--input-bg)', color: 'var(--text2)' }}>
                  {lang === l.v && <Check size={13} />}{l.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Theme */}
          <Section title={t('theme', lang)}>
            <div className="flex p-2 gap-2">
              {[{ v: 'dark', l: t('dark', lang), I: Moon }, { v: 'light', l: t('light', lang), I: Sun }, { v: 'system', l: t('system', lang), I: Smartphone }].map(({ v, l, I }) => (
                <button key={v} onClick={() => setTheme(v as any)}
                  className="flex-1 py-2.5 rounded-[14px] text-[12px] font-medium flex flex-col items-center gap-1"
                  style={theme === v ? { background: 'var(--accent)', color: 'var(--accentfg)' } : { background: 'var(--input-bg)', color: 'var(--text2)' }}>
                  <I size={16} />{l}
                </button>
              ))}
            </div>
          </Section>

          {/* Account */}
          <Section title={lang === 'he' ? 'חשבון' : 'Account'}>
            {user ? (
              <button onClick={() => setShowSignOut(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,59,48,0.12)' }}>
                  <LogOut size={15} className="text-red-400" />
                </div>
                <span className="flex-1 text-[14px] font-medium text-red-400 text-right">התנתק</span>
                <ChevronRight size={15} className="text-red-300" />
              </button>
            ) : (
              <button onClick={handleReset}
                className="w-full flex items-center gap-3 px-4 py-3.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,149,0,0.12)' }}>
                  <RefreshCw size={15} style={{ color: '#ff9500' }} />
                </div>
                <span className="flex-1 text-[14px] font-medium text-right" style={{ color: '#ff9500' }}>אפס והתחל מחדש</span>
                <ChevronRight size={15} style={{ color: '#ff9500' }} />
              </button>
            )}
          </Section>

          <p className="text-center text-[12px] mt-1 mb-4" style={{ color: 'var(--text3)' }}>
            ✦ CREATED BY ROEI ✦
          </p>
        </motion.div>
      </div>

      {/* Sign out confirm */}
      <AnimatePresence>
        {showSignOut && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSignOut(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 max-w-[430px] mx-auto"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,59,48,0.12)' }}>
                  <AlertCircle size={22} className="text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-[16px]" style={{ color: 'var(--text)' }}>התנתק</p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text2)' }}>בטוח שתרצה להתנתק?</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSignOut(false)}
                  className="flex-1 py-3.5 rounded-[16px] font-semibold text-[15px]"
                  style={{ background: 'var(--input-bg)', color: 'var(--text)' }}>ביטול</button>
                <button onClick={handleSignOut}
                  className="flex-1 py-3.5 rounded-[16px] font-bold text-[15px] bg-red-500 text-white">התנתק</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
