'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Zap, RotateCcw, Check, Loader2, Barcode, ImageIcon, ChevronDown, Plus, AlertCircle, SwitchCamera, FlashlightOff } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { dataURLToBase64, generateId } from '@/lib/utils';
import { useZxing } from 'react-zxing';
import { useAppStore, FoodItem } from '@/lib/store';
import { useSettings } from '@/lib/settings-store';
import { t } from '@/lib/i18n';
import { format } from 'date-fns';

type ScanMode = 'photo' | 'barcode';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export default function ScanPage() {
  const { lang } = useSettings();
  const [mode, setMode] = useState<ScanMode>('photo');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [barcodeResult, setBarcodeResult] = useState<any>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [barcodeStatus, setBarcodeStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [added, setAdded] = useState(false);

  // useZxing Hook handles Barcode stream internally
  const { ref: barcodeVideoRef } = useZxing({
    paused: !barcodeScanning,
    onResult(result) {
      const code = result.getText();
      stopBarcodeCamera();
      setBarcodeStatus((lang === 'he' ? 'זוהה: ' : 'Detected: ') + code);
      lookupBarcodeCode(code);
    },
    onError(error) {
       // Ignore constant frame decode failures
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { addMealEntry, meals } = useAppStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => () => { stopCamera(); stopBarcodeCamera(); }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const stopBarcodeCamera = useCallback(() => {
    setBarcodeScanning(false);
    setBarcodeStatus('');
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setError(err.name === 'NotAllowedError'
        ? (lang === 'he' ? 'הרשאת מצלמה נדחתה. אנא אפשר גישה בהגדרות.' : 'Camera permission denied. Allow in settings.')
        : (lang === 'he' ? 'לא ניתן לפתוח מצלמה.' : 'Cannot open camera.'));
    }
  };

  const startBarcodeCamera = async () => {
    stopBarcodeCamera();
    setError(null);
    setBarcodeResult(null);
    setBarcodeScanning(true);
    setBarcodeStatus(lang === 'he' ? 'כוון למצלמה לברקוד...' : 'Point camera at barcode...');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current; const c = canvasRef.current;
    c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
    c.getContext('2d')!.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.92);
    stopCamera();
    setCapturedImage(dataUrl);
    analyzeImage(dataUrl);
  };

  const analyzeImage = async (imageDataUrl: string) => {
    setAnalyzing(true); setError(null); setAnalysisResult(null);
    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataURLToBase64(imageDataUrl), mimeType: 'image/jpeg', lang }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysisResult(data);
    } catch (err: any) { setError(err.message || (lang === 'he' ? 'הניתוח נכשל.' : 'Analysis failed.')); }
    setAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const d = ev.target?.result as string; setCapturedImage(d); analyzeImage(d); };
    reader.readAsDataURL(file); e.target.value = '';
  };

  const lookupBarcodeCode = async (code: string) => {
    if (!code.trim()) return;
    setLookingUp(true); setError(null); setBarcodeResult(null);
    try {
      const res = await fetch(`/api/scan-barcode?barcode=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBarcodeResult(data);
    } catch (err: any) { setError(err.message || (lang === 'he' ? 'מוצר לא נמצא.' : 'Product not found.')); }
    setLookingUp(false);
  };

  const addToLog = (foods: FoodItem[]) => {
    const existing = meals.find(m => m.date === today && m.mealType === mealType);
    if (existing) foods.forEach(f => useAppStore.getState().addFoodToMeal(existing.id, f));
    else addMealEntry({ id: generateId(), date: today, mealType, foods, timestamp: Date.now() });
    setAdded(true);
    setTimeout(() => { setAdded(false); reset(); }, 1600);
  };

  const addAIResult = () => analysisResult && addToLog(analysisResult.foods.map((f: any) => ({
    id: generateId(), name: f.name, amount: f.amount,
    calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, source: 'ai' as const,
  })));

  const addBarcodeResult = () => barcodeResult && addToLog([{
    id: generateId(),
    name: barcodeResult.brand ? `${barcodeResult.name} — ${barcodeResult.brand}` : barcodeResult.name,
    amount: barcodeResult.servingSize,
    calories: barcodeResult.calories, protein: barcodeResult.protein,
    carbs: barcodeResult.carbs, fat: barcodeResult.fat, source: 'barcode' as const,
  }]);

  const reset = () => {
    stopCamera(); stopBarcodeCamera();
    setCapturedImage(null); setAnalysisResult(null);
    setBarcodeResult(null); setError(null); setBarcodeInput(''); setAdded(false);
  };

  const MEAL_LABELS: Record<MealType, string> = {
    breakfast: t('breakfast', lang), lunch: t('lunch', lang),
    dinner: t('dinner', lang), snacks: t('snacks', lang),
  };
  const MEAL_EMOJI: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };

  const MacroGrid = ({ cal, prot, carb, fat }: any) => (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {[{ l: t('calories', lang), v: Math.round(cal), u: '' }, { l: t('protein', lang), v: Math.round(prot), u: 'g' }, { l: t('carbs', lang), v: Math.round(carb), u: 'g' }, { l: t('fat', lang), v: Math.round(fat), u: 'g' }].map(m => (
        <div key={m.l} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--input-bg)' }}>
          <p className="text-[14px] font-black" style={{ color: 'var(--text)' }}>{m.v}{m.u}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>{m.l}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pb-nav" style={{ background: 'var(--bg)' }}>
      <div className="px-4 pt-16 pb-6">

        {/* Header + Meal Picker */}
        <div className="flex items-start justify-between mb-5">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[26px] font-black tracking-tight" style={{ color: 'var(--text)' }}>{t('scanFood', lang)}</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text2)' }}>{lang === 'he' ? 'זיהוי תזונה מבוסס AI' : 'AI-powered nutrition detection'}</p>
          </motion.div>
          <div className="relative">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowMealPicker(!showMealPicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <span className="text-[16px]">{MEAL_EMOJI[mealType]}</span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{MEAL_LABELS[mealType]}</span>
              <ChevronDown size={13} style={{ color: 'var(--text3)' }} />
            </motion.button>
            <AnimatePresence>
              {showMealPicker && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 min-w-[160px]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
                    <button key={m} onClick={() => { setMealType(m); setShowMealPicker(false); }}
                      className="w-full text-right px-4 py-3 flex items-center gap-2.5 text-[13px] transition-colors"
                      style={{ color: m === mealType ? 'var(--text)' : 'var(--text2)', fontWeight: m === mealType ? 600 : 400, background: m === mealType ? 'var(--input-bg)' : 'transparent' }}>
                      <span>{MEAL_EMOJI[m]}</span><span>{MEAL_LABELS[m]}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: 'var(--input-bg)' }}>
          {(['photo', 'barcode'] as ScanMode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); reset(); }}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={mode === m ? { background: 'var(--accent)', color: 'var(--accentfg)' } : { background: 'transparent', color: 'var(--text2)' }}>
              {m === 'photo' ? <><Camera size={15} />{t('aiPhoto', lang)}</> : <><Barcode size={15} />{t('barcode', lang)}</>}
            </button>
          ))}
        </div>

        {/* ── PHOTO MODE ── */}
        {mode === 'photo' && !capturedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="relative rounded-[28px] overflow-hidden"
              style={{ aspectRatio: '4/3', background: 'var(--card)', border: '1px solid var(--border)' }}>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted
                style={{ display: cameraActive ? 'block' : 'none' }} />
              {cameraActive && (
                <>
                  <div className="scan-corner-tl" /><div className="scan-corner-tr" />
                  <div className="scan-corner-bl" /><div className="scan-corner-br" />
                  <div className="scan-line" />
                  <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-[12px] px-3 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    {lang === 'he' ? 'כוון למנה שלך' : 'Aim at your meal'}
                  </p>
                  <button onClick={() => { const n = facingMode === 'environment' ? 'user' : 'environment'; setFacingMode(n); startCamera(n); }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <SwitchCamera size={18} className="text-white" />
                  </button>
                </>
              )}
              {!cameraActive && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Camera size={36} style={{ color: 'var(--text3)' }} />
                  <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
                    {lang === 'he' ? 'מצלמה לא פעילה' : 'Camera inactive'}
                  </p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="space-y-2.5">
              {!cameraActive
                ? <motion.button whileTap={{ scale: 0.97 }} onClick={() => startCamera()}
                    className="w-full py-4 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2"
                    style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>
                    <Camera size={19} /> {t('openCamera', lang)}
                  </motion.button>
                : <motion.button whileTap={{ scale: 0.97 }} onClick={capturePhoto}
                    className="w-full py-4 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2"
                    style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>
                    <Zap size={19} /> {t('captureAnalyze', lang)}
                  </motion.button>
              }
              <div className="grid grid-cols-2 gap-2.5">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileInputRef.current?.click()}
                  className="py-3.5 rounded-[18px] text-[14px] font-medium flex items-center justify-center gap-2"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <ImageIcon size={15} /> {t('uploadPhoto', lang)}
                </motion.button>
                {cameraActive && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={stopCamera}
                    className="py-3.5 rounded-[18px] text-[14px] font-medium flex items-center justify-center gap-2"
                    style={{ background: 'var(--input-bg)', color: 'var(--text2)' }}>
                    <X size={15} /> {lang === 'he' ? 'בטל' : 'Cancel'}
                  </motion.button>
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </motion.div>
        )}

        {/* Captured Image */}
        {mode === 'photo' && capturedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="relative rounded-[28px] overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img src={capturedImage} alt="meal" className="w-full h-full object-cover" />
              {analyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: 'rgba(0,0,0,0.65)' }}>
                  <Loader2 size={36} className="animate-spin text-white" />
                  <p className="text-white font-bold text-[16px]">{t('analyzing', lang)}</p>
                </div>
              )}
            </div>
            <button onClick={reset} className="w-full py-2.5 flex items-center justify-center gap-2 text-[13px]"
              style={{ color: 'var(--text3)' }}>
              <RotateCcw size={14} /> {t('scanAgain', lang)}
            </button>
          </motion.div>
        )}

        {/* ── BARCODE MODE ── */}
        {mode === 'barcode' && !barcodeResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Barcode Camera */}
            <div className="relative rounded-[28px] overflow-hidden"
              style={{ aspectRatio: '4/3', background: 'var(--card)', border: '1px solid var(--border)' }}>
              <video ref={barcodeVideoRef} className="w-full h-full object-cover" playsInline muted
                style={{ display: barcodeScanning ? 'block' : 'none' }} />
              {barcodeScanning && (
                <>
                  {/* Barcode scan frame */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4/5 h-1/3 border-2 border-white/80 rounded-xl relative overflow-hidden">
                      <div className="scan-line" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <p className="text-white/80 text-[12px] px-3 py-1.5 rounded-full text-center"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      {barcodeStatus}
                    </p>
                  </div>
                  <button onClick={stopBarcodeCamera}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <X size={18} className="text-white" />
                  </button>
                </>
              )}
              {!barcodeScanning && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Barcode size={36} style={{ color: 'var(--text3)' }} />
                  <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                    {lang === 'he' ? 'סרוק ברקוד מוצר' : 'Scan product barcode'}
                  </p>
                </div>
              )}
            </div>
            <canvas ref={barcodeCanvasRef} className="hidden" />

            {!barcodeScanning && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={startBarcodeCamera}
                className="w-full py-4 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>
                <Camera size={19} /> {t('scanBarcode', lang)}
              </motion.button>
            )}

            {/* Manual barcode input */}
            <div className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] mb-3" style={{ color: 'var(--text2)' }}>
                {lang === 'he' ? 'או הזן ברקוד ידנית:' : 'Or enter barcode manually:'}
              </p>
              <div className="flex gap-2.5">
                <input type="number" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)}
                  placeholder={t('barcodeNum', lang)}
                  className="flex-1 rounded-[16px] px-4 py-3 text-[14px] outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', direction: 'ltr' }}
                  onKeyDown={e => e.key === 'Enter' && lookupBarcodeCode(barcodeInput)} />
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => lookupBarcodeCode(barcodeInput)}
                  disabled={lookingUp || !barcodeInput}
                  className="px-4 py-3 rounded-[16px] font-bold text-[14px] disabled:opacity-40 flex items-center gap-2"
                  style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>
                  {lookingUp ? <Loader2 size={16} className="animate-spin" /> : lang === 'he' ? 'חפש' : 'Search'}
                </motion.button>
              </div>
              <p className="text-[11px] mt-2" style={{ color: 'var(--text3)' }}>
                {lang === 'he' ? 'לדוגמה: 7290000066518 (במבה)' : 'e.g. 5449000000996 (Coca-Cola)'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 rounded-[20px] p-4 flex items-start gap-3"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-[14px] font-medium">{error}</p>
                <button onClick={reset} className="text-[12px] mt-1 underline" style={{ color: 'var(--text3)' }}>
                  {lang === 'he' ? 'נסה שוב' : 'Try again'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Result */}
        <AnimatePresence>
          {analysisResult && !added && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
              <div className="rounded-[28px] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[17px]" style={{ color: 'var(--text)' }}>{t('detectedFoods', lang)}</h3>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${analysisResult.confidence === 'high' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                    {analysisResult.confidence === 'high' ? t('highConf', lang) : t('medConf', lang)}
                  </span>
                </div>
                {analysisResult.foods?.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{f.name}</p>
                      {f.amount && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text3)' }}>{f.amount}</p>}
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>{Math.round(f.calories)} {lang === 'he' ? 'קל׳' : 'cal'}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text3)' }}>{Math.round(f.protein)}g P</p>
                    </div>
                  </div>
                ))}
                <MacroGrid cal={analysisResult.totalCalories} prot={analysisResult.totalProtein} carb={analysisResult.totalCarbs} fat={analysisResult.totalFat} />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={addAIResult}
                className="w-full py-4 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>
                <Plus size={19} /> {t('addToMeal', lang)} ({MEAL_LABELS[mealType]})
              </motion.button>
              <button onClick={reset} className="w-full py-2 flex items-center justify-center gap-2 text-[13px]"
                style={{ color: 'var(--text3)' }}>
                <RotateCcw size={13} /> {t('scanAgain', lang)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barcode Result */}
        <AnimatePresence>
          {barcodeResult && !lookingUp && !added && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
              <div className="rounded-[28px] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text3)' }}>{t('productFound', lang)}</p>
                <h3 className="font-black text-[20px] leading-tight" style={{ color: 'var(--text)' }}>{barcodeResult.name}</h3>
                {barcodeResult.brand && <p className="text-[14px] mt-0.5" style={{ color: 'var(--text2)' }}>{barcodeResult.brand}</p>}
                <p className="text-[12px] mt-1" style={{ color: 'var(--text3)' }}>{lang === 'he' ? 'לכל' : 'Per'} {barcodeResult.servingSize}</p>
                <MacroGrid cal={barcodeResult.calories} prot={barcodeResult.protein} carb={barcodeResult.carbs} fat={barcodeResult.fat} />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={addBarcodeResult}
                className="w-full py-4 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', color: 'var(--accentfg)' }}>
                <Plus size={19} /> {t('addToMeal', lang)} ({MEAL_LABELS[mealType]})
              </motion.button>
              <button onClick={reset} className="w-full py-2 text-[13px]" style={{ color: 'var(--text3)' }}>
                {lang === 'he' ? 'סרוק מוצר אחר' : 'Scan another product'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {added && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="mt-4 rounded-[24px] p-6 flex flex-col items-center gap-3"
              style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.2)' }}>
                <Check size={28} className="text-emerald-400" />
              </motion.div>
              <p className="text-emerald-400 font-bold text-[16px]">{t('addedSuccess', lang)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
