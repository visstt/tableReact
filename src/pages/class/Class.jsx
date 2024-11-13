import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Class.module.css";

function Class() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/class/getAllClasses"
        );
        setClasses(response.data);
      } catch (err) {
        setError("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Выбор класса</h1>
        {classes.map((classItem) => (
          <Link
            key={classItem.classId}
            to={`/subject?classId=${
              classItem.classId
            }&className=${encodeURIComponent(classItem.className)}`}
          >
            <button className={styles.button}>{classItem.className}</button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Class;
