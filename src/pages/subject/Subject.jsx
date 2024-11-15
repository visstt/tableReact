import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Subject.module.css";
import { url } from "../../costants/constants";

function Subject() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const classId = new URLSearchParams(location.search).get("classId");
  const className =
    new URLSearchParams(location.search).get("className") ||
    "неизвестного класса";

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `${url}/classSubject/getSubjects/${classId}`
        );
        setSubjects(response.data);
      } catch (err) {
        setError("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchSubjects();
    }
  }, [classId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Предметы для класса: {className}</h2>
        {subjects.map((subject) => (
          <Link
            key={subject.subjectId}
            to={`/theme/${subject.subjectId}?classId=${classId}&className=${className}&subjectName=${subject.subjectName}`}
          >
            <button className={styles.button}>{subject.subjectName}</button>
          </Link>
        ))}
        <button className={styles.btn} onClick={() => navigate(-1)}>
          Назад
        </button>
      </div>
    </div>
  );
}

export default Subject;
