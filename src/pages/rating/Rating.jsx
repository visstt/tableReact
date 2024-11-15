import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./Rating.module.css";
import { url } from "../../costants/constants";

const Rating = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const { classId, className, themeName } = Object.fromEntries(
    new URLSearchParams(location.search)
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${url}/student/getStudentsByClassId/${classId}`
        );
        const updatedStudents = response.data.map((student) => ({
          ...student,
          rating: "", // Добавляем атрибут rating на фронте
        }));
        setStudents(updatedStudents);
      } catch (err) {
        setError("Ошибка при загрузке данных студентов");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>Рейтинг класса: {className}</h2>
      <h3>Тема: {themeName}</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ФИО учащегося</th>
            <th>
              <input type="text" placeholder="введите тему" />
            </th>
            <th>
              <input type="text" placeholder="введите тему" />
            </th>
            <th>
              <input type="text" placeholder="введите тему" />
            </th>
            <th>
              <input type="text" placeholder="введите тему" />
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.studentId}>
              <td>{student.fullName}</td>
              <td>
                <input
                  type="text"
                  defaultValue={student.rating}
                  onChange={(e) => {
                    const newRating = e.target.value;
                    const updatedStudents = students.map((s, i) =>
                      i === index ? { ...s, rating: newRating } : s
                    );
                    setStudents(updatedStudents);
                  }}
                  className={
                    student.rating.startsWith("-")
                      ? styles.negative
                      : student.rating.startsWith("+")
                      ? styles.positive
                      : ""
                  }
                />
              </td>
              <td>
                <input type="text" />
              </td>
              <td>
                <input type="text" />
              </td>
              <td>
                <input type="text" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rating;
