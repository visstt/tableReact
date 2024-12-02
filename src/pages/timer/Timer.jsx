import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // Импортируем axios для работы с API
import styles from "./Timer.module.css"; // Импортируем стили
import { url } from "../../costants/constants"; // Импортируем URL для API

export default function Timer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [selectedTimestamps, setSelectedTimestamps] = useState([]);
  const [timeData, setTimeData] = useState([]); // Новое состояние для временных меток

  const { classId, themeId, studentId, studentName } = useParams();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${url}/student/getStudentsByClassId/${classId}`
        );
        const updatedStudents = response.data.map((student) => ({
          id: student.studentId,
          name: student.fullName,
          timestamp: null,
        }));
        setStudents(updatedStudents);
        console.log("Студенты загружены:", updatedStudents);
      } catch (err) {
        console.error("Ошибка при загрузке студентов:", err);
      }
    };

    fetchStudents();
  }, [classId]);

  useEffect(() => {
    if (studentName) {
      const namesArray = studentName.split(",").map((name, index) => ({
        id: index + 1,
        name: name.trim(),
        timestamp: null,
      }));
      setStudents(namesArray);
      console.log("Студенты загружены:", namesArray);
    }
  }, [studentName]);

  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await axios.get(`${url}/themeJournal/${themeId}`);
        const timeData = response.data.map((entry) => entry.time); // Предполагается, что каждый объект имеет атрибут time
        console.log("Временные метки загружены:", timeData); // Логируем полученные временные метки
        setTimeData(timeData); // Сохраняем временные метки в отдельном состоянии
      } catch (error) {
        console.error("Ошибка при загрузке временных меток:", error);
      }
    };

    fetchTimestamps();
  }, [themeId]);

  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await axios.get(`${url}/themeJournal/${themeId}`);
        console.log("Ответ от API:", response.data); // Логируем весь ответ от API
        const timeData = response.data.map((entry) => {
          console.log("Временная метка из API:", entry.time); // Логируем каждую временную метку
          return entry.time;
        });
        console.log("Временные метки загружены:", timeData); // Логируем полученные временные метки
        setTimeData(timeData); // Сохраняем временные метки в отдельном состоянии
      } catch (error) {
        console.error("Ошибка при загрузке временных меток:", error);
      }
    };

    fetchTimestamps();
  }, [themeId]);

  useEffect(() => {
    let interval;
    if (isRunning)
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (time) => {
    if (time === null || time === undefined || isNaN(time)) return "Нет метки"; // Проверка на null, undefined и NaN
    const milliseconds = `00${time % 1000}`.slice(-3);
    const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2);
    const minutes = `0${Math.floor((time / 60000) % 60)}`.slice(-2);
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  const handleAddTimestamp = () => {
    const newTimestamp = time;
    setTimestamps([...timestamps, newTimestamp]);
    console.log("Добавлена метка времени:", formatTime(newTimestamp));
  };

  const handleApplyTimestamp = (timestamp) => {
    if (selectedStudent !== null) {
      // Проверка, привязано ли это время к другому студенту
      const studentWithSameTimestamp = students.find(
        (student) =>
          student.timestamp === timestamp && student.id !== selectedStudent
      );

      if (studentWithSameTimestamp) {
        // Уведомляем пользователя, что время будет переназначено
        const confirmReassign = window.confirm(
          `Это время уже привязано к студенту ${studentWithSameTimestamp.name}. Хотите переназначить его?`
        );

        if (!confirmReassign) {
          return; // Если пользователь отказался, выходим из функции
        }

        // Убираем временную метку у предыдущего студента
        const updatedStudents = students.map((student) => {
          if (student.id === studentWithSameTimestamp.id) {
            return { ...student, timestamp: null }; // Сбрасываем временную метку
          }
          if (student.id === selectedStudent) {
            return { ...student, timestamp }; // Присваиваем новое время выбранному студенту
          }
          return student;
        });

        setStudents(updatedStudents);
        console.log(
          `Метка времени ${formatTime(timestamp)} переназначена от студента ${
            studentWithSameTimestamp.name
          } студенту с ID: ${selectedStudent}`
        );
      } else {
        // Если нет конфликтов, просто обновляем студента
        const updatedStudents = students.map((student) => {
          if (student.id === selectedStudent) {
            return { ...student, timestamp }; // Устанавливаем временную метку для выбранного студента
          }
          return student;
        });

        setStudents(updatedStudents);
        console.log(
          `Применена метка времени ${formatTime(
            timestamp
          )} для студента с ID: ${selectedStudent}`
        );
      }
    } else {
      alert("Пожалуйста, выберите студента для применения метки времени.");
    }
  };

  const handleToggleTimestampSelection = (timestamp) => {
    setSelectedTimestamps((prevSelected) => {
      if (prevSelected.includes(timestamp)) {
        console.log("Метка времени снята с выбора:", formatTime(timestamp));
        return prevSelected.filter((t) => t !== timestamp);
      } else {
        console.log("Метка времени выбрана:", formatTime(timestamp));
        return [...prevSelected, timestamp];
      }
    });
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      "Вы уверены, что хотите сбросить таймер?"
    );
    if (confirmReset) {
      setTime(0);
      setIsRunning(false);
      setStudents([]);
      setSelectedStudent(null);
      setTimestamps([]);
      setSelectedTimestamps([]);
      console.log("Таймер сброшен.");
    }
  };

  const handleSaveTime = async () => {
    // Создаем массив данных для отправки на сервер
    const timeData = students
      .map((student) => ({
        studentId: student.id, // ID студента
        time: student.timestamp !== null ? formatTime(student.timestamp) : null, // Преобразуем метку времени в строку, если она есть
      }))
      .filter((student) => student.time !== null); // Фильтруем студентов, у которых нет метки времени

    console.log("Данные для сохранения:", timeData); // Логируем данные для отладки

    try {
      // Отправляем данные на сервер
      const response = await axios.post(
        `${url}/themeJournal/addTimeToStudents/${classId}-${themeId}`, // URL для API
        timeData
      );
      console.log("Время успешно сохранено:", response.data); // Логируем успешный ответ от сервера
      alert("Время успешно сохранено!"); // Добавляем уведомление о успешном сохранении
    } catch (error) {
      // Обрабатываем ошибки запроса
      if (error.response) {
        console.error("Ошибка при сохранении времени:", error.response.data); // Логируем ошибку с сервером
        alert("Ошибка при сохранении времени: " + error.response.data.message); // Показываем ошибку пользователю
      } else if (error.request) {
        console.error("Запрос был сделан, но ответа не было:", error.request); // Логируем ошибку запроса
        alert("Ошибка сети! Не удалось получить ответ от сервера.");
      } else {
        console.error("Ошибка:", error.message); // Логируем другие ошибки
        alert("Произошла ошибка: " + error.message); // Показываем общую ошибку пользователю
      }
    }
  };

  return (
    <div className={styles.timerContainer}>
      <h1 className={styles.time}>{formatTime(time)}</h1>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${styles.largeButton}`}
          onClick={handleReset}
        >
          Сбросить
        </button>
        <button
          className={`${styles.startStopButton} ${
            isRunning ? styles.stop : styles.start
          }`}
          onClick={() => setIsRunning((prev) => !prev)}
        >
          {isRunning ? "Стоп" : "Старт"}
        </button>
        <button
          className={`${styles.button} ${styles.largeButton}`}
          onClick={handleAddTimestamp}
        >
          Круг
        </button>
      </div>
      <div className={styles.studentTable}>
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Метка времени</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className={
                  student.id === selectedStudent ? styles.selectedRow : ""
                }
                onClick={() => {
                  setSelectedStudent(student.id);
                  console.log("Выбран студент:", student.name);
                }}
              >
                <td>{student.name}</td>
                <td>
                  {student.timestamp !== null
                    ? formatTime(student.timestamp)
                    : "Нет метки"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.timestampContainer}>
        <h2>Добавленное время:</h2>
        <div className={styles.timestampList}>
          <ul>
            {timestamps.map((timestamp, index) => (
              <li
                key={index}
                onClick={() => {
                  handleToggleTimestampSelection(timestamp);
                  handleApplyTimestamp(timestamp);
                }}
                className={
                  selectedTimestamps.includes(timestamp)
                    ? styles.selectedTimestamp
                    : ""
                }
              >
                {formatTime(timestamp)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        className={`${styles.button} ${styles.largeButton}`}
        onClick={handleSaveTime}
      >
        Сохранить время
      </button>
    </div>
  );
}
