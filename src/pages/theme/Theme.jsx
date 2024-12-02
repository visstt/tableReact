import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Theme.module.css";
import { url } from "../../costants/constants"; // Correct the path if needed
import Sidebar from "../Sidebar/Sidebar"; // Import the Sidebar component
function Theme() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const getThemeClass = (themeName) => {
    switch (themeName) {
      case "Физкультура":
        return styles.theme - physical - education;
      case "Физика":
        return styles.theme - physics;
      case "Русский язык":
        return styles.theme - russian;
      case "Английский язык":
        return styles.theme - english;
      case "Французский язык":
        return styles.theme - french;
      case "Литература":
        return styles.theme - literature;
      case "Химия":
        return styles.theme - chemistry;
      case "История":
        return styles.theme - history;
      default:
        return "";
    }
  };

  if (loading) return <p className={styles.message}>Загрузка...</p>;
  if (error) return <p className={styles.message}>{error}</p>;

  return (
    <div className={styles.body}>
      <Sidebar />
      <div className={styles.container}>
        {themes.length > 0 ? (
          <ul>
            {themes.map((theme) => (
              <li key={theme.themeId}>
                <Link
                  className={`${styles.button} ${getThemeClass(
                    theme.themeName
                  )}`}
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
        <div className={styles.backArrow}>
          <i className="fas fa-arrow-left" onClick={() => navigate(-1)}></i>
        </div>
      </div>
    </div>
  );
}

export default Theme;
