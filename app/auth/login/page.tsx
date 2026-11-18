// Обрабатывает вход через серверный маршрут и переводит
// пользователя в личный кабинет.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../providers/AuthProvider";

// Объявляем основной компонент этого файла.
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  // Создаём локальное состояние компонента.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Обрабатываем отправку формы без перезагрузки страницы.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Отменяем стандартное действие события и выполняем
    // собственную логику.
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Введите не менее 8 символов.");
      return;
    }

    setPending(true);
    try {
      // Отправляем данные на сервер: пароль проверяется против bcrypt-хеша.
      const result = await login(email.trim(), password);
      if (!result.ok) {
        setError(result.errors.join(" "));
        return;
      }
      // После успешного действия переходим на следующий маршрут.
      router.push("/cabinet");
    } finally {
      setPending(false);
    }
  }

  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <main className="container form-page">
      <h1 className="title">Вход в личный кабинет</h1>
      <p className="demo-warning">
        Данные отправляются на сервер: пароль сверяется с bcrypt-хешем в базе.
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email / логин</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          minLength={8}
          required
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Выполняется вход…" : "Войти"}
        </button>
      </form>
      <p>
        Нет аккаунта? <Link href="/auth/register">Зарегистрироваться</Link>
      </p>
    </main>
  );
}
