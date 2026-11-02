// Управляет карточками магазинов, выбранным объектом
// и модальным окном с картой.

"use client";

import Image from "next/image";
import { useState } from "react";
import { games, type Game } from "../../data/games";
import PhotoMap from "./PhotoMap";
import PhotoModal from "./PhotoModal";
import styles from "./PlacesGallery.module.css";

// Объявляем основной компонент этого файла.
export default function PlacesGallery() {
  // Создаём локальное состояние компонента.
  const [selected, setSelected] = useState<Game | null>(null);
  const [returnFocusTo, setReturnFocusTo] = useState<HTMLButtonElement | null>(
    null,
  );

  function openFromCard(game: Game, button: HTMLButtonElement) {
    // Сохраняем кнопку-триггер для возврата фокуса после закрытия окна.
    setReturnFocusTo(button);
    setSelected(game);
  }

  function openFromMap(game: Game) {
    // Метка карты управляется внешним canvas API: фокус возвращаем лишь логично.
    setReturnFocusTo(null);
    setSelected(game);
  }

  function closeModal() {
    setSelected(null);
  }

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <>
      <div className={styles.grid}>
        {games.map((game) => (
          <button
            className={styles.card}
            type="button"
            key={game.id}
            onClick={(event) => openFromCard(game, event.currentTarget)}
          >
            <span className={styles.imageWrap}>
              <Image
                src={game.image}
                alt={game.imageAlt}
                fill
                sizes="(max-width: 700px) 100vw, 33vw"
                className={styles.image}
              />
            </span>
            <span className={styles.title}>{game.storeName}</span>
            <span className={styles.summary}>{game.storeAddress}</span>
          </button>
        ))}
      </div>

      <p className={styles.demoNote}>
        Магазины — учебные данные: адреса и координаты приведены для отработки
        интерфейса.
      </p>

      <PhotoMap games={games} onSelect={openFromMap} />

      {selected ? (
        <PhotoModal
          game={selected}
          onClose={closeModal}
          returnFocusTo={returnFocusTo}
        />
      ) : null}
    </>
  );
}
