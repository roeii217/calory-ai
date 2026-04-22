import { NextRequest, NextResponse } from 'next/server';

const ISRAELI_PRODUCTS: Record<string, any> = {
  '7290000066518': { name: 'במבה', brand: 'אסם', servingSize: '30g', calories: 157, protein: 3.9, carbs: 14.7, fat: 9.9 },
  '7290004131443': { name: 'ביסלי גריל', brand: 'אסם', servingSize: '30g', calories: 128, protein: 2.1, carbs: 18.6, fat: 4.9 },
  '7290000104508': { name: 'אחלה שוקולד חלב', brand: 'אחלה', servingSize: '100g', calories: 535, protein: 7.2, carbs: 57.4, fat: 30.2 },
  '7290104534000': { name: 'חומוס טבעי', brand: 'אחלה', servingSize: '100g', calories: 170, protein: 8, carbs: 20, fat: 8 },
  '7290000077810': { name: 'קוטג׳ 5%', brand: 'תנובה', servingSize: '250g', calories: 245, protein: 27.5, carbs: 7.5, fat: 12.5 },
  '5449000000996': { name: 'Coca-Cola', brand: 'Coca-Cola', servingSize: '330ml', calories: 139, protein: 0, carbs: 35, fat: 0 },
  '7290000123456': { name: 'יוגורט ביו', brand: 'תנובה', servingSize: '200g', calories: 116, protein: 8, carbs: 16, fat: 3 },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode')?.trim();
  if (!barcode) return NextResponse.json({ error: 'No barcode' }, { status: 400 });

  // Check Israeli DB first
  if (ISRAELI_PRODUCTS[barcode]) {
    return NextResponse.json(ISRAELI_PRODUCTS[barcode]);
  }

  // Try OpenFoodFacts
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,product_name_he,nutriments,serving_size,brands,image_url`,
      { headers: { 'User-Agent': 'CaloryAI/1.0' }, signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    if (data.status === 1 && data.product) {
      const p = data.product;
      const n = p.nutriments || {};
      return NextResponse.json({
        name: p.product_name_he || p.product_name || 'מוצר לא ידוע',
        brand: p.brands || '',
        servingSize: p.serving_size || '100g',
        imageUrl: p.image_url || '',
        calories: Math.round(n['energy-kcal_serving'] || n['energy-kcal_100g'] || 0),
        protein: Math.round((n['proteins_serving'] || n['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((n['carbohydrates_serving'] || n['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((n['fat_serving'] || n['fat_100g'] || 0) * 10) / 10,
      });
    }
  } catch {}

  return NextResponse.json({ error: 'מוצר לא נמצא. נסה להזין ידנית.' }, { status: 404 });
}
