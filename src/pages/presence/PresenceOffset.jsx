import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Импортируем Link и useNavigate
import axios from "axios";
import styles from "./Presence.module.css";
import { url } from "../../costants/constants";

const PresenceOffset = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presences, setPresences] = useState([]);
  const {
    classId,
    className,
    subjectName,
    subjectId,
    themeName,
    themeId,
    offsetId,
    offsetName,
  } = Object.fromEntries(new URLSearchParams(location.search));
  const [clickedCells, setClickedCells] = useState({});
  const navigate = useNavigate(); // Инициализируем useNavigate

  useEffect(() => {
    console.log(`offsetId: ${offsetId}`);
    console.log(`subjectId: ${subjectId}`);
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${url}/student/getStudentsByClassId/${classId}`
        );
        const updatedStudents = response.data.map((student) => {
          console.log("Student ID:", student.studentId); // Логирование studentId
          return {
            ...student,
            ratings: [""],
          };
        });
        setStudents(updatedStudents);
      } catch (err) {
        setError("Ошибка при загрузке данных студентов");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  const fetchPresences = async () => {
    try {
      const response = await axios.get(`${url}/presence/${offsetId}`);
      setPresences(response.data);
      const updatedClickedCells = {};
      response.data.forEach((record) => {
        updatedClickedCells[record.student.studentId] =
          record.isPresence === "true";
      });
      setClickedCells(updatedClickedCells);
    } catch (err) {
      setError("Ошибка при загрузке данных о пропусках");
    }
  };

  useEffect(() => {
    if (themeId) {
      fetchPresences();
    }
  }, [themeId]);

  const handleCellClick = (studentId) => {
    setClickedCells((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const savePresences = async () => {
    const presenceRecords = students.map((student) => ({
      isPresence: clickedCells[student.studentId] ? "true" : "false",
      studentId: student.studentId,
      subjectId: subjectId,
    }));

    try {
      // await axios.post(
      //   `${url}/OffsePresence/addPresenceRecord/${classId}-${offsetId}`,
      //   presenceRecords
      // );
      // Перенаправление после успешного сохранения
      navigate(
        // `/themeDetails?subjectId=${subjectId}&classId=${classId}&className=${className}&subjectName=${subjectName}&themeName=${themeName}&themeId=${themeId}`
        `/offsetTable?subjectId=${subjectId}&classId=${classId}&className=${className}&subjectId=${subjectId}&offsetName=${offsetName}&offsetId=${offsetId}`
      );
    } catch (err) {
      setError("Ошибка при сохранении данных о посещаемости");
    }
  };

  const handleBackClick = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>Посещаемость класса</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th> ФИО учащемся</th>
            <th className={styles.width}>Нажмите для "н"</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.studentId}>
              <td>{student.fullName}</td>
              <td
                onClick={() => handleCellClick(student.studentId)}
                className={`${styles.width} ${
                  clickedCells[student.studentId] ? styles.clickedCell : ""
                }`}
              >
                {clickedCells[student.studentId] ? "н" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={savePresences} className={styles.button}>
        Далее
      </button>
      <button onClick={handleBackClick} className={styles.button}>
        Назад
      </button>
    </div>
  );
};

export default PresenceOffset;
