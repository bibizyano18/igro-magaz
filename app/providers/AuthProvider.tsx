// Синхронизирует состояние пользователя с серверными auth-маршрутами.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Безопасные поля пользователя: без passwordHash и без токена.
export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

// Результат входа или регистрации: успех либо список ошибок сервера.
export type AuthActionResult = {
  ok: boolean;
  errors: string[];
};

// Данные, которые отправляем на регистрацию.
export type RegistrationPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Задаём контракт данных и функций контекста.
type AuthContextValue = {
  user: SessionUser | null;
  // Пока true, запрос /api/auth/me ещё не завершён.
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (payload: RegistrationPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Безопасно разбираем JSON: у не-JSON ответа может быть пустое тело.
async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// Извлекаем массив ошибок из формата { errors: string[] }.
function toErrors(data: Record<string, unknown>): string[] {
  return Array.isArray(data.errors) ? data.errors.map(String) : [];
}

// Объявляем основной компонент этого файла.
export default function AuthProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // При первом рендере восстанавливаем сессию из httpOnly cookie.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await readJson(response);
        if (!cancelled) {
          setUser((data.user as SessionUser | null) ?? null);
        }
      } catch {
        // Сетевая ошибка приравнивается к гостевому состоянию.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await readJson(response);

    if (!response.ok) {
      return {
        ok: false,
        errors: toErrors(data).length
          ? toErrors(data)
          : ["Не удалось войти"],
      };
    }

    setUser((data.user as SessionUser | null) ?? null);
    return { ok: true, errors: [] };
  }, []);

  const register = useCallback(async (payload: RegistrationPayload) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await readJson(response);

    if (!response.ok) {
      return {
        ok: false,
        errors: toErrors(data).length
          ? toErrors(data)
          : ["Не удалось зарегистрироваться"],
      };
    }

    setUser((data.user as SessionUser | null) ?? null);
    return { ok: true, errors: [] };
  }, []);

  const logout = useCallback(async () => {
    // Сервер очищает cookie; локальное состояние сбрасываем всегда.
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  }, []);

  // Мемоизируем объект контекста до изменения его зависимостей.
  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Возвращаем контекст и защищаем хук от вызова вне провайдера.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
}
