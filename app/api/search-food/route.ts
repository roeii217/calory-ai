import { NextRequest, NextResponse } from 'next/server';

const ISRAELI_FOODS = [
  { name: 'חזה עוף', brand: '', servingSize: '150g', calories: 248, protein: 46, carbs: 0, fat: 5.5 },
  { name: 'ביצה', brand: '', servingSize: '1 יחידה', calories: 78, protein: 6, carbs: 0.5, fat: 5.5 },
  { name: 'קוטג׳ 5%', brand: 'תנובה', servingSize: '250g', calories: 245, protein: 27.5, carbs: 7.5, fat: 12.5 },
  { name: 'יוגורט יווני', brand: '', servingSize: '200g', calories: 118, protein: 20, carbs: 7, fat: 1.2 },
  { name: 'אורז לבן מבושל', brand: '', servingSize: '100g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'פיתה', brand: '', servingSize: '1 יחידה', calories: 160, protein: 5, carbs: 33, fat: 1 },
  { name: 'לחם מחיטה מלאה', brand: '', servingSize: '2 פרוסות', calories: 140, protein: 5, carbs: 28, fat: 1.5 },
  { name: 'שיבולת שועל', brand: '', servingSize: '80g', calories: 293, protein: 10, carbs: 52, fat: 5.5 },
  { name: 'בננה', brand: '', servingSize: '1 בינונית', calories: 107, protein: 1.3, carbs: 27.5, fat: 0.4 },
  { name: 'תפוח', brand: '', servingSize: '1 בינוני', calories: 78, protein: 0.5, carbs: 20, fat: 0.2 },
  { name: 'אבוקדו', brand: '', servingSize: '½ פרי', calories: 112, protein: 1.5, carbs: 6, fat: 10.5 },
  { name: 'שקדים', brand: '', servingSize: '30g', calories: 174, protein: 6, carbs: 6.5, fat: 15 },
  { name: 'טונה במים', brand: 'ים', servingSize: '1 קופסה', calories: 100, protein: 22, carbs: 0, fat: 1 },
  { name: 'סלמון אפוי', brand: '', servingSize: '150g', calories: 312, protein: 30, carbs: 0, fat: 20 },
  { name: 'חומוס טבעי', brand: '', servingSize: '100g', calories: 170, protein: 8, carbs: 20, fat: 8 },
  { name: 'טחינה גולמית', brand: '', servingSize: '2 כפות', calories: 177, protein: 5, carbs: 6.5, fat: 16 },
  { name: 'גבינה צהובה', brand: '', servingSize: '30g', calories: 105, protein: 7, carbs: 0.5, fat: 8.5 },
  { name: 'חלב 3%', brand: 'תנובה', servingSize: '250ml', calories: 150, protein: 8.8, carbs: 12, fat: 7.5 },
  { name: 'שוקולד מריר 70%', brand: '', servingSize: '30g', calories: 160, protein: 2.5, carbs: 14, fat: 12 },
  { name: 'בטטה', brand: '', servingSize: '100g', calories: 103, protein: 2.3, carbs: 24, fat: 0.1 },
  { name: 'פלאפל', brand: '', servingSize: '5 כדורים', calories: 333, protein: 13, carbs: 31, fat: 18 },
  { name: 'שאורמה עוף', brand: '', servingSize: '200g', calories: 380, protein: 34, carbs: 28, fat: 14 },
  { name: 'שקשוקה', brand: '', servingSize: '300g', calories: 280, protein: 14, carbs: 18, fat: 16 },
  { name: 'עדשים מבושלות', brand: '', servingSize: '100g', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: 'גרנולה', brand: '', servingSize: '60g', calories: 248, protein: 5.5, carbs: 38, fat: 9 },
  { name: 'pasta', brand: '', servingSize: '100g cooked', calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  { name: 'chicken breast', brand: '', servingSize: '150g', calories: 248, protein: 46, carbs: 0, fat: 5.5 },
  { name: 'rice', brand: '', servingSize: '100g cooked', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'egg', brand: '', servingSize: '1 large', calories: 78, protein: 6, carbs: 0.5, fat: 5.5 },
  { name: 'banana', brand: '', servingSize: '1 medium', calories: 107, protein: 1.3, carbs: 27.5, fat: 0.4 },
  { name: 'oats', brand: '', servingSize: '80g', calories: 293, protein: 10, carbs: 52, fat: 5.5 },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim().toLowerCase();
  if (!query || query.length < 1) return NextResponse.json({ results: [] });

  const local = ISRAELI_FOODS.filter(f =>
    f.name.toLowerCase().includes(query)
  ).slice(0, 5).map(f => ({ ...f, source: 'local' }));

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=6&fields=product_name,nutriments,serving_size,brands`,
      { headers: { 'User-Agent': 'CaloryAI/1.0' }, signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    const off = (data.products || [])
      .filter((p: any) => p.product_name && p.nutriments?.['energy-kcal_100g'])
      .slice(0, 4)
      .map((p: any) => ({
        name: p.product_name,
        brand: p.brands || '',
        servingSize: p.serving_size || '100g',
        calories: Math.round(p.nutriments['energy-kcal_serving'] || p.nutriments['energy-kcal_100g'] || 0),
        protein: Math.round((p.nutriments['proteins_serving'] || p.nutriments['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((p.nutriments['carbohydrates_serving'] || p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((p.nutriments['fat_serving'] || p.nutriments['fat_100g'] || 0) * 10) / 10,
        source: 'off',
      }));
    return NextResponse.json({ results: [...local, ...off].slice(0, 8) });
  } catch {
    return NextResponse.json({ results: local });
  }
}
