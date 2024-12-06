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

  const navigate = useNavigate();

  const { classId, className, subjectName, themeName, themeId } =
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
      const response = await axios.get(`${url}/themeJournal/${themeId}`);

      const initialEstimates = response.data.reduce((acc, record) => {
        acc[record.studentId] = {
          estimation1: record.estimation1,
          estimation2: record.estimation2,
          estimation3: record.estimation3,
          estimation4: record.estimation4,
          coment1: record.coment1,
          coment2: record.coment2,
          coment3: record.coment3,
          coment4: record.coment4,
          audioComment: record.audioComment || null,
          time: record.time, // Сохраняем аудиокомментарий
        };
        return acc;
      }, {});

      setLocalEstimates(initialEstimates);
    } catch {
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

  const handleSetScoreForSelected = () => {
    const hasSelectedScoreTwo = selectedScore === "2";

    setLocalEstimates((prev) => {
      const updatedEstimates = { ...prev };

      selectedStudents.forEach((studentId) => {
        if (!updatedEstimates[studentId]) {
          updatedEstimates[studentId] = {};
        }
        updatedEstimates[studentId][selectedColumn] = selectedScore;
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
        subjectId: themeDetails.subjectId,
        themeId,
        classId,
        estimation1: record.estimation1 || null,
        estimation2: record.estimation2 || null,
        estimation3: record.estimation3 || null,
        estimation4: record.estimation4 || null,
        coment1: record.coment1 || null,
        coment2: record.coment2 || null,
        coment3: record.coment3 || null,
        coment4: record.coment4 || null,
        audioComment: record.audioComment || null,
        time: record.time || null,
        // Сохраняем аудиокомментарий
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
  const handleNavigateToTimer = (studentId, studentName) => {
    navigate(`/timer/${classId}/${themeId}`);
  };
  // Обработка ошибок воспроизведения аудио
  const handleAudioError = (e) => {
    console.error("Ошибка воспроизведения аудио:", e);
  };

  // В компоненте <audio> добавляем обработчик ошибок
  <audio
    controls
    src={audioURL}
    className={styles.audioPlayer}
    onError={handleAudioError} // Добавлен обработчик ошибок
  ></audio>;
  useEffect(() => {
    if (themeId) {
      fetchThemeDetails();
      fetchStudents();
      fetchThemeJournal();
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
        <button onClick={handleNavigateToTimer} className={styles.button}>
          Таймер
        </button>
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
                <th>Время</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => {
                  const record = localEstimates[student.studentId] || {}; // Получаем оценки и время для студента
                  const studentTime = record.time || "Не задано"; // Время для студента

                  return (
                    <tr key={student.studentId}>
                      <td>
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
                      <td>{studentTime}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">Нет студентов для отображения</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.selectActions}>
          <div>
            <label>Столбец:</label>
            <div className={styles.buttonGroup}>
              {["estimation1", "estimation2", "estimation3", "estimation4"].map(
                (estimation, index) => (
                  <button
                    key={index}
                    className={`${styles.buttonChoose} ${
                      selectedColumn === estimation ? styles.active : ""
                    }`}
                    onClick={() => setSelectedColumn(estimation)}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label>Оценка:</label>
            <div className={styles.buttonGroup}>
              {["5", "4", "3", "2", "н", "б"].map((score) => (
                <button
                  key={score}
                  className={`${styles.buttonChoose} ${
                    selectedScore === score ? styles.active : ""
                  }`}
                  onClick={() => {
                    selectedStudents.forEach((studentId) => {
                      handleScoreChange(
                        { target: { value: score } },
                        studentId,
                        selectedColumn
                      );
                    });
                  }}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.saveContainer}>
          <button onClick={handleSave} className={styles.button}>
            Сохранить
          </button>
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
              <button
                onClick={handleCancelComment}
                className={styles.buttonMini}
              >
                Отменить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThemeDetails;
