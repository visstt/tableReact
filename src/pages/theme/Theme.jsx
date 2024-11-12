import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function Theme() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subjectId } = useParams();
  const classId = new URLSearchParams(location.search).get("classId");

  useEffect(() => {
    const fetchThemes = async () => {
      if (!subjectId) {
        setError("ID предмета не найден!");
        setLoading(false);
        return;
      }

      try {
        // Убедитесь, что запрос направлен на правильный URL
        const response = await axios.get(
          `http://localhost:8080/theme/getAllThemes/${subjectId}`
        );
        setThemes(response.data);
      } catch (err) {
        setError("Ошибка при загрузке тем");
      } finally {
        setLoading(false);
      }
    };
    fetchThemes();
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
                to={`/theme/details?classId=${classId}&subjectId=${subjectId}&themeId=${theme.themeId}`}
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
