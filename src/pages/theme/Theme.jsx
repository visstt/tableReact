import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

function Theme() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Получаем classId и subjectName из query-параметров
  const classId = new URLSearchParams(location.search).get("classId");
  const className = new URLSearchParams(location.search).get("className");
  const subjectName = new URLSearchParams(location.search).get("subjectName");

  const [subjectId, setSubjectId] = useState(null); // Состояние для subjectId

  // Функция для получения subjectId по subjectName
  const fetchSubjectId = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/classSubject/getSubjects/${classId}`
      );
      // Ищем subjectId по subjectName
      const subject = response.data.find(
        (subj) => subj.subjectName === subjectName
      );
      if (subject) {
        setSubjectId(subject.subjectId); // Устанавливаем subjectId
      } else {
        setError("Предмет не найден");
      }
    } catch (err) {
      setError("Ошибка при загрузке предметов");
    }
  };

  useEffect(() => {
    if (classId && subjectName) {
      fetchSubjectId();
    }
  }, [classId, subjectName]);

  // Функция для загрузки тем по subjectId
  const fetchThemes = async () => {
    if (!subjectId) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/theme/getAllThemes/${subjectId}`
      );
      setThemes(response.data);
    } catch (err) {
      setError("Ошибка при загрузке тем");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchThemes();
    }
  }, [subjectId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Темы для предмета: {subjectName}</h2>
      {themes.length > 0 ? (
        <ul>
          {themes.map((theme) => (
            <li key={theme.themeId}>
              <Link
                to={`/themeDetails?classId=${classId}&className=${className}&subjectName=${subjectName}&themeName=${theme.themeName}&themeId=${theme.themeId}`}
              >
                {theme.themeName}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Темы не найдены</p>
      )}
    </div>
  );
}

export default Theme;
