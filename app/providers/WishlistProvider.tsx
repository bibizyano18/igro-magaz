// Хранит список избранных игр и синхронизирует его с сервером.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";

// Задаём контекст вишлиста: множество идентификаторов и операции над ним.
type WishlistContextValue = {
  ids: ReadonlySet<string>;
  // Пока true, список избранного ещё не загружен с сервера.
  loading: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Объявляем основной компонент этого файла.
export default function WishlistProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<Set<string>>(() => new Set<string>());
  const [loading, setLoading] = useState(true);

  // Храним актуальное множество для чтения внутри toggle без гонки замыкания.
  // Синхронизация в эффекте: ref нельзя обновлять во время рендера.
  const idsRef = useRef<Set<string>>(ids);

  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  // Загружаем избранное при входе и очищаем при выходе.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // До завершения auth-запроса ещё неизвестно, гость это или пользователь.
      if (authLoading) return;

      if (!user) {
        setIds(new Set<string>());
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/favorites");
        if (!response.ok) throw new Error("Не удалось загрузить избранное");
        const data = (await response.json()) as { favorites?: string[] };
        if (!cancelled) {
          setIds(new Set(data.favorites ?? []));
        }
      } catch {
        // Оставляем прежнее состояние: сетевая ошибка не должна ломать UI.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const toggle = useCallback(
    async (id: string) => {
      const willAdd = !idsRef.current.has(id);

      // Оптимистично обновляем список, чтобы интерфейс не ждал ответа.
      setIds((current) => {
        const next = new Set(current);
        if (willAdd) next.add(id);
        else next.delete(id);
        return next;
      });

      try {
        const response = await fetch(`/api/favorites/${encodeURIComponent(id)}`, {
          method: willAdd ? "POST" : "DELETE",
        });

        // Гость или истёкшая сессия: откатываем состояние.
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        if (!response.ok && response.status !== 404) {
          throw new Error("Ошибка сервера");
        }
      } catch {
        // Возвращаем прежнее множество при любой ошибке запроса.
        setIds((current) => {
          const next = new Set(current);
          if (willAdd) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [],
  );

  // Мемоизируем объект контекста до изменения его зависимостей.
  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      loading,
      has: (id) => ids.has(id),
      toggle,
    }),
    [ids, loading, toggle],
  );

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// Возвращаем контекст и защищаем хук от вызова вне провайдера.
export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error(
      "useWishlist должен использоваться внутри WishlistProvider",
    );
  }
  return context;
}
