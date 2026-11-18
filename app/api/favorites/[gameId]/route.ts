// Защищает добавление и удаление вишлиста серверной проверкой пользователя.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/current-user";
import { prisma } from "@/app/lib/prisma";

type RouteParams = {
  params: Promise<{ gameId: string }>;
};

// Клиентский каталог использует slug ("witcher-3"), а база — UUID.
// Сравнение не-UUID со столбцом uuid вызывает ошибку PostgreSQL,
// поэтому перед OR проверяем формат идентификатора.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function gameWhere(gameId: string) {
  return UUID_PATTERN.test(gameId)
    ? { OR: [{ id: gameId }, { slug: gameId }] }
    : { slug: gameId };
}

export async function POST(_request: Request, context: RouteParams) {
  // Авторизуем действие рядом с изменением данных.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId } = await context.params;

  // Не создаём связь с отсутствующей игрой каталога.
  const game = await prisma.game.findFirst({
    where: gameWhere(gameId),
    select: { id: true },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Upsert делает повторный POST идемпотентным для одной пары ключей.
  const favorite = await prisma.favoriteGame.upsert({
    where: { userId_gameId: { userId: user.id, gameId: game.id } },
    update: {},
    create: { userId: user.id, gameId: game.id },
  });

  return NextResponse.json({ favorite }, { status: 201 });
}

export async function DELETE(_request: Request, context: RouteParams) {
  // Гость не может изменять строки FavoriteGame.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId } = await context.params;

  const game = await prisma.game.findFirst({
    where: gameWhere(gameId),
    select: { id: true },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Удаляем только связь пользователя, полученного из проверенной сессии.
  const result = await prisma.favoriteGame.deleteMany({
    where: { userId: user.id, gameId: game.id },
  });

  return NextResponse.json({ deleted: result.count });
}
