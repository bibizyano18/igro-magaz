// Переключает игру в вишлисте: кнопка для пользователя, ссылка для гостя.

"use client";

import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import { useWishlist } from "../providers/WishlistProvider";

// Типизируем входные свойства компонента.
type WishlistButtonProps = {
  gameId: string;
};

// Объявляем основной компонент этого файла.
export default function WishlistButton({ gameId }: WishlistButtonProps) {
  const { user, loading } = useAuth();
  const { has, toggle } = useWishlist();

  // Пока неизвестна сессия, не мигаем ссылкой для гостя.
  if (loading) {
    return <span className="wishlist-login">…</span>;
  }

  // Гость не управляет вишлистом: предлагаем войти.
  if (!user) {
    return (
      <Link className="wishlist-login" href="/auth/login">
        Войти, чтобы вести вишлист
      </Link>
    );
  }

  const inWishlist = has(gameId);

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <button
      className={inWishlist ? "wishlist-btn wishlist-btn_active" : "wishlist-btn"}
      type="button"
      aria-pressed={inWishlist}
      onClick={() => void toggle(gameId)}
    >
      {inWishlist ? "В вишлисте ✓" : "Добавить в вишлист"}
    </button>
  );
}
