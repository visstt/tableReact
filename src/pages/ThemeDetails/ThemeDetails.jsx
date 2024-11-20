import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify"; // Импорт уведомлений
import styles from "./ThemeDetails.module.css";
import { url } from "../../costants/constants"; // Убедитесь, что этот путь корректен

function ThemeDetails() {
  const [students, setStudents] = useState([]);
  const [themeDetails, setThemeDetails] = useState(null);
  const [localEstimates, setLocalEstimates] = useState({});
  const [selectedStudents, setSelectedStudents] = useState({});
  const [selectedColumn, setSelectedColumn] = useState("estimation1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const { classId, className, subjectName, themeName, themeId } =
    Object.fromEntries(new URLSearchParams(location.search));

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

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const applyScoreToSelected = (value) => {
    const updatedEstimates = { ...localEstimates };

    Object.keys(selectedStudents).forEach((studentId) => {
      if (selectedStudents[studentId]) {
        if (!updatedEstimates[studentId]) {
          updatedEstimates[studentId] = {};
        }
        updatedEstimates[studentId][selectedColumn] = value;
      }
    });

    setLocalEstimates(updatedEstimates);
  };

  const handleSave = async () => {
    const recordsToSave = students.map((student) => {
      const { estimation1, estimation2, estimation3, estimation4 } =
        localEstimates[student.studentId] || {};
      return {
        studentId: student.studentId,
        subjectId: themeDetails.subjectId,
        themeId,
        classId,
        estimation1: estimation1 || null,
        estimation2: estimation2 || null,
        estimation3: estimation3 || null,
        estimation4: estimation4 || null,
      };
    });

    try {
      await axios.post(
        `${url}/themeJournal/addJournalRecord/${classId}-${themeId}`,
        recordsToSave
      );
      fetchStudents();
      toast.success("Оценки успешно сохранены!"); // Успешное уведомление
    } catch {
      toast.error("Ошибка при сохранении оценок!"); // Уведомление об ошибке
    }
  };

  useEffect(() => {
    if (themeId) {
      fetchThemeDetails();
      fetchStudents();
      fetchThemeJournal();
    }
  }, [themeId]);

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
                      <td className={styles.fullNameCell}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={!!selectedStudents[student.studentId]}
                            onChange={() =>
                              toggleStudentSelection(student.studentId)
                            }
                          />
                          {student.fullName}
                        </label>
                      </td>
                      {Array(4)
                        .fill(" ")
                        .map((_, idx) => {
                          const estimationKey = `estimation${idx + 1}`;
                          const value = record[estimationKey] || "";

                          return (
                            <td
                              key={idx}
                              className={`${styles.selectCell} ${getScoreClass(
                                value
                              )}`}
                            >
                              <select
                                className={`${
                                  styles.scoreSelect
                                } ${getScoreClass(value)}`}
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
                            </td>
                          );
                        })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">Студенты не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.actions}>
          <select
            className={styles.columnSelect}
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            <option value="estimation1">Столбец 1</option>
            <option value="estimation2">Столбец 2</option>
            <option value="estimation3">Столбец 3</option>
            <option value="estimation4">Столбец 4</option>
          </select>
          <select
            className={styles.columnSelect}
            onChange={(e) => applyScoreToSelected(e.target.value)}
          >
            <option value="">Выбрать оценку</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="н">Н</option>
            <option value="б">Б</option>
          </select>
        </div>
        <button className={styles.button} onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </div>
  );
}

export default ThemeDetails;
