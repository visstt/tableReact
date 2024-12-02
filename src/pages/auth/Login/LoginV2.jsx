import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Импорт useNavigate
import axios from "axios";
import Cookies from "js-cookie"; // Для записи токена в cookie
import styles from "./Login.module.css";
import { url } from "../../../costants/constants";
import photo from "./photoLogin.png";

export default function LoginV2() {
  const [formData, setFormData] = useState({
    username: "", // Поле username для удобства работы на клиенте
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate(); // Инициализация useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${url}/auth/login`,
        {
          login: formData.username, // Отправляем login вместо username
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const token = response.data;
      Cookies.set("jwtToken", token, { expires: 1 }); // Записываем токен в cookie на 1 день

      // Перенаправление на страницу Class
      navigate("/");
    } catch (err) {
      setError("Ошибка авторизации: " + (err.response?.status || ""));
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Вход в электронный дневник</h2>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="username">
            <p>Логин</p>
          </label>
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
          <label htmlFor="password">
            <p>Пароль</p>
          </label>
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
      <div className={styles.photo}>
        <img src={photo} alt="photo"  className={styles.photoGroup}/>
      </div>
    </div>
  );
}
