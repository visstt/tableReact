import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Class.module.css";
import { url } from "../../costants/constants"; // Make sure the path is correct
import Sidebar from "../Sidebar/Sidebar"; // Import the Sidebar component

function Class() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`${url}/class/getAllClasses`);
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
      <Sidebar /> {/* Use the Sidebar component here */}
      <div className={styles.content}>
        <div className={styles.classes}>
          {classes.map((classItem) => (
            <Link
              key={classItem.classId}
              to={`/subject?classId=${
                classItem.classId
              }&className=${encodeURIComponent(classItem.className)}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className={`${styles.classCard} ${getClassColor(
                  classItem.className
                )}`}
              >
                {classItem.className}
                <br />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Function to determine the class card color based on class name
const getClassColor = (className) => {
  if (className.startsWith("7")) return styles.blue; // Example logic
  if (className.startsWith("8")) return styles.green;
  if (className.startsWith("9")) return styles.black;
  return styles.black; // Default color
};

export default Class;
