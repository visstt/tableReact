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
      const updatedStudents = students.map((student) => {
        if (student.id === selectedStudent) {
          return { ...student, timestamp }; // Устанавливаем временную метку для выбранного студента
        }
        return student;
      });
      setStudents(updatedStudents);
      console.log(
        "Применена метка времени",
        formatTime(timestamp),
        "для студента:",
        selectedStudent
      );
      console.log("Обновленный список студентов:", updatedStudents); // Проверка обновленного состояния
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
    const timeData = students
      .map((student) => ({
        studentId: student.id,
        time: student.timestamp !== null ? formatTime(student.timestamp) : null, // Преобразуем в строку
      }))
      .filter((student) => student.time !== null);

    console.log("Данные для сохранения:", timeData);
    try {
      const response = await axios.post(
        `${url}/themeJournal/addTimeToStudents/${classId}-${themeId}`,
        timeData
      );
      console.log("Время успешно сохранено:", response.data);
    } catch (error) {
      if (error.response) {
        console.error("Ошибка при сохранении времени:", error.response.data);
      } else if (error.request) {
        console.error("Запрос был сделан, но ответа не было:", error.request);
      } else {
        console.error("Ошибка:", error.message);
      }
    }
  };

  return (
    <div className={styles.timerContainer}>
      <h1 className={styles.time}>{formatTime(time)}</h1>
      <div className={styles.buttons}>
        <button
          className={styles.button}
          onClick={() => {
            setIsRunning(true);
            console.log("Таймер запущен.");
          }}
        >
          Старт
        </button>
        <button
          className={styles.button}
          onClick={() => {
            setIsRunning(false);
            console.log("Таймер приостановлен.");
          }}
        >
          Пауза
        </button>
        <button className={styles.button} onClick={handleReset}>
          Сбросить
        </button>
        <button className={styles.button} onClick={handleAddTimestamp}>
          Добавить метку
        </button>
        <button className={styles.button} onClick={handleSaveTime}>
          Сохранить время
        </button>
      </div>
      <div className={styles.studentTable}>
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Метка времени</th>
              <th>Выбрать</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className={
                  student.id === selectedStudent ? styles.selectedRow : ""
                }
              >
                <td>{student.name}</td>
                <td>
                  {student.timestamp !== null
                    ? formatTime(student.timestamp)
                    : "Нет метки"}
                </td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedStudent(student.id);
                      console.log("Выбран студент:", student.name);
                    }}
                  >
                    Выбрать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.timestampContainer}>
        <h2>Добавленные метки:</h2>
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
    </div>
  );
}
