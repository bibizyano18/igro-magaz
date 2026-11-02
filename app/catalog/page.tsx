// Строит каталог карточек из массива учебных игр.

import Link from "next/link";
import { games } from "../data/games";
import WishlistButton from "../ui/WishlistButton";

// Объявляем основной компонент этого файла.
export default function CatalogPage() {
  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <main className="container">
      <h1 className="title">Каталог игр</h1>
      <p className="subtitle">Три учебные игры из демонстрационного набора</p>
      <p className="demo-warning">
        Вишлист учебный: он хранится только до обновления страницы.
      </p>
      <div className="card-grid">
        {games.map((game) => (
          <article className="card" key={game.id}>
            <h2>{game.title}</h2>
            <p>{game.summary}</p>
            <p>
              {game.genre} · {game.platform} · {game.price} ₽
            </p>
            <p className="card-actions">
              <Link href={`/catalog/${game.id}`}>Подробнее</Link>
              <WishlistButton gameId={game.id} />
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
