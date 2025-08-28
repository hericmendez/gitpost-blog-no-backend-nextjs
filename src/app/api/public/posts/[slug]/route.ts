import { NextResponse } from 'next/server';
import { getPostPublic } from '@/lib/post-public';

export const runtime = 'nodejs';

type Params =  { params: Promise<{ slug: string }> }

export async function GET(req: Request, { params }: Params) {
console.log("req ==> ", req);
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner') || undefined;

    const { slug } = await params;
    const post = await getPostPublic(slug, owner);
    console.log("post ==> ", post);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, post });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
