import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ reply: 'GEMINI_API_KEY not configured.' }, { status: 500 });
  }
  const { messages, systemContext } = await request.json();
  try {
    const prompt = systemContext + '\n\n' + messages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return NextResponse.json({ reply: response.text || '' });
  } catch (err: any) {
    return NextResponse.json({ reply: 'Error: ' + err.message }, { status: 500 });
  }
}
