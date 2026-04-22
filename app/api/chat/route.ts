import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured.' }, { status: 500 });
  }

  try {
    const { message, imageBase64, history, lang = 'he', userContext } = await request.json();
    
    let sysPrompt = `You are CalorieAI, an expert, encouraging nutrition and fitness coach. Keep it practical, empathetic, and concise.`;
    if (lang === 'he') sysPrompt += ` Respond in Hebrew.`;
    if (userContext) {
      sysPrompt += `\nUser stats: Goals: ${userContext.goals.calories}cal, ${userContext.goals.protein}g protein. Todays consumed: ${userContext.today.calories}cal, ${userContext.today.protein}g protein.`;
    }

    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({ inlineData: { data: imageBase64, mimeType: 'image/jpeg' } });
    }
    parts.push({ text: message });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: sysPrompt }] },
        { role: 'model', parts: [{ text: 'Understood.' }] },
        ...chatHistory,
        { role: 'user', parts }
      ],
    });

    return NextResponse.json({ reply: response.text });
  } catch (err: any) {
    console.error('Chat Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
