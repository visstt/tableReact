import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Theme() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subjectId } = useParams(); // Получаем subjectId из URL

  useEffect(() => {
    console.log("Полученный subjectId:", subjectId); // Проверяем значение subjectId

    const fetchThemes = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/theme/getAllThemes/${subjectId}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка при загрузке тем: ${errorText}`);
        }
        const data = await response.json();
        setThemes(data);
      } catch (err) {
        setError(`Ошибка: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchThemes();
    } else {
      setError("ID предмета не найден!");
      setLoading(false);
    }
  }, [subjectId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Темы предмета</h2>
      {themes.length > 0 ? (
        <ul>
          {themes.map((theme) => (
            <li key={theme.themeId}>
              <Link
                to="/theme/details"
                state={{
                  themeName: theme.themeName,
                  timeInterval: theme.timeInterval,
                }}
              >
                {theme.themeName}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Темы не найдены для выбранного предмета.</p>
      )}
    </div>
  );
}

export default Theme;
