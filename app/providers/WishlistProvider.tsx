// Хранит список избранных игр и предоставляет управление через React Context.

"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Задаём контекст вишлиста: множество идентификаторов и операции над ним.
type WishlistContextValue = {
  ids: ReadonlySet<string>;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Объявляем основной компонент этого файла.
export default function WishlistProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Создаём локальное состояние компонента.
  const [ids, setIds] = useState<Set<string>>(() => new Set<string>());

  // Мемоизируем объект контекста до изменения его зависимостей.
  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      has: (id) => ids.has(id),
      toggle(id) {
        setIds((current) => {
          const next = new Set(current);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      },
    }),
    [ids],
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
