// Создаёт доступное модальное окно с фотографией магазина,
// данными игры и управлением фокусом.

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../providers/AuthProvider";
import { useWishlist } from "../../providers/WishlistProvider";
import type { Game } from "../../data/games";
import styles from "./PhotoModal.module.css";

// Типизируем входные свойства компонента.
type PhotoModalProps = {
  game: Game;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
};

// Собираем селектор элементов, которые могут получать фокус.
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// Объявляем основной компонент этого файла.
export default function PhotoModal({
  game,
  onClose,
  returnFocusTo,
}: PhotoModalProps) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Синхронизируем компонент с браузерными событиями или внешним API.
  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);

    // В cleanup освобождаем подписки и внешние ресурсы эффекта.
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.documentElement.style.overflow = previousOverflow;
      returnFocusTo?.focus();
    };
  }, [onClose, returnFocusTo]);

  // Не выпускаем клавиатурный фокус за границы открытого интерфейса.
  function keepFocusInside(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );

    if (focusable.length === 0) {
      // Отменяем стандартное действие события и выполняем собственную логику.
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Рендерим окно в document.body поверх основного интерфейса.
  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-modal-title"
        onKeyDown={keepFocusInside}
      >
        <button
          ref={closeButtonRef}
          className={styles.close}
          type="button"
          aria-label="Закрыть окно"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="game-modal-title">{game.storeName}</h2>

        <Image
          src={game.image}
          alt={game.imageAlt}
          width={900}
          height={600}
          className={styles.image}
          sizes="(max-width: 700px) calc(100vw - 48px), 720px"
        />

        <p>
          <strong>Адрес:</strong> {game.storeAddress}
        </p>

        <h3>Продаётся игра</h3>
        <p>
          <strong>{game.title}</strong>
        </p>
        <p>{game.summary}</p>
        <p>
          {game.genre} · {game.platform} · {game.price} ₽
        </p>

        <h3>Действия</h3>
        {/* Строка действий переносится, а на узком экране занимает всю ширину. */}
        <div className={styles.actions}>
          <Link className={styles.actionLink} href={`/catalog/${game.id}`}>
            Страница игры в каталоге
          </Link>

          {user ? (
            <button
              className={
                has(game.id)
                  ? `${styles.favorite} ${styles.favoriteActive}`
                  : styles.favorite
              }
              type="button"
              aria-pressed={has(game.id)}
              onClick={() => void toggle(game.id)}
            >
              {has(game.id)
                ? "Удалить из избранного"
                : "Добавить в избранное"}
            </button>
          ) : (
            <Link className={styles.actionLink} href="/auth/login">
              Войдите, чтобы использовать избранное
            </Link>
          )}
        </div>

        {user ? (
          <p className={styles.note}>
            Избранное сохраняется в базе данных и доступно после перезагрузки.
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
