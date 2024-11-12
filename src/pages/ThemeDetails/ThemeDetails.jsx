import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function ThemeDetails() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Получаем параметры из строки запроса
  const classId = new URLSearchParams(location.search).get("classId");
  const themeId = new URLSearchParams(location.search).get("themeId");

  // Функция для загрузки студентов
  const fetchStudents = async () => {
    if (!classId) {
      console.error("classId не найден!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/student/getStudentsByClassId/${classId}`
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке студентов:", error);
      setError("Ошибка при загрузке студентов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Список студентов для класса: {classId}</h2>
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Возраст</th>
            <th>Класс</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.studentId}>
                <td>{student.name}</td>
                <td>{student.age}</td>
                <td>{student.className}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Студенты не найдены для этого класса</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ThemeDetails;
