import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ success: false, error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = `${nanoid()}.webp`;
  const filePath = path.join(process.cwd(), "public", "images", filename);

  try {
    await sharp(buffer)
      .resize(1200) // Redimensiona para no máx. 1200px de largura
      .webp({ quality: 80 })
      .toFile(filePath);

    const imageUrl = `/images/${filename}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (err: any) {
    console.error("Erro ao processar imagem:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
