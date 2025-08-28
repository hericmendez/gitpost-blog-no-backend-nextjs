import { NextResponse } from 'next/server';
import { listPostsPublicPaged, type SortBy, type Order } from '@/lib/post-public';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const owner = searchParams.get('owner') || undefined;
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Parâmetro 'owner' ausente na query" },
        { status: 400 }
      );
    }
    // sort: 'date' | 'title'
    const sort = (searchParams.get('sort') || 'date').toLowerCase();
    const sortBy: SortBy = sort === 'title' ? 'title' : 'date';

    // order: 'asc' | 'desc'
    const ord = (searchParams.get('order') || 'desc').toLowerCase();
    const order: Order = ord === 'asc' ? 'asc' : 'desc';

    // paginação
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10) || 10);

    const result = await listPostsPublicPaged({ owner, sortBy, order, page, pageSize });

    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
