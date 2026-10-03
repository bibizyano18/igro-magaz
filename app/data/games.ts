// Описывает одну предметную сущность (игра) и учебный набор данных.
// Это не база данных: в лабораторных № 5–6 массив заменят модели Prisma.

export type Game = {
  id: string;
  title: string;
  summary: string;
  genre: string;
  platform: string;
  price: number;
};

export const games: Game[] = [
  {
    id: "witcher-3",
    title: "Ведьмак 3: Дикая Охота",
    summary: "Ролевой экшен в открытом мире: контракты на чудовищ, выборы с последствиями и два сюжетных дополнения.",
    genre: "RPG",
    platform: "PC",
    price: 1999,
  },
  {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    summary: "Пошаговая RPG по правилам D&D: кооператив до четырёх игроков и высокая реиграбельность.",
    genre: "RPG",
    platform: "PC, PlayStation",
    price: 2999,
  },
  {
    id: "silksong",
    title: "Hollow Knight: Silksong",
    summary: "Метроидвания про Хорнет: быстрый бой, новые локации королевства Фарлум и сложный платформер.",
    genre: "Метроидвания",
    platform: "PC, Nintendo Switch",
    price: 1399,
  },
];

// Поиск объекта по id (используется динамической страницей).
export function getGame(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}
