import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Импорт useNavigate
import axios from "axios";
import styles from "./Login.module.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "", // Поле username для удобства работы на клиенте
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Инициализация useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://45.153.189.150:8080/auth/login",
        {
          login: formData.username, // Отправляем login вместо username
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const token = response.data;
      localStorage.setItem("jwtToken", token);
      setSuccess("Авторизация успешна!");

      // Перенаправление на главную страницу после успешной авторизации
      navigate("/");
    } catch (err) {
      setError("Ошибка авторизации: " + (err.response?.status || ""));
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Авторизация</h2>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="username">Логин</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите логин"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите пароль"
            required
          />
        </div>

        <button type="submit" className={styles.button}>
          Войти
        </button>
      </form>
    </div>
  );
};

export default Login;
