// Управляет карточками магазинов, выбранным объектом
// и модальным окном с картой.

"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
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

  // Обработчик карты не пересоздаётся между рендерами: иначе эффект карты
  // выполнялся бы заново при каждом изменении выбранного магазина.
  const openFromMap = useCallback((game: Game) => {
    // Метка карты управляется внешним canvas API: фокус возвращаем лишь логично.
    setReturnFocusTo(null);
    setSelected(game);
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
  }, []);

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <>
      <div className={styles.grid}>
        {games.map((game, index) => (
          <button
            className={styles.card}
            type="button"
            key={game.id}
            onClick={(event) => openFromCard(game, event.currentTarget)}
          >
            <span className={styles.imageWrap}>
              {/* Первые две карточки видны на первом экране: грузим их с приоритетом. */}
              <Image
                src={game.image}
                alt={game.imageAlt}
                fill
                priority={index < 2}
                loading={index < 2 ? undefined : "lazy"}
                sizes="(max-width: 30rem) calc(100vw - 2rem), (max-width: 48rem) 50vw, (max-width: 75rem) 30vw, 18rem"
                className={styles.image}
              />
            </span>
            <span className={styles.cardBody}>
              <span className={styles.title}>{game.storeName}</span>
              <span className={styles.summary}>{game.storeAddress}</span>
            </span>
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
