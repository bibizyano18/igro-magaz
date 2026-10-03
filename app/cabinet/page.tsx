// Показывает состояние гостя или данные учебного пользователя.

"use client";

import Link from "next/link";
import { useDemoAuth } from "../providers/DemoAuthProvider";

// Объявляем основной компонент этого файла.
export default function CabinetPage() {
  const { user, logout } = useDemoAuth();

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
        <h2>Мои игры</h2>
        <p>Здесь появятся купленные игры и вишлист после подключения базы данных.</p>
      </section>

      <button type="button" onClick={logout}>
        Выйти
      </button>
    </main>
  );
}
