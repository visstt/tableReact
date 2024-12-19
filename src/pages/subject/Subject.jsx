import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Subject.module.css"; // Ensure this is your CSS module for Subject styles
import { url } from "../../costants/constants"; // Ensure the path is correct
import Sidebar from "../Sidebar/Sidebar"; // Import the Sidebar component

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
          `${url}/subject/getSubjects/${classId}`
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
      <Sidebar />
      <div className={styles.content}>
        <h2 className={styles.heading}>Предметы для класса: {className}</h2>
        {subjects.map((subject) => (
          <div
            key={subject.subjectId}
            className={`${styles.subject} ${getSubjectColor(
              subject.subjectName
            )}`}
          >
            <Link
              to={`/theme/?classId=${classId}&className=${className}&subjectName=${subject.subjectName}`}
              style={{
                width: "100%",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div className={styles.Subject}>
                <i className="fas fa-book"></i> {subject.subjectName}
              </div>
            </Link>
          </div>
        ))}
        <div className={styles.backButton}>
          <button onClick={() => navigate(-1)} className={styles.button}>
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

// Function to determine the subject card color based on subject name
const getSubjectColor = (subjectName) => {
  if (subjectName === "Физкультура") return styles.green;
  if (subjectName === "Физика") return styles.blue;
  if (subjectName === "Русский язык") return styles.orange;
  if (subjectName === "Английский язык") return styles.lightblue;
  if (subjectName === "Французский язык") return styles.purple;
  if (subjectName === "Алгебра") return styles.brown;
  if (subjectName === "Химия") return styles.teal;
  if (subjectName === "История Российского государства") return styles.red;
  return styles.default; // Default color if no match
};

export default Subject;
