'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Check, Loader2 } from 'lucide-react';
import { useAppStore, FoodItem, MealEntry } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { format } from 'date-fns';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  defaultDate?: string;
}

const MEAL_HE: Record<string, string> = { breakfast:'ארוחת בוקר', lunch:'צהריים', dinner:'ערב', snacks:'חטיפים' };

export default function AddFoodModal({ isOpen, onClose, mealType, defaultDate }: AddFoodModalProps) {
  const [tab, setTab] = useState<'search'|'manual'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [manual, setManual] = useState({ name:'', calories:'', protein:'', carbs:'', fat:'' });
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addMealEntry, meals } = useAppStore();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const date = defaultDate || format(new Date(), 'yyyy-MM-dd');

  const handleSearch = (q: string) => {
    setQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 1) { setResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-food?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
  };

  const handleAdd = async (food: Omit<FoodItem, 'id'>) => {
    setAdding(true);
    const foodItem: FoodItem = { ...food, id: generateId() };
    const existingMeal = meals.find(m => m.date===date && m.mealType===mealType);
    if (existingMeal) {
      useAppStore.getState().addFoodToMeal(existingMeal.id, foodItem);
    } else {
      addMealEntry({ id:generateId(), date, mealType, foods:[foodItem], timestamp:Date.now() });
    }
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setSelected(null); setQuery(''); setResults([]); setManual({name:'',calories:'',protein:'',carbs:'',fat:''}); onClose(); }, 900);
    setAdding(false);
  };

  const handleManualAdd = () => {
    if (!manual.name || !manual.calories) return;
    handleAdd({ name:manual.name, calories:Number(manual.calories), protein:Number(manual.protein)||0, carbs:Number(manual.carbs)||0, fat:Number(manual.fat)||0, source:'manual' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 modal-glass rounded-t-[32px] max-h-[90vh] overflow-hidden flex flex-col"
            initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
            transition={{type:'spring',damping:28,stiffness:300}}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-[18px] font-black">הוסף ל{MEAL_HE[mealType]}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-1.5 px-5 pb-3">
              {(['search','manual'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${tab===t?'bg-white text-black':'bg-white/8 text-white/55'}`}>
                  {t==='search' ? '🔍 חיפוש' : '✏️ ידני'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-10">
              {tab==='search' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={query} onChange={e => handleSearch(e.target.value)}
                      placeholder="חפש מזון בעברית או אנגלית..."
                      className="w-full rounded-[18px] pr-10 pl-4 py-3 text-[14px] text-white placeholder-white/28 outline-none"
                      style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.09)'}}
                      autoFocus dir="rtl" />
                    {searching && <Loader2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin text-white/35" />}
                  </div>

                  {selected ? (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                      className="rounded-[22px] p-4 space-y-4" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}>
                      <div className="flex items-start justify-between">
                        <div className="text-right">
                          <p className="font-bold text-[15px]">{selected.name}</p>
                          {selected.brand && <p className="text-[12px] text-white/38 mt-0.5">{selected.brand}</p>}
                          <p className="text-[11px] text-white/25 mt-0.5">לכל {selected.servingSize}</p>
                        </div>
                        <button onClick={() => setSelected(null)} className="text-white/35"><X size={16}/></button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[{l:'קלוריות',v:selected.calories,u:''},{l:'חלבון',v:selected.protein,u:'g'},{l:'פחמימות',v:selected.carbs,u:'g'},{l:'שומן',v:selected.fat,u:'g'}].map(m => (
                          <div key={m.l} className="rounded-xl p-2.5 text-center" style={{background:'rgba(255,255,255,0.05)'}}>
                            <p className="text-[13px] font-black">{m.v}{m.u}</p>
                            <p className="text-[10px] text-white/35 mt-0.5">{m.l}</p>
                          </div>
                        ))}
                      </div>
                      <motion.button whileTap={{scale:0.97}}
                        onClick={() => handleAdd({name:selected.name,calories:selected.calories,protein:selected.protein,carbs:selected.carbs,fat:selected.fat,source:'search',amount:selected.servingSize})}
                        disabled={adding||success}
                        className="w-full py-3.5 rounded-[18px] bg-white text-black font-bold flex items-center justify-center gap-2">
                        {success ? <><Check size={17}/>נוסף!</> : adding ? <Loader2 size={17} className="animate-spin"/> : <><Plus size={17}/>הוסף מזון</>}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {results.map((r,i) => (
                        <motion.button key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                          onClick={() => setSelected(r)}
                          className="w-full text-right rounded-[18px] px-4 py-3.5 flex items-center justify-between transition-all"
                          style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.07)'}}>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-white truncate">{r.name}</p>
                            {r.brand && <p className="text-[11px] text-white/35">{r.brand}</p>}
                          </div>
                          <div className="text-left mr-3 flex-shrink-0">
                            <p className="text-[14px] font-black text-white">{r.calories} קל׳</p>
                            <p className="text-[11px] text-white/35">{r.protein}g חלבון</p>
                          </div>
                        </motion.button>
                      ))}
                      {query.length > 0 && !searching && results.length === 0 && (
                        <p className="text-center text-white/25 text-[13px] py-8">לא נמצאו תוצאות — נסה כתיבה ידנית</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tab==='manual' && (
                <div className="space-y-3" dir="rtl">
                  <input type="text" placeholder="שם המזון *" value={manual.name}
                    onChange={e => setManual({...manual,name:e.target.value})}
                    className="w-full rounded-[18px] px-4 py-3 text-[14px] text-white placeholder-white/28 outline-none"
                    style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.09)'}} />
                  <div className="grid grid-cols-2 gap-2.5">
                    {[{key:'calories',label:'🔥 קלוריות *'},{key:'protein',label:'💪 חלבון (g)'},{key:'carbs',label:'🌾 פחמימות (g)'},{key:'fat',label:'🥑 שומן (g)'}].map(({key,label}) => (
                      <div key={key} className="rounded-[18px] p-3.5" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)'}}>
                        <p className="text-[11px] text-white/38 mb-1">{label}</p>
                        <input type="number" value={manual[key as keyof typeof manual]}
                          onChange={e => setManual({...manual,[key]:e.target.value})}
                          placeholder="0"
                          className="w-full bg-transparent text-white text-[15px] font-black outline-none placeholder-white/18" />
                      </div>
                    ))}
                  </div>
                  <motion.button whileTap={{scale:0.97}} onClick={handleManualAdd}
                    disabled={!manual.name||!manual.calories||adding||success}
                    className="w-full py-4 rounded-[20px] bg-white text-black font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40">
                    {success ? <><Check size={18}/>נוסף!</> : <><Plus size={18}/>הוסף מזון</>}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
