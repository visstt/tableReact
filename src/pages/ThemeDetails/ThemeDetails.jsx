import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./ThemeDetails.module.css";
import { url } from "../../costants/constants";

function ThemeDetails() {
  const [themeDetails, setThemeDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState(""); // Для хранения заметок преподавателя
  const location = useLocation();

  const { classId, className, subjectName, themeName, themeId } =
    Object.fromEntries(new URLSearchParams(location.search));

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${url}/student/getStudentsByClassId/${classId}`
      );
      setStudents(response.data);
    } catch (err) {
      setError("Ошибка при загрузке данных студентов");
    }
  };

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        const response = await axios.get(`${url}/theme/${themeId}`);
        setThemeDetails(response.data);
      } catch (err) {
        setError("Ошибка при загрузке данных темы");
      } finally {
        setLoading(false);
      }
    };

    if (themeId) {
      fetchThemeDetails();
      fetchStudents();
    }
  }, [themeId, classId]);

  const handleScoreChange = (e) => {
    const selectCell = e.target.closest("td");
    const selectElement = e.target;

    const setColor = (color) => {
      selectCell.style.backgroundColor = color;
      selectElement.style.backgroundColor = color;
    };

    switch (e.target.value) {
      case "5":
        setColor("#D2FFBA");
        break;
      case "4":
        setColor("#FBFF89");
        break;
      case "3":
        setColor("#FFD38D");
        break;
      case "2":
        setColor("#FFD2D2");
        break;
      case "н":
        setColor("#FFBE86");
        break;
      case "б":
        setColor("#FFA4A4");
        break;
      default:
        setColor(""); // Сбрасываем цвет
    }
  };

  const handleNoteChange = (e) => {
    setNotes(e.target.value); // Обновляем заметки
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
                <th colSpan="5">Оценки</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.studentId}>
                    <td>{student.fullName}</td>
                    {Array(5)
                      .fill("")
                      .map((_, idx) => (
                        <td key={idx} className={styles.selectCell}>
                          <select
                            className={styles.scoreSelect}
                            onChange={(e) => handleScoreChange(e)}
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
                      ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Студенты не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.notesContainer}>
          <h4>Заметки преподавателя</h4>
          <textarea
            className={styles.notesTextarea}
            value={notes}
            onChange={handleNoteChange}
            placeholder="Введите заметки..."
          />
        </div>
      </div>

      <Link
        to={{
          pathname: "/rating",
          search: `?classId=${classId}&className=${className}&themeName=${themeName}`,
        }}
      >
        <button className={styles.button}>Рейтинг класса</button>
      </Link>
    </div>
  );
}

export default ThemeDetails;
