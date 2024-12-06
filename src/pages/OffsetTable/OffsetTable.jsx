import React, { useEffect, useState } from "react";
import styles from "../ThemeDetails/ThemeDetails.module.css"; // Убедитесь, что у вас есть стили для таблицы
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { url } from "../../costants/constants";
import axios from "axios";

export default function OffsetTable() {
  const location = useLocation();
  const navigate = useNavigate();

  const { classId, className, subjectId, offsetName, offsetId } =
    Object.fromEntries(new URLSearchParams(location.search));

  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [grades, setGrades] = useState({}); // Состояние для хранения оценок

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
    fetchStudents();
  }, []);



  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Список студентов для {offsetName}</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Имя студента</th>
            <th>Оценка</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.studentId}>
              <td>{student.fullName}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
