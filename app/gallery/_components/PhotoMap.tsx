// Загружает API Яндекс Карт, создаёт карту и связывает метки с играми.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "../../data/games";
import styles from "./PhotoMap.module.css";

// Координаты представлены парой широты и долготы.
type Coordinates = [number, number];

type YandexPlacemark = {
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
};

type YandexMap = {
  // Контейнер карты умеет пересчитывать размеры после изменения макета.
  container: {
    fitToViewport: () => void;
  };
  geoObjects: {
    add: (placemark: YandexPlacemark) => void;
  };
  destroy: () => void;
};

type YandexMapsApi = {
  ready: (callback: () => void) => void;
  Map: new (
    container: HTMLElement,
    state: { center: Coordinates; zoom: number; controls: string[] },
  ) => YandexMap;
  Placemark: new (
    coordinates: Coordinates,
    properties: { hintContent: string; balloonContent: string },
    options: { preset: string; iconColor: string },
  ) => YandexPlacemark;
};

// Дополняем тип Window объектом, который добавляет внешний API.
declare global {
  interface Window {
    ymaps?: YandexMapsApi;
  }
}

const scriptId = "igro-magaz-yandex-maps";
let mapsPromise: Promise<YandexMapsApi> | null = null;

// Загружаем скрипт карты один раз и ожидаем готовности API.
function loadMaps(apiKey: string): Promise<YandexMapsApi> {
  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps?.ready(() => resolve(window.ymaps as YandexMapsApi));
    });
  }

  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    function resolveWhenReady() {
      if (!window.ymaps) {
        mapsPromise = null;
        reject(new Error("Yandex Maps API is unavailable"));
        return;
      }

      window.ymaps.ready(() => resolve(window.ymaps as YandexMapsApi));
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", resolveWhenReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Map script error")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    script.async = true;
    script.addEventListener("load", resolveWhenReady, { once: true });
    script.addEventListener(
      "error",
      () => {
        mapsPromise = null;
        reject(new Error("Map script error"));
      },
      { once: true },
    );
    // Подключаем внешний скрипт к документу.
    document.head.appendChild(script);
  });

  return mapsPromise;
}

// Даём ссылке на логотип в копирайте доступное имя: своего текста у неё нет.
function nameCopyrightLink(container: HTMLElement) {
  const link = container.querySelector<HTMLAnchorElement>(
    ".ymaps-2-1-79-copyright__logo-cell a",
  );
  if (link && !link.getAttribute("aria-label")) {
    link.setAttribute("aria-label", "Яндекс Карты");
  }
}

// Объявляем основной компонент этого файла.
export default function PhotoMap({
  games,
  onSelect,
}: {
  games: Game[];
  onSelect: (game: Game) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Статус задаём лениво: публичная переменная окружения известна уже при сборке.
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "";
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-key">(
    () => (apiKey ? "loading" : "no-key"),
  );

  const initialise = useCallback(async (): Promise<YandexMap | null> => {
    if (!apiKey || !containerRef.current || games.length === 0) return null;

    try {
      const ymaps = await loadMaps(apiKey);
      if (!containerRef.current) return null;

      const first = games[0];
      // Создаём экземпляр карты в подготовленном DOM-контейнере.
      const map = new ymaps.Map(containerRef.current, {
        center: [first.latitude, first.longitude],
        zoom: 11,
        controls: ["zoomControl"],
      });

      // Добавляем на карту метку для каждого магазина игры.
      games.forEach((game) => {
        const placemark = new ymaps.Placemark(
          [game.latitude, game.longitude],
          {
            hintContent: game.storeName,
            balloonContent: game.storeAddress,
          },
          {
            preset: "islands#circleDotIcon",
            iconColor: "#1a6b3c",
          },
        );

        placemark.events.add("click", () => onSelect(game));
        map.geoObjects.add(placemark);
      });

      nameCopyrightLink(containerRef.current);
      setStatus("ready");
      return map;
    } catch {
      setStatus("error");
      return null;
    }
  }, [apiKey, games, onSelect]);

  // Синхронизируем компонент с браузерными событиями или внешним API.
  useEffect(() => {
    if (!apiKey) {
      // Статус no-key уже задан при инициализации состояния.
      return;
    }

    const container = containerRef.current;
    if (!container || games.length === 0) return;

    let disposed = false;
    let started = false;
    let map: YandexMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;

    async function buildMap() {
      const created = await initialise();
      if (disposed || !containerRef.current) return;
      map = created;
      if (!map) return;

      // Пересчитываем размеры карты при изменении контейнера.
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          map?.container.fitToViewport();
        });
        resizeObserver.observe(containerRef.current);
      }
    }

    // Карта и её скрипт не нужны до того, как блок появится рядом с экраном.
    if (typeof IntersectionObserver !== "undefined") {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting) || started) return;
          started = true;
          visibilityObserver?.disconnect();
          void buildMap();
        },
        { rootMargin: "200px" },
      );
      visibilityObserver.observe(container);
    } else {
      started = true;
      void buildMap();
    }

    // В cleanup освобождаем подписки и внешние ресурсы эффекта.
    return () => {
      disposed = true;
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      map?.destroy();
    };
  }, [apiKey, games, initialise]);

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <section className={styles.section} aria-labelledby="map-title">
      <h2 id="map-title">Карта игровых магазинов</h2>

      {status === "no-key" ? (
        <p className={styles.status}>
          Добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в файл .env.local, чтобы
          увидеть карту.
        </p>
      ) : null}

      {status === "error" ? (
        <p className={styles.status}>Не удалось загрузить карту.</p>
      ) : null}

      {status === "loading" ? (
        <p className={styles.status}>Карта загружается…</p>
      ) : null}

      <div ref={containerRef} className={styles.canvas} />
    </section>
  );
}
