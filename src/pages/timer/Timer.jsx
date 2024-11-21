import React, { useState, useEffect } from "react";
import styles from "./Timer.module.css";

export default function Timer() {
  const [time, setTime] = useState(0); // время в миллисекундах
  const [isRunning, setIsRunning] = useState(false);
  const [timestamps, setTimestamps] = useState([]); // массив временных меток

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10); // обновляем каждые 10 мс
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (time) => {
    const milliseconds = `00${time % 1000}`.slice(-3); // Миллисекунды
    const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2); // Секунды
    const minutes = `0${Math.floor((time / 60000) % 60)}`.slice(-2); // Минуты
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  const handleAddTimestamp = () => {
    setTimestamps((prev) => [...prev, time]); // добавляем текущую отметку времени
  };

  return (
    <div className={styles.timerContainer}>
      <h1 className={styles.time}>{formatTime(time)}</h1>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={() => setIsRunning(true)}>
          Старт
        </button>
        <button className={styles.button} onClick={() => setIsRunning(false)}>
          Пауза
        </button>
        <button
          className={styles.button}
          onClick={() => {
            setTime(0);
            setIsRunning(false);
            setTimestamps([]); // очищаем временные метки при сбросе
          }}
        >
          Сбросить
        </button>
        <button className={styles.button} onClick={handleAddTimestamp}>
          Добавить метку
        </button>
      </div>
      {timestamps.length > 0 && (
        <div className={styles.timestamps}>
          <h2>Метки:</h2>
          <ul>
            {timestamps.map((timestamp, index) => (
              <li key={index}>{formatTime(timestamp)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
