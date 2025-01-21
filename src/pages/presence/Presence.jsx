import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Presence.module.css";
import { url } from "../../costants/constants";
import phoneIcon from "../../../public/phoneIcon.png";

const Presence = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presences, setPresences] = useState([]);
  const [modalData, setModalData] = useState(null); // Для данных модального окна
  const { classId, className, subjectName, subjectId, themeName, themeId } =
    Object.fromEntries(new URLSearchParams(location.search));
  const [clickedCells, setClickedCells] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${url}/student/getStudentsByClassId/${classId}`
        );
        const updatedStudents = response.data.map((student) => ({
          ...student,
          ratings: [""],
        }));
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
      const response = await axios.get(`${url}/presence/${themeId}`);
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
      await axios.post(
        `${url}/presence/addPresenceRecord/${classId}-${themeId}`,
        presenceRecords
      );
      navigate(
        `/themeDetails?subjectId=${subjectId}&classId=${classId}&className=${className}&subjectName=${subjectName}&themeName=${themeName}&themeId=${themeId}`
      );
    } catch (err) {
      setError("Ошибка при сохранении данных о посещаемости");
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const openModal = (parentFullName, parentNumber) => {
    setModalData({ parentFullName, parentNumber });
  };

  const closeModal = () => {
    setModalData(null);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>Посещаемость класса</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ФИО учащегося</th>
            <th className={styles.width}>Нажмите для "н"</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.studentId}>
              <td className={styles.wrapper}>
                <img
                  src={phoneIcon}
                  alt="Телефон"
                  className={styles.phoneIcon}
                  onClick={() =>
                    openModal(student.parentFullName, student.parentNumber)
                  }
                />
                {student.fullName} &nbsp;
              </td>
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

      {modalData && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>ФИО Родителя: {modalData.parentFullName}</p>
            <p>
              Телефон:{" "}
              <a href={`tel:${modalData.parentNumber}`}>
                {modalData.parentNumber}
              </a>
            </p>

            <button onClick={closeModal} className={styles.modalButton}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presence;
