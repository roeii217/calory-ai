'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ImageIcon, X, Loader2, Bot, User, Camera } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useSettings } from '@/lib/settings-store';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { dataURLToBase64 } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const SUGGESTIONS = {
  he: ['כמה קלוריות יש בפיצה?', 'מה לאכול לפני אימון?', 'תן לי תפריט יומי ל-2000 קל׳', 'כמה חלבון אני צריך ביום?'],
  en: ['How many calories in pizza?', 'What to eat before workout?', 'Give me a 2000 cal meal plan', 'How much protein do I need daily?'],
};

export default function AIPage() {
  const { lang } = useSettings();
  const { goals, getTodaysTotals } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const totals = getTodaysTotals();
  const localProfile = (() => { try { return JSON.parse(localStorage.getItem('calorieai-profile') || 'null'); } catch { return null; } })();
  const calGoal = localProfile?.daily_calorie_goal || goals.calories;
  const protGoal = localProfile?.daily_protein_goal || goals.protein;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const systemContext = lang === 'he'
    ? `אתה עוזר תזונה חכם בשם CalorieAI. 
הנתונים של המשתמש היום:
- קלוריות שאכל: ${Math.round(totals.calories)} מתוך יעד ${calGoal}
- חלבון: ${Math.round(totals.protein)}g מתוך יעד ${protGoal}g
- פחמימות: ${Math.round(totals.carbs)}g
- שומן: ${Math.round(totals.fat)}g
ענה תמיד בעברית. היה קצר, ידידותי ומועיל. אם נשאל על תמונה של אוכל - נתח אותה ותן ערכי תזונה.`
    : `You are a smart nutrition assistant named CalorieAI.
User's data today:
- Calories eaten: ${Math.round(totals.calories)} of ${calGoal} goal
- Protein: ${Math.round(totals.protein)}g of ${protGoal}g goal
- Carbs: ${Math.round(totals.carbs)}g
- Fat: ${Math.round(totals.fat)}g
Always reply in English. Be concise, friendly and helpful. If shown a food image, analyze it and provide nutrition values.`;

  const sendMessage = async (text?: string, img?: string) => {
    const content = text || input;
    if (!content.trim() && !img && !image) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      image: img || image || undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImage(null);
    setLoading(true);

    try {
      const msgContent: any[] = [];
      if (userMsg.image) {
        msgContent.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: userMsg.image.includes(',') ? userMsg.image.split(',')[1] : userMsg.image } });
      }
      if (content) msgContent.push({ type: 'text', text: content });

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({
          role: m.role,
          content: m.image
            ? [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: m.image.includes(',') ? m.image.split(',')[1] : m.image } }, { type: 'text', text: m.content }]
            : m.content,
        })), systemContext }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: data.reply || (lang === 'he' ? 'שגיאה, נסה שוב.' : 'Error, try again.') }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: lang === 'he' ? 'שגיאה בחיבור. נסה שוב.' : 'Connection error. Try again.' }]);
    }
    setLoading(false);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const isFirstMessage = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col pb-nav" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="px-5 pt-16 pb-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Bot size={20} style={{ color: 'var(--text)' }} />
        </div>
        <div>
          <h1 className="text-[20px] font-black" style={{ color: 'var(--text)' }}>
            {lang === 'he' ? 'עוזר תזונה AI' : 'AI Nutrition Coach'}
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--text3)' }}>
            {lang === 'he' ? `היום: ${Math.round(totals.calories)}/${calGoal} קל׳` : `Today: ${Math.round(totals.calories)}/${calGoal} cal`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3" style={{ paddingBottom: '160px' }}>

        {isFirstMessage && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] p-5 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-[28px] mb-2">🥗</p>
            <p className="font-bold text-[16px]" style={{ color: 'var(--text)' }}>
              {lang === 'he' ? 'שאל אותי כל שאלה על תזונה!' : 'Ask me anything about nutrition!'}
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text2)' }}>
              {lang === 'he' ? 'אפשר גם לשלוח תמונת אוכל לניתוח' : 'You can also send a food photo for analysis'}
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {SUGGESTIONS[lang].map(s => (
                <motion.button key={s} whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map(msg => (
          <motion.div key={msg.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{ background: msg.role === 'user' ? 'var(--accent)' : 'var(--card)', border: '1px solid var(--border)' }}>
              {msg.role === 'user'
                ? <User size={13} color="var(--accentfg)" />
                : <Bot size={13} style={{ color: 'var(--text)' }} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-[20px] px-4 py-3 ${msg.role === 'user' ? 'rounded-tr-[6px]' : 'rounded-tl-[6px]'}`}
              style={msg.role === 'user'
                ? { background: 'var(--accent)', color: 'var(--accentfg)' }
                : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {msg.image && (
                <img src={msg.image} alt="food" className="w-full rounded-xl mb-2 max-h-48 object-cover" />
              )}
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <Bot size={13} style={{ color: 'var(--text)' }} />
            </div>
            <div className="rounded-[20px] rounded-tl-[6px] px-4 py-3"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex gap-1 items-center h-5">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--text3)' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed above BottomNav */}
      <div className="fixed left-0 right-0 px-4 py-3 z-40"
        style={{ bottom: 'max(70px, calc(60px + env(safe-area-inset-bottom)))', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>

        {/* Image preview */}
        <AnimatePresence>
          {image && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="mb-2 relative inline-block">
              <img src={image} alt="preview" className="h-16 w-16 object-cover rounded-xl" />
              <button onClick={() => setImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--accent)' }}>
                <X size={11} color="var(--accentfg)" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 items-end">
          {/* Image buttons */}
          <div className="flex gap-1.5 flex-shrink-0 pb-1">
            <button onClick={() => cameraRef.current?.click()}
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <Camera size={17} style={{ color: 'var(--text2)' }} />
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <ImageIcon size={17} style={{ color: 'var(--text2)' }} />
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 flex items-end rounded-[18px] pr-2 pl-4 py-2.5 gap-2"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKey}
              placeholder={lang === 'he' ? 'שאל שאלה על תזונה...' : 'Ask a nutrition question...'}
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-[14px] leading-relaxed"
              style={{ color: 'var(--text)', maxHeight: '120px', direction: lang === 'he' ? 'rtl' : 'ltr' }} />
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage()} disabled={loading || (!input.trim() && !image)}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-35 transition-all"
              style={{ background: 'var(--accent)' }}>
              <Send size={15} color="var(--accentfg)" />
            </motion.button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
      </div>

      <BottomNav />
    </div>
  );
}
