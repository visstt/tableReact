import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Subject() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const classId = new URLSearchParams(location.search).get("classId");
  const className =
    new URLSearchParams(location.search).get("className") ||
    "неизвестного класса";

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/classSubject/getSubjects/${classId}`
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
    <div>
      <h2>Предметы для класса: {className}</h2>
      <ul>
        {subjects.map((subject) => (
          <li key={subject.subjectId}>
            <Link
              to={`/theme/${subject.subjectId}?classId=${classId}&subjectId=${subject.subjectId}`}
              state={{
                subjectName: subject.subjectName,
                classId: classId,
                className: className,
              }}
            >
              {subject.subjectName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Subject;
