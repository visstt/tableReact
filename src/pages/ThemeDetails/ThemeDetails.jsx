import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function ThemeDetails() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Получаем classId из state, переданного через Link
  const { classId, className } = location.state || {};

  useEffect(() => {
    console.log("Полученный classId из state:", classId); // Логирование для проверки

    if (classId) {
      const fetchStudents = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/student/getStudentsByClassId/${classId}`
          );
          if (!response.ok) {
            throw new Error("Ошибка при загрузке студентов");
          }
          const data = await response.json();
          setStudents(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchStudents();
    } else {
      setError("classId не найден!");
      setLoading(false);
    }
  }, [classId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Список студентов для класса: {className}</h2>
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
