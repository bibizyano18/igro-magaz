// Описывает одну предметную сущность (игра) и учебный набор данных.
// Это не база данных: в лабораторных № 5–6 массив заменят модели Prisma.

export type Game = {
  id: string;
  title: string;
  summary: string;
  genre: string;
  platform: string;
  price: number;
  // Лабораторная № 3: фотография магазина и его координаты.
  image: string;
  imageAlt: string;
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
};

export const games: Game[] = [
  {
    id: "witcher-3",
    title: "Ведьмак 3: Дикая Охота",
    summary: "Ролевой экшен в открытом мире: контракты на чудовищ, выборы с последствиями и два сюжетных дополнения.",
    genre: "RPG",
    platform: "PC",
    price: 1999,
    image: "/images/games/magaz1.jpg",
    imageAlt: "Торговый зал магазина «Пиксель»: стеллажи с играми и стена с бейджами",
    storeName: "Магазин «Пиксель»",
    storeAddress: "Москва, Никольская улица, 10",
    latitude: 55.7547,
    longitude: 37.6217,
  },
  {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    summary: "Пошаговая RPG по правилам D&D: кооператив до четырёх игроков и высокая реиграбельность.",
    genre: "RPG",
    platform: "PC, PlayStation",
    price: 2999,
    image: "/images/games/magaz2.jpg",
    imageAlt: "Стеллажи с настольными играми и витрина с игрушками в магазине «Хобби-зона»",
    storeName: "Магазин «Хобби-зона»",
    storeAddress: "Москва, ТЦ «Атриум», Земляной Вал, 33",
    latitude: 55.759,
    longitude: 37.6508,
  },
  {
    id: "silksong",
    title: "Hollow Knight: Silksong",
    summary: "Метроидвания про Хорнет: быстрый бой, новые локации королевства Фарлум и сложный платформер.",
    genre: "Метроидвания",
    platform: "PC, Nintendo Switch",
    price: 1399,
    image: "/images/games/magaz3.png",
    imageAlt: "Полки с настольными играми в магазине «Консоль-Пойнт»",
    storeName: "Магазин «Консоль-Пойнт»",
    storeAddress: "Москва, Ленинский проспект, 109",
    latitude: 55.6602,
    longitude: 37.4926,
  },
];

// Поиск объекта по id (используется динамической страницей).
export function getGame(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}
