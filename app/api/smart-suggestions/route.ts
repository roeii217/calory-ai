import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ suggestions: [] });
  }
  const { totals, goals, lang = 'he' } = await request.json();
  const remainCal = goals.calories - totals.calories;
  const remainProt = goals.protein - totals.protein;

  const prompt = lang === 'he'
    ? `משתמש אכל היום: ${Math.round(totals.calories)} קלוריות, ${Math.round(totals.protein)}g חלבון. יעדים: ${goals.calories} קלוריות, ${goals.protein}g חלבון. תן 3 המלצות ארוחה קצרות ומעשיות. השב רק Json:
{"suggestions":[{"emoji":"🍗","title":"כותרת","desc":"תיאור קצר","calories":300,"protein":25}],"warning":"","tip":""}`
    : `User ate: ${Math.round(totals.calories)} cal, ${Math.round(totals.protein)}g protein. Goals: ${goals.calories} cal, ${goals.protein}g protein. Give 3 short meals. Reply strictly JSON:
{"suggestions":[{"emoji":"🍗","title":"title","desc":"short desc","calories":300,"protein":25}],"warning":"","tip":""}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return NextResponse.json(data.suggestions ? data : { suggestions: [] });
  } catch (err) {
    return NextResponse.json({ suggestions: [] });
  }
}
