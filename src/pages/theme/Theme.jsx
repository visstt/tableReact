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
      const response = await axios.get(`${url}/subject/getSubjects/${classId}`);
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

  // Массив с классами для фона тем
  const colorClasses = [
    styles.green,
    styles.blue,
    styles.orange,
    styles.lightblue,
    styles.purple,
    styles.brown,
    styles.teal,
    styles.red,
  ];

  return (
    <div className={styles.body}>
      <Sidebar />
      <div className={styles.container}>
        {themes.length > 0 ? (
          <ul>
            <Link
              className={styles.buttonMini}
              to={`/offset?subjectId=${subjectId}&classId=${classId}&className=${className}&subjectName=${subjectName}`}
            >
              <li>Зачеты</li>
            </Link>
            {themes.map((theme, index) => (
              <Link
                className={`${styles.button} ${
                  colorClasses[index % colorClasses.length]
                }`}
                to={`/themeDetails?subjectId=${subjectId}&classId=${classId}&className=${className}&subjectName=${subjectName}&themeName=${theme.themeName}&themeId=${theme.themeId}`}
              >
                <li key={theme.themeId}>{theme.themeName}</li>
              </Link>
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
