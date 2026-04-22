import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured.' }, { status: 500 });
  }
  
  try {
    const { imageBase64, mimeType = 'image/jpeg', lang = 'he', userGoals } = await request.json();
    if (!imageBase64) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const goalsCtx = userGoals ? `\nUser goals: ${userGoals.calories} cal, ${userGoals.protein}g protein.` : '';
    const prompt = lang === 'he'
      ? `נתח את האוכל שבתמונה. דייק בכמויות (גרמים) לפי מה שאתה רואה. חשב קלוריות, חלבון, פחמימות ושומן. החזר פלט כ-JSON טהור שמתאים למבנה הבא:${goalsCtx}\n{"foods":[{"name":"שם בעברית","amount":"150g","calories":0,"protein":0,"carbs":0,"fat":0}],"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0,"confidence":"high|medium","notes":"הערות בעברית","suggestions":"הצעות"}`
      : `Analyze food image. Accurately estimate grams. Reply JSON only:${goalsCtx}\n{"foods":[{"name":"name","amount":"150g","calories":0,"protein":0,"carbs":0,"fat":0}],"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0,"confidence":"high|medium","notes":"","suggestions":""}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: imageBase64, mimeType } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) throw new Error('No JSON');
    try {
      return NextResponse.json(JSON.parse(response.text));
    } catch {
      const match = response.text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON');
      return NextResponse.json(JSON.parse(match[0]));
    }
  } catch (err: any) {
    console.error('Analyze Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
