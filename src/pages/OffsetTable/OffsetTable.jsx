import React, { useEffect, useState } from "react";
import styles from "../ThemeDetails/ThemeDetails.module.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { url } from "../../costants/constants";
import axios from "axios";
import { toast } from "react-toastify";

export default function OffsetTable() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Возвращаемся на предыдущую страницу
  };

  const { classId, className, subjectId, offsetName, offsetId } =
    Object.fromEntries(new URLSearchParams(location.search));

  const [students, setStudents] = useState([]);
  const [estimations, setEstimations] = useState([]);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      console.log("Fetching students...");
      const response = await axios.get(
        `${url}/student/getStudentsByClassId/${classId}`
      );
      console.log("Students fetched successfully:", response.data);
      setStudents(response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Ошибка при загрузке данных студентов");
    }
  };

  const fetchEstimations = async () => {
    try {
      console.log("Fetching estimations...");
      const response = await axios.get(`${url}/runJournal/${offsetId}`);
      console.log("Estimations fetched successfully:", response.data);
      setEstimations(response.data); // Сохраняем оценки
    } catch (err) {
      console.error("Error fetching estimations:", err);
      setError("Ошибка при загрузке данных оценок");
    }
  };

  const handleNavigateToTimer = () => {
    console.log("Navigating to timer...");
    navigate(
      `/timer?subjectId=${subjectId}&classId=${classId}&offsetId=${offsetId}`
    );
  };

  useEffect(() => {
    console.log("Component mounted. Fetching data...");
    fetchStudents();
    fetchEstimations(); // Получаем оценки при загрузке компонента
  }, []);

  if (error) {
    console.error("Error occurred:", error);
    return <p className={styles.error}>{error}</p>;
  }

  console.log("Rendering table with students and estimations...");
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Тема: {offsetName}</h2>
      <button onClick={handleNavigateToTimer} className={styles.button}>
        Таймер
      </button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Имя студента</th>
            <th>Время</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            // Находим соответствующую оценку для студента
            const estimation = estimations.find(
              (record) => record.student.studentId === student.studentId // Изменено здесь
            );
            console.log(
              `Student: ${student.fullName}, Estimation: ${
                estimation ? estimation.estimation : "Нет данных"
              }`
            );
            return (
              <tr key={student.studentId}>
                <td>{student.fullName}</td>
                <td>{estimation ? estimation.estimation : "Нет данных"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        className={`${styles.button} ${styles.largeButton}`}
        onClick={handleGoBack}
      >
        Назад
      </button>
    </div>
  );
}
