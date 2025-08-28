import { NextResponse } from 'next/server';
import { listCategoriesPublic } from '@/lib/post-public';

export const runtime = 'nodejs'; // opcional

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner') || undefined;

    const categories = await listCategoriesPublic(owner);
    return NextResponse.json({ success: true, categories });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
