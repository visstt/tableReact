import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function ThemeDetails() {
  const [themeDetails, setThemeDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const { classId, className, subjectName, themeName, themeId } =
    Object.fromEntries(new URLSearchParams(location.search));

  // Функция для загрузки данных студентов
  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/student/getStudentsByClassId/${classId}`
      );
      setStudents(response.data);
    } catch (err) {
      setError("Ошибка при загрузке данных студентов");
    }
  };

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/theme/${themeId}`
        );
        setThemeDetails(response.data);
      } catch (err) {
        setError("Ошибка при загрузке данных темы");
      } finally {
        setLoading(false);
      }
    };

    if (themeId) {
      fetchThemeDetails();
      fetchStudents(); // Загружаем студентов
    }
  }, [themeId, classId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Тема: {themeName}</h2>
      <h3>Предмет: {subjectName}</h3>
      <h4>Класс: {className}</h4>

      <h3>Студенты класса:</h3>
      {students.length > 0 ? (
        <ul>
          {students.map((student) => (
            <li key={student.studentId}>{student.fullName}</li>
          ))}
        </ul>
      ) : (
        <p>Студенты не найдены</p>
      )}
    </div>
  );
}

export default ThemeDetails;
