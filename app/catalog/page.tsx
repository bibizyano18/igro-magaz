// Строит каталог карточек из массива учебных игр.

import Link from "next/link";
import { games } from "../data/games";

// Объявляем основной компонент этого файла.
export default function CatalogPage() {
  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <main className="container">
      <h1 className="title">Каталог игр</h1>
      <p className="subtitle">Три учебные игры из демонстрационного набора</p>
      <div className="card-grid">
        {games.map((game) => (
          <article className="card" key={game.id}>
            <h2>{game.title}</h2>
            <p>{game.summary}</p>
            <p>
              {game.genre} · {game.platform} · {game.price} ₽
            </p>
            <Link href={`/catalog/${game.id}`}>Подробнее</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
