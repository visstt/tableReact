import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import styles from "./Theme.module.css";
import { url } from "../../costants/constants";

function Theme() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const classId = new URLSearchParams(location.search).get("classId");
  const className = new URLSearchParams(location.search).get("className");
  const subjectName = new URLSearchParams(location.search).get("subjectName");

  const [subjectId, setSubjectId] = useState(null);

  const fetchSubjectId = async () => {
    try {
      const response = await axios.get(
        `${url}/classSubject/getSubjects/${classId}`
      );
      const subject = response.data.find(
        (subj) => subj.subjectName === subjectName
      );
      if (subject) {
        setSubjectId(subject.subjectId);
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

  const fetchThemes = async () => {
    if (!subjectId) return;

    try {
      const response = await axios.get(
        `${url}/theme/getAllThemes/${subjectId}`
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

  if (loading) return <p className={styles.message}>Загрузка...</p>;
  if (error) return <p className={styles.message}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Темы для предмета: {subjectName}</h2>
      {themes.length > 0 ? (
        <ul>
          {themes.map((theme) => (
            <li key={theme.themeId}>
              <Link
                className={styles.button}
                to={`/themeDetails?classId=${classId}&className=${className}&subjectName=${subjectName}&themeName=${theme.themeName}&themeId=${theme.themeId}`}
              >
                {theme.themeName}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.message}>Темы не найдены</p>
      )}
    </div>
  );
}

export default Theme;
