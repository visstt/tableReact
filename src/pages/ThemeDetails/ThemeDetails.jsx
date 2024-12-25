import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./ThemeDetails.module.css";
import { url } from "../../costants/constants";
import comment from "../../../public/comment.svg";

function ThemeDetails() {
  const [students, setStudents] = useState([]);
  const [themeDetails, setThemeDetails] = useState(null);
  const [localEstimates, setLocalEstimates] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("estimation1");
  const [selectedScore, setSelectedScore] = useState("5");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentComment, setCurrentComment] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentEstimationKey, setCurrentEstimationKey] = useState("");
  const location = useLocation();
  const [applyCommentToAll, setApplyCommentToAll] = useState(false);
  const [theoryText, setTheoryText] = useState("");
  const [isTheoryVisible, setIsTheoryVisible] = useState(false);
  const navigate = useNavigate();

  const { classId, className, subjectName, subjectId, themeName, themeId } =
    Object.fromEntries(new URLSearchParams(location.search));

  // Состояния для записи голоса
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState("");

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${url}/student/getStudentsByClassId/${classId}`
      );
      setStudents(response.data);
    } catch {
      setError("Ошибка при загрузке данных студентов");
    }
  };

  const fetchTheory = async () => {
    try {
      const response = await axios.get(`${url}/theory/${themeId}`);
      setTheoryText(response.data.theoryText); // Устанавливаем текст теории
    } catch {
      setError("Ошибка при загрузке теории");
    }
  };

  const toggleTheoryVisibility = () => {
    setIsTheoryVisible((prev) => !prev); // Переключаем видимость текста теории
  };

  const fetchThemeDetails = async () => {
    try {
      const response = await axios.get(`${url}/theme/${themeId}`);
      setThemeDetails(response.data);
    } catch {
      setError("Ошибка при загрузке данных темы");
    } finally {
      setLoading(false);
    }
  };

  const fetchThemeJournal = async () => {
    try {
      console.log("Начинаем загрузку данных темы журнала..."); // Лог перед запросом
      const response = await axios.get(`${url}/themeJournal/${themeId}`);
      console.log("Данные успешно загружены:", response.data); // Лог после успешного получения данных

      const initialEstimates = response.data.reduce((acc, record) => {
        // Проверяем, что studentId существует в объекте student
        if (record.student && record.student.studentId) {
          const studentId = record.student.studentId; // Извлекаем studentId
          acc[studentId] = {
            estimation1: record.estimation1 || null, // Устанавливаем значение по умолчанию
            estimation2: record.estimation2 || null,
            estimation3: record.estimation3 || null,
            estimation4: record.estimation4 || null,
            coment1: record.coment1 || null,
            coment2: record.coment2 || null,
            coment3: record.coment3 || null,
            coment4: record.coment4 || null,
          };
        } else {
          console.warn("Отсутствует studentId в записи:", record); // Лог предупреждения
        }
        return acc;
      }, {});

      console.log("Начальные оценки установлены:", initialEstimates); // Лог после обработки данных
      setLocalEstimates(initialEstimates);
    } catch (error) {
      console.error("Ошибка при загрузке оценок:", error); // Лог ошибки
      setError("Ошибка при загрузке оценок");
    }
  };

  const handleScoreChange = (e, studentId, estimationKey) => {
    const value = e.target.value;

    setLocalEstimates((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [estimationKey]: value,
      },
    }));

    if (value === "2") {
      setCurrentStudent(studentId); // Устанавливаем текущего студента
      setCurrentEstimationKey(estimationKey); // Устанавливаем ключ оценки
      setApplyCommentToAll(false);
      setShowModal(true);
    }
  };

  const handleSetScoreForSelected = (score) => {
    const hasSelectedScoreTwo = score === "2";

    setLocalEstimates((prev) => {
      const updatedEstimates = { ...prev };

      selectedStudents.forEach((studentId) => {
        if (!updatedEstimates[studentId]) {
          updatedEstimates[studentId] = {};
        }
        updatedEstimates[studentId][selectedColumn] = score;
      });

      return updatedEstimates;
    });

    if (hasSelectedScoreTwo) {
      setApplyCommentToAll(true);
      setShowModal(true);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleShowCommentModal = (studentId, estimationKey) => {
    const record = localEstimates[studentId] || {};
    setCurrentStudent(studentId);
    setCurrentEstimationKey(estimationKey);
    setCurrentComment(
      record[`${estimationKey.replace("estimation", "coment")}`] || ""
    );
    setShowModal(true); // Открываем модальное окно
  };

  const handleSaveComment = () => {
    setLocalEstimates((prev) => {
      const updatedEstimates = { ...prev };

      if (applyCommentToAll) {
        // Для всех выбранных студентов
        selectedStudents.forEach((studentId) => {
          updatedEstimates[studentId] = {
            ...updatedEstimates[studentId],
            [`${selectedColumn.replace("estimation", "coment")}`]:
              currentComment,
            audioComment: audioBlob, // Добавляем аудиокомментарий
          };
        });
      } else if (currentStudent) {
        // Только для одного студента
        updatedEstimates[currentStudent] = {
          ...updatedEstimates[currentStudent],
          [`${currentEstimationKey.replace("estimation", "coment")}`]:
            currentComment,
          audioComment: audioBlob, // Добавляем аудиокомментарий
        };
      }

      return updatedEstimates;
    });

    // Сброс состояния модального окна
    setShowModal(false);
    setCurrentComment("");
    setCurrentStudent(null);
    setCurrentEstimationKey("");
    setAudioBlob(null);
    setAudioURL("");
  };

  const handleCancelComment = () => {
    setShowModal(false);
    setCurrentComment("");
    setCurrentStudent(null);
    setCurrentEstimationKey("");
    setAudioBlob(null);
    setAudioURL("");
  };

  const handleSave = async () => {
    const recordsToSave = students.map((student) => {
      const record = localEstimates[student.studentId] || {};
      return {
        studentId: student.studentId,
        subjectId: subjectId,
        estimation1: record.estimation1 || null,
        estimation2: record.estimation2 || null,
        estimation3: record.estimation3 || null,
        estimation4: record.estimation4 || null,
        coment1: record.coment1 || null,
        coment2: record.coment2 || null,
        coment3: record.coment3 || null,
        coment4: record.coment4 || null,
      };
    });

    try {
      await axios.post(
        `${url}/themeJournal/addJournalRecord/${classId}-${themeId}`,
        recordsToSave
      );
      fetchStudents();
      toast.success("Оценки успешно сохранены!");
    } catch {
      toast.error("Ошибка при сохранении оценок!");
    }
  };

  const handleNavigateToRating = () => {
    navigate(`/rating/${classId}/${themeId}/${className}/${themeName}`);
  };

  const handleStopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
  };

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event) => {
      setAudioChunks((prev) => [...prev, event.data]);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/wav" }); // Изменен тип на audio/wav
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob)); // Создаем URL для воспроизведения
      setAudioChunks([]); // Сбрасываем массив аудиофрагментов
    };

    recorder.start();
    setIsRecording(true);
  };

  const handleAudioError = (e) => {
    console.error("Ошибка воспроизведения аудио:", e);
  };

  useEffect(() => {
    if (themeId) {
      fetchThemeDetails();
      fetchStudents();
      fetchThemeJournal();
      fetchTheory();
    }
  }, [themeId]);

  const getScoreClass = (score) => {
    switch (score) {
      case "5":
        return styles.score5;
      case "4":
        return styles.score4;
      case "3":
        return styles.score3;
      case "2":
        return styles.score2;
      case "н":
        return styles.scoreН;
      case "б":
        return styles.scoreБ;
      default:
        return "";
    }
  };

  const handleColumnClick = (estimation) => {
    setSelectedColumn(estimation);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Тема: {themeName}</h2>
        <h3>Предмет: {subjectName}</h3>
        <h4>Класс: {className}</h4>
        <button onClick={handleNavigateToRating} className={styles.button}>
          Рейтинг класса
        </button>
      </div>
      <div className={styles.theoryBlock}>
        <h3 onClick={toggleTheoryVisibility} className={styles.theoryTitle}>
          Теория
        </h3>
        <p
          className={`${styles.theoryText} ${
            isTheoryVisible ? styles.visible : ""
          }`}
        >
          {theoryText}
        </p>
      </div>
      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>ФИО учащегося</th>
                <th colSpan="4" className={styles.center}>
                  Оценки
                </th>
              </tr>
              <tr>
                {[
                  "",
                  "estimation1",
                  "estimation2",
                  "estimation3",
                  "estimation4",
                ].map((estimation, index) =>
                  index === 0 ? (
                    <th key={index}></th> // Пропускаем первую ячейку
                  ) : (
                    <th
                      key={index}
                      className={`${styles.columnHeader} ${
                        selectedColumn === estimation ? styles.active : ""
                      }`}
                      onClick={() => handleColumnClick(estimation)}
                    >
                      Выбрать столбец
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => {
                  const record = localEstimates[student.studentId] || {}; // Получаем оценки и время для студента

                  return (
                    <tr key={student.studentId}>
                      <td className={styles.studentNameCell}>
                        <div
                          className={styles.checkboxWrapper}
                          onClick={() => handleSelectStudent(student.studentId)}
                          style={{ cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(
                              student.studentId
                            )}
                            onChange={() =>
                              handleSelectStudent(student.studentId)
                            }
                          />
                          <span>{student.fullName}</span>
                        </div>
                      </td>
                      {Array(4)
                        .fill(" ")
                        .map((_, idx) => {
                          const estimationKey = `estimation${idx + 1}`;
                          const commentKey = `coment${idx + 1}`;
                          const value = record[estimationKey] || "";

                          return (
                            <td
                              key={idx}
                              className={`${styles.selectCell} ${getScoreClass(
                                value
                              )}`}
                            >
                              <div className={styles.cellContent}>
                                <select
                                  className={styles.scoreSelect}
                                  value={value}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      e,
                                      student.studentId,
                                      estimationKey
                                    )
                                  }
                                >
                                  <option value=""></option>
                                  <option value="5">5</option>
                                  <option value="4">4</option>
                                  <option value="3">3</option>
                                  <option value="2">2</option>
                                  <option value="н">Н</option>
                                  <option value="б">Б</option>
                                </select>
                                {record[commentKey] && (
                                  <span
                                    className={styles.commentArrow}
                                    onClick={() =>
                                      handleShowCommentModal(
                                        student.studentId,
                                        estimationKey
                                      )
                                    }
                                  >
                                    <img
                                      src={comment}
                                      alt="comment"
                                      className="comment"
                                    />
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">Нет студентов для отображения</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.saveContainer}>
          <button
            onClick={() => handleSetScoreForSelected("5")}
            className={`${styles.buttonScore} ${styles.score5}`}
          >
            5
          </button>
          <button
            onClick={() => handleSetScoreForSelected("4")}
            className={`${styles.buttonScore} ${styles.score4}`}
          >
            4
          </button>
          <button
            onClick={() => handleSetScoreForSelected("3")}
            className={`${styles.buttonScore} ${styles.score3}`}
          >
            3
          </button>
          <button
            onClick={() => handleSetScoreForSelected("2")}
            className={`${styles.buttonScore} ${styles.score2}`}
          >
            2
          </button>
          <div>
            <button onClick={handleSave} className={styles.button}>
              Сохранить
            </button>
            <button onClick={() => navigate(-1)} className={styles.button}>
              Назад
            </button>
          </div>
        </div>

        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Добавить комментарий</h3>
              <textarea
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                placeholder="Комментарий..."
                className={styles.textarea}
              />
              <div className={styles.recordingControls}>
                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className={styles.buttonMini}
                  >
                    Остановить запись
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className={styles.buttonMini}
                  >
                    Начать запись
                  </button>
                )}
                {audioURL && (
                  <audio
                    controls
                    src={audioURL}
                    className={styles.audioPlayer}
                    onError={(e) =>
                      console.error("Ошибка воспроизведения аудио:", e)
                    }
                  ></audio>
                )}
              </div>
              <button onClick={handleSaveComment} className={styles.buttonMini}>
                Сохранить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThemeDetails;
