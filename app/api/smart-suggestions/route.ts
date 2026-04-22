import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ suggestions: [] });
  }
  const { totals, goals, lang = 'he' } = await request.json();
  const remainCal = goals.calories - totals.calories;
  const remainProt = goals.protein - totals.protein;

  const prompt = lang === 'he'
    ? `משתמש אכל היום: ${Math.round(totals.calories)} קלוריות, ${Math.round(totals.protein)}g חלבון.
יעדים: ${goals.calories} קלוריות, ${goals.protein}g חלבון.
נשאר: ${Math.round(remainCal)} קלוריות, ${Math.round(remainProt)}g חלבון.
תן 3 המלצות ארוחה קצרות ומעשיות. השב JSON בלבד:
{"suggestions":[{"emoji":"🍗","title":"כותרת","desc":"תיאור קצר","calories":300,"protein":25}],"warning":"","tip":""}`
    : `User ate today: ${Math.round(totals.calories)} cal, ${Math.round(totals.protein)}g protein.
Goals: ${goals.calories} cal, ${goals.protein}g protein.
Remaining: ${Math.round(remainCal)} cal, ${Math.round(remainProt)}g protein.
Give 3 short practical meal suggestions. Reply JSON only:
{"suggestions":[{"emoji":"🍗","title":"title","desc":"short desc","calories":300,"protein":25}],"warning":"","tip":""}`;

  try {
    const res = await client.messages.create({
      model: 'claude-opus-4-5', max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = (res.content[0] as any).text;
    const match = text.match(/\{[\s\S]*\}/);
    return NextResponse.json(match ? JSON.parse(match[0]) : { suggestions: [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
