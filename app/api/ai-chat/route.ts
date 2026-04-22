import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 });
  }
  const { messages, systemContext } = await request.json();
  try {
    const res = await client.messages.create({
      model: 'claude-opus-4-5', max_tokens: 1024,
      system: systemContext,
      messages: messages.slice(-10),
    });
    return NextResponse.json({ reply: (res.content[0] as any).text });
  } catch (err: any) {
    return NextResponse.json({ reply: 'Error: ' + err.message }, { status: 500 });
  }
}
