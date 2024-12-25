import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Импортируем useNavigate и useLocation
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
  const [timeData, setTimeData] = useState([]);
  const location = useLocation(); // Правильное использование useLocation
  const navigate = useNavigate(); // Создаем объект navigate
  const [modalOpen, setModalOpen] = useState(false);
  const [manualTime, setManualTime] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null); // ID студента, для которого редактируем время
  const [confirmLeave, setConfirmLeave] = useState(false); // Состояние для модального окна подтверждения выхода

  const offsetId = new URLSearchParams(location.search).get("offsetId");
  const classId = new URLSearchParams(location.search).get("classId");
  const subjectId = new URLSearchParams(location.search).get("subjectId");

  const { themeId, studentId, studentName } = useParams();

  const handleGoBack = () => {
    const hasEmptyTimestamps = students.some(
      (student) => student.timestamp === null
    );
    if (hasEmptyTimestamps) {
      setConfirmLeave(true); // Открываем модальное окно подтверждения
    } else {
      navigate(-1); // Возвращаемся на предыдущую страницу
    }
  };

  const handleLeave = () => {
    setConfirmLeave(false); // Закрываем модальное окно
    navigate(-1); // Возвращаемся на предыдущую страницу
  };

  const handleStay = () => {
    setConfirmLeave(false); // Закрываем модальное окно
  };

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
        const response = await axios.get(`${url}/runJournal/${offsetId}`);
        const timeData = response.data.map((entry) => entry.time);
        console.log("Временные метки загружены:", timeData);
        setTimeData(timeData);
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
    if (time === null || time === undefined || isNaN(time)) return "Нет метки";
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
      const studentWithSameTimestamp = students.find(
        (student) =>
          student.timestamp === timestamp && student.id !== selectedStudent
      );

      if (studentWithSameTimestamp) {
        const confirmReassign = window.confirm(
          `Это время уже привязано к студенту ${studentWithSameTimestamp.name}. Хотите переназначить его?`
        );

        if (!confirmReassign) {
          return;
        }

        const updatedStudents = students.map((student) => {
          if (student.id === studentWithSameTimestamp.id) {
            return { ...student, timestamp: null };
          }
          if (student.id === selectedStudent) {
            return { ...student, timestamp };
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
        const updatedStudents = students.map((student) => {
          if (student.id === selectedStudent) {
            return { ...student, timestamp };
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
        subjectId: student.subjectId,
        time: student.timestamp !== null ? student.timestamp : null,
      }))
      .filter((student) => student.time !== null);

    console.log("Данные для сохранения:", timeData);

    try {
      const response = await axios.post(
        `${url}/runJournal/addTimeToStudents/${classId}-${offsetId}-${subjectId}`,
        timeData
      );
      console.log("Время успешно сохранено:", response.data);
      alert("Время успешно сохранено!");
    } catch (error) {
      if (error.response) {
        console.error("Ошибка при сохранении времени:", error.response.data);
        alert("Ошибка при сохранении времени: " + error.response.data.message);
      } else if (error.request) {
        console.error("Запрос был сделан, но ответа не было:", error.request);
        alert("Ошибка сети! Не удалось получить ответ от сервера.");
      } else {
        console.error("Ошибка:", error.message);
        alert("Произошла ошибка: " + error.message);
      }
    }
  };

  const handleOpenModal = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student && student.timestamp === null) {
      setEditingStudentId(studentId);
      setManualTime(""); // Сбросить поле ввода
      setModalOpen(true);
    } else {
      alert("У этого студента уже есть метка времени.");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setManualTime("");
    setEditingStudentId(null);
  };

  const handleManualTimeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Удаляем все нецифровые символы
    let formattedValue = "";

    if (value.length > 0) {
      formattedValue += value.substring(0, 2); // Первые 2 цифры для минут
    }
    if (value.length > 2) {
      formattedValue += ":" + value.substring(2, 4); // Следующие 2 цифры для секунд
    }
    if (value.length > 4) {
      formattedValue += ":" + value.substring(4, 7); // Следующие 3 цифры для миллисекунд
    }

    setManualTime(formattedValue);
  };

  const handleSaveManualTime = () => {
    const parsedTime = manualTime.split(":");
    const minutes = parseInt(parsedTime[0]) || 0;
    const seconds = parseInt(parsedTime[1]) || 0;
    const milliseconds = parseInt(parsedTime[2]) || 0; // Добавляем миллисекунды

    // Проверка на максимальные значения
    if (minutes > 59 || seconds > 59 || milliseconds > 999) {
      alert("Пожалуйста, введите время в формате не более 59:59:999.");
      return;
    }

    const newTimestamp = (minutes * 60 + seconds) * 1000 + milliseconds; // Преобразуем в миллисекунды

    const updatedStudents = students.map((student) => {
      if (student.id === editingStudentId) {
        return { ...student, timestamp: newTimestamp };
      }
      return student;
    });

    setStudents(updatedStudents);
    console.log("Метка времени обновлена :", formatTime(newTimestamp));
    handleCloseModal();
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

      <div className={styles.container}>
        <div className={styles.studentTable}>
          <table>
            <thead>
              <tr>
                <th>Имя </th>
                <th>Метка времени</th>
              </tr>
            </thead>
            <tbody>
              {students
                .sort((a, b) =>
                  a.timestamp === null ? -1 : b.timestamp === null ? 1 : 0
                ) // Сортировка
                .map((student) => (
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
                    <td
                      onClick={() => {
                        handleOpenModal(student.id); // Передаем ID студента
                      }}
                    >
                      {student.timestamp !== null
                        ? formatTime(student.timestamp)
                        : "Нет метки"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className={styles.savedTimeContainer}>
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
      <div className={styles.btnContainer}>
        <button
          className={`${styles.button} ${styles.largeButton}`}
          onClick={handleSaveTime}
        >
          Сохранить время
        </button>
        <button
          className={`${styles.button} ${styles.largeButton}`}
          onClick={handleGoBack}
        >
          Назад
        </button>
      </div>

      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Введите время вручную</h2>
            <input
              type="text"
              value={manualTime}
              onChange={handleManualTimeChange}
              placeholder="MM:SS:MMM" // Плейсхолдер
              maxLength={10} // Максимальная длина ввода
            />
            <button onClick={handleSaveManualTime}>Сохранить</button>
            <button onClick={handleCloseModal}>Закрыть</button>
          </div>
        </div>
      )}

      {confirmLeave && (
        <div className={styles.modal2}>
          <div className={styles.modalContent2}>
            <h2>
              У некоторых студентов нет меток времени. Вы уверены, что хотите
              покинуть страницу?
            </h2>
            <div className={styles.btnWrapper}>
              <button onClick={handleStay} className={styles.brightButton2}>
                Остаться
              </button>
              <button onClick={handleLeave} className={styles.brightButton}>
                Уйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
