// Получает динамический id, находит игру и выводит страницу
// либо 404.

import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame } from "../../data/games";

// Типизируем параметры динамического маршрута.
type GamePageProps = {
  params: Promise<{ id: string }>;
};

// Объявляем основной компонент этого файла.
export default async function GamePage({ params }: GamePageProps) {
  // Получаем id из параметров динамического маршрута.
  const { id } = await params;
  // Ищем объект с идентификатором из URL.
  const game = getGame(id);

  if (!game) {
    // Показываем стандартную страницу 404, если объект не найден.
    notFound();
  }

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <main className="container">
      <h1 className="title">{game.title}</h1>
      <p className="lead">{game.summary}</p>
      <dl className="profile-list">
        <dt>Жанр</dt>
        <dd>{game.genre}</dd>
        <dt>Платформа</dt>
        <dd>{game.platform}</dd>
        <dt>Цена</dt>
        <dd>{game.price} ₽</dd>
      </dl>
      <Link href="/catalog">Вернуться в каталог</Link>
    </main>
  );
}
