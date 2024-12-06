import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import axios from "axios";
import styles from "./Offset.module.css";
import { url } from "../../costants/constants";

export default function Offset() {
  const [offsets, setOffsets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subjectId = queryParams.get("subjectId");
  const classId = queryParams.get("classId");
  const className = queryParams.get("className");

  useEffect(() => {
    const fetchOffsets = async () => {
      try {
        const response = await axios.get(
          `${url}/offset/getAllOffsets/${subjectId}`
        );
        setOffsets(response.data);
      } catch (err) {
        setError("Ошибка при загрузке зачетов");
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchOffsets();
    } else {
      setLoading(false);
    }
  }, [subjectId]);

  if (loading) return <p className={styles.message}>Загрузка...</p>;
  if (error) return <p className={styles.message}>{error}</p>;

  // Массив с классами для фона зачетов
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
        <h2 className={styles.heading}>Список зачетов</h2>
        {offsets.length > 0 ? (
          <ul>
            {offsets.map((offset, index) => (
              <Link
                to={`/offsetTable?classId=${classId}&className=${className}&offsetName=${offset.offsetName}&offsetId=${offset.offsetId}`}
              >
                <li
                  key={offset.offsetId}
                  className={`${styles.button} ${
                    colorClasses[index % colorClasses.length]
                  }`}
                >
                  <p className={styles.themeItem}>{offset.offsetName}</p>
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <p className={styles.message}>Зачеты не найдены</p>
        )}
      </div>
    </div>
  );
}
