import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Class() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/class/getAllClasses"
        );
        if (!response.ok) {
          throw new Error("Ошибка при загрузке данных");
        }
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        setError(err.message);
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
            <Link
              to={{
                pathname: "/subject",
                search: `?classId=${classItem.classId}`,
                state: { className: classItem.className }, // Убедитесь, что передаете className
              }}
            >
              {classItem.className}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Class;
