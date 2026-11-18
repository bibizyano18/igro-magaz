// Идемпотентно заполняет локальную development-базу данными каталога игр.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { games } from "@/app/data/games";

// Для отдельного seed-процесса создаём собственный клиент.
const prisma = new PrismaClient();

// Магазины описываются отдельно от игр: у каждого магазина свой slug.
// Данные берутся из клиентского массива ЛР3, чтобы каталог совпадал.
const stores = [
  {
    slug: "pixel",
    name: "Магазин «Пиксель»",
    address: "Москва, Никольская улица, 10",
    latitude: "55.754700",
    longitude: "37.621700",
  },
  {
    slug: "hobby-zone",
    name: "Магазин «Хобби-зона»",
    address: "Москва, ТЦ «Атриум», Земляной Вал, 33",
    latitude: "55.759000",
    longitude: "37.650800",
  },
  {
    slug: "console-point",
    name: "Магазин «Консоль-Пойнт»",
    address: "Москва, Ленинский проспект, 109",
    latitude: "55.660200",
    longitude: "37.492600",
  },
] as const;

async function main() {
  // Хешируем только демонстрационный пароль локальной development-базы.
  const passwordHash = await hash("GamePass_2026!", 12);

  // Создаём или обновляем одного демонстрационного пользователя.
  const user = await prisma.user.upsert({
    where: { email: "gamer@example.test" },
    update: {
      name: "Демонстрационный игрок",
      passwordHash,
    },
    create: {
      name: "Демонстрационный игрок",
      email: "gamer@example.test",
      passwordHash,
    },
  });

  // Создаём или обновляем каждый магазин по уникальному slug.
  for (const store of stores) {
    await prisma.store.upsert({
      where: { slug: store.slug },
      update: store,
      create: store,
    });
  }

  // Сопоставляем имя магазина из каталога с его slug.
  // Явная запись Map<string, string> снимает literal-тип as const.
  const storeSlugByName = new Map<string, string>(
    stores.map((store) => [store.name, store.slug]),
  );

  // Создаём или обновляем каждую игру по уникальному slug.
  for (const game of games) {
    const storeSlug = storeSlugByName.get(game.storeName);
    if (!storeSlug) {
      throw new Error(`Для магазина "${game.storeName}" не задан slug`);
    }

    const store = await prisma.store.findUniqueOrThrow({
      where: { slug: storeSlug },
      select: { id: true },
    });

    await prisma.game.upsert({
      where: { slug: game.id },
      update: {
        title: game.title,
        summary: game.summary,
        genre: game.genre,
        platform: game.platform,
        price: game.price,
        image: game.image,
        imageAlt: game.imageAlt,
        storeId: store.id,
      },
      create: {
        slug: game.id,
        title: game.title,
        summary: game.summary,
        genre: game.genre,
        platform: game.platform,
        price: game.price,
        image: game.image,
        imageAlt: game.imageAlt,
        storeId: store.id,
      },
    });
  }

  // Находим первую игру, чтобы создать демонстрационную связь вишлиста.
  const first = await prisma.game.findUniqueOrThrow({
    where: { slug: games[0].id },
  });

  // Upsert составного ключа не создаёт дубликат при повторном seed.
  await prisma.favoriteGame.upsert({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: first.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      gameId: first.id,
    },
  });

  // Выводим проверяемый итог без пароля и хеша.
  console.log("Seed complete: 1 user, 3 stores, 3 games, 1 favorite");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Закрываем соединения отдельного seed-процесса.
    await prisma.$disconnect();
  });
