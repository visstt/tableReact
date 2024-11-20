import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./ThemeDetails.module.css";
import { url } from "../../costants/constants";

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

  const { classId, className, subjectName, themeName, themeId } =
    Object.fromEntries(new URLSearchParams(location.search));

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
  };

  const handleSetScoreForSelected = () => {
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
    setShowModal(true);
  };

  const handleSaveComment = () => {
    setLocalEstimates((prev) => ({
      ...prev,
      [currentStudent]: {
        ...prev[currentStudent],
        [`${currentEstimationKey.replace("estimation", "coment")}`]:
          currentComment,
      },
    }));
    setShowModal(false);
    setCurrentComment("");
    setCurrentStudent(null);
    setCurrentEstimationKey("");
  };

  const handleCancelComment = () => {
    setShowModal(false);
    setCurrentComment("");
    setCurrentStudent(null);
    setCurrentEstimationKey("");
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
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => {
                  const record = localEstimates[student.studentId] || {};
                  return (
                    <tr key={student.studentId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.studentId)}
                          onChange={() =>
                            handleSelectStudent(student.studentId)
                          }
                        />
                        {student.fullName}
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
                                    ↓
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
        <div className={styles.selectActions}>
          <label htmlFor="columnSelect">Столбец:</label>
          <select
            id="columnSelect"
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className={styles.scoreSelect}
          >
            <option value="estimation1">1</option>
            <option value="estimation2">2</option>
            <option value="estimation3">3</option>
            <option value="estimation4">4</option>
          </select>
          <label htmlFor="scoreSelect">Оценка:</label>
          <select
            id="scoreSelect"
            value={selectedScore}
            onChange={(e) => setSelectedScore(e.target.value)}
            className={styles.scoreSelect}
          >
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="н">Н</option>
            <option value="б">Б</option>
          </select>
          <button
            onClick={handleSetScoreForSelected}
            className={styles.buttonMini}
          >
            Применить
          </button>
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
