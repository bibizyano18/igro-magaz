// Регистрирует пользователя через серверный маршрут
// и переводит его в личный кабинет.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../providers/AuthProvider";

// Объявляем основной компонент этого файла.
export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  // Создаём локальное состояние компонента.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Обрабатываем отправку формы без перезагрузки страницы.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Отменяем стандартное действие события и выполняем
    // собственную логику.
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов.");
      return;
    }

    if (password !== confirmation) {
      setError("Введённые пароли не совпадают.");
      return;
    }

    setPending(true);
    try {
      // Сервер повторно валидирует поля и хеширует пароль.
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword: confirmation,
      });
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
      <h1 className="title">Регистрация</h1>
      <p className="demo-warning">
        Аккаунт создаётся в базе данных: пароль хранится только в виде
        bcrypt-хеша.
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <label htmlFor="name">Логин</label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="username"
          required
        />
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <label htmlFor="confirmation">Повторить пароль</label>
        <input
          id="confirmation"
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Создание аккаунта…" : "Создать аккаунт"}
        </button>
      </form>
      <p>
        Есть аккаунт? <Link href="/auth/login">Войти</Link>
      </p>
    </main>
  );
}
