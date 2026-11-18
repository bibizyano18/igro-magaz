// Возвращает список избранных игр текущего пользователя.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/current-user";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  // Гость не получает чужие связи: тот же статус, что и при изменении.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Возвращаем только slug: клиентский каталог сопоставляет их со своими id.
  const rows = await prisma.favoriteGame.findMany({
    where: { userId: user.id },
    select: { game: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ favorites: rows.map((row) => row.game.slug) });
}
