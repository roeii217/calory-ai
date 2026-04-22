'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  { emoji:'🤖', title:'סריקת מנה עם AI', desc:'צלם כל מנה ו-AI יזהה את האוכל ויחשב קלוריות ומאקרו בשניות.' },
  { emoji:'📊', title:'עקוב כל יום', desc:'ראה סיכום יומי, מגמות שבועיות והישאר על המסלול עם היעדים שלך.' },
  { emoji:'🎯', title:'הגע ליעדים שלך', desc:'בחר פריסט או הגדר יעדים מותאמים אישית לקלוריות ומאקרו.' },
];

const KEY = 'calorieai-onboarded-v2';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const slide = slides[step];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else { localStorage.setItem(KEY, '1'); onComplete(); }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-between px-8 pt-16 pb-12 safe-bottom"
      dir="rtl">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{background:'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)'}} />

      <div className="w-full flex justify-end">
        <button onClick={() => { localStorage.setItem(KEY,'1'); onComplete(); }}
          className="text-white/28 text-[14px] font-medium">דלג</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
            transition={{duration:0.38,ease:[0.4,0,0.2,1]}}
            className="space-y-6 w-full">
            <div className="mx-auto w-28 h-28 rounded-[32px] flex items-center justify-center text-[58px] liquid-glass-card">
              {slide.emoji}
            </div>
            <div className="space-y-3">
              <h2 className="text-[30px] font-black tracking-tight">{slide.title}</h2>
              <p className="text-white/45 text-[16px] leading-relaxed max-w-xs mx-auto">{slide.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full space-y-5">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_,i) => (
            <motion.div key={i}
              animate={{width:i===step?24:8,opacity:i===step?1:0.28}} transition={{duration:0.3}}
              className="h-2 rounded-full bg-white" />
          ))}
        </div>
        <motion.button whileTap={{scale:0.97}} onClick={next}
          className="w-full py-4 rounded-[22px] bg-white text-black font-black text-[17px]">
          {step < slides.length-1 ? 'המשך' : 'בואו נתחיל 🚀'}
        </motion.button>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('calorieai-onboarded-v2')) setShowOnboarding(true);
  }, []);
  return { showOnboarding, setShowOnboarding };
}
