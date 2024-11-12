import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
    <div>
      <h2>Список классов</h2>
      <ul>
        {classes.map((classItem) => (
          <li key={classItem.classId}>
            <Link to={`/subject?classId=${classItem.classId}`}>
              {classItem.className}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Class;
