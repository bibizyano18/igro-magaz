// Показывает состояние гостя, данные учебного пользователя и вишлист.

"use client";

import Link from "next/link";
import { games } from "../data/games";
import { useDemoAuth } from "../providers/DemoAuthProvider";
import { useWishlist } from "../providers/WishlistProvider";

// Объявляем основной компонент этого файла.
export default function CabinetPage() {
  const { user, logout } = useDemoAuth();
  const { ids, toggle } = useWishlist();

  // Для гостя предлагаем перейти на форму входа.
  if (!user) {
    return (
      <main className="container">
        <h1 className="title">Личный кабинет</h1>
        <p className="demo-warning">
          Пользователь не вошёл. Это учебное состояние прототипа.
        </p>
        <Link className="primary-link" href="/auth/login">
          Перейти ко входу
        </Link>
      </main>
    );
  }

  // Отбираем из каталога игры, добавленные в вишлист.
  const wishlistGames = games.filter((game) => ids.has(game.id));

  // Для учебного пользователя выводим его данные и кнопку выхода.
  return (
    <main className="container">
      <h1 className="title">Личный кабинет</h1>
      <p className="subtitle">Учебный пользователь демонстрационного режима</p>
      <dl className="profile-list">
        <dt>Имя</dt>
        <dd>{user.name}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </dl>

      <section className="section">
        <h2>Вишлист</h2>
        {wishlistGames.length === 0 ? (
          <p>
            Вишлист пуст.{" "}
            <Link href="/catalog">Добавьте игры в каталоге</Link>.
          </p>
        ) : (
          <>
            <p>
              Всего игр: {wishlistGames.length}. Список обновляется сразу после
              добавления или удаления игры в каталоге.
            </p>
            <ul className="wishlist-list">
              {wishlistGames.map((game) => (
                <li className="wishlist-item" key={game.id}>
                  <span className="wishlist-item__info">
                    <Link href={`/catalog/${game.id}`}>{game.title}</Link>
                    <small>
                      {game.genre} · {game.platform} · {game.price} ₽
                    </small>
                  </span>
                  <button
                    className="wishlist-btn"
                    type="button"
                    onClick={() => toggle(game.id)}
                  >
                    Убрать
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="section">
        <h2>Купленные игры</h2>
        <p>Здесь появятся купленные игры после подключения базы данных.</p>
      </section>

      <button type="button" onClick={logout}>
        Выйти
      </button>
    </main>
  );
}
