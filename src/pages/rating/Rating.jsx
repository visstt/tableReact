import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Rating.module.css"; // Убедитесь, что путь к стилям правильный
import { url } from "../../costants/constants";

const Rating = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [themes, setThemes] = useState(["", "", "", ""]); // Editable themes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null); // Save error
  const [selectedCell, setSelectedCell] = useState({
    studentId: null,
    cellIndex: null,
  }); // For storing selected cell
  const [inputMode, setInputMode] = useState("plus"); // Default input mode
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState("");
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [currentCellIndex, setCurrentCellIndex] = useState(null);

  // Extract parameters from URL
  const { classId, className, themeName, themeId } = useParams();

  const handleBack = () => {
    navigate(-1); // Функция для возврата на предыдущую страницу
  };
  // Themes for football and volleyball
  const footballThemes = ["Пас", "Приём мяча", "Гол", "Штрафной"];
  const volleyballThemes = ["Приём", "Защита", "Блок", "Удар"];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log(`Fetching students for classId: ${classId}`);
        const response = await axios.get(
          `${url}/student/getStudentsByClassId/${classId}`
        );
        const updatedStudents = response.data.map((student) => ({
          ...student,
          ratings: ["", "", "", ""], // Initialize empty array for ratings
        }));
        setStudents(updatedStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Ошибка при загрузке данных студентов");
      } finally {
        setLoading(false);
      }
    };

    const fetchJournalData = async () => {
      try {
        console.log(`Fetching activity journal for themeId: ${themeId}`);
        const response = await axios.get(`${url}/activityJournal/${themeId}`);
        console.log("Activity journal data:", response.data);

        // Update themes and ratings
        if (response.data.length > 0) {
          setThemes([
            response.data[0].theme1 || "",
            response.data[0].theme2 || "",
            response.data[0].theme3 || "",
            response.data[0].theme4 || "",
          ]);

          setStudents((prevStudents) =>
            prevStudents.map((student) => {
              const journalEntry = response.data.find(
                (entry) => entry.student.studentId === student.studentId
              );
              if (journalEntry) {
                return {
                  ...student,
                  ratings: [
                    journalEntry.activity1 || "",
                    journalEntry.activity2 || "",
                    journalEntry.activity3 || "",
                    journalEntry.activity4 || "",
                  ],
                };
              }
              return student;
            })
          );
        }
      } catch (err) {
        console.error("Error fetching activity journal:", err);
        setError("Ошибка при загрузке данных журнала активности");
      }
    };

    if (classId) {
      fetchStudents();
    }
    if (themeId) {
      fetchJournalData();
    }
  }, [classId, themeId]);

  const handleRatingChange = (e, studentId, cellIndex) => {
    const value = e.target.value.replace(/[^0-9+\\-]/g, ""); // Allow numbers, plus and minus
    console.log(
      `Rating changed: studentId=${studentId}, cellIndex=${cellIndex}, value=${value}`
    );
    const updatedStudents = students.map((student) => {
      if (student.studentId === studentId) {
        const updatedRatings = student.ratings.map((rating, index) =>
          index === cellIndex ? value : rating
        );
        return { ...student, ratings: updatedRatings };
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handleThemeChange = (e, index) => {
    const updatedThemes = themes.map((theme, idx) =>
      idx === index ? e.target.value : theme
    );
    console.log(`Theme changed: index=${index}, value=${e.target.value}`);
    setThemes(updatedThemes);
  };

  const saveData = async () => {
    setSaveError(null);
    try {
      const dataToSend = students.map((student) => ({
        studentId: student.studentId,
        classId,
        themeName,
        subjectId: null,
        themeId,
        theme1: themes[0],
        theme2: themes[1],
        theme3: themes[2],
        theme4: themes[3],
        activity1: student.ratings[0],
        activity2: student.ratings[1],
        activity3: student.ratings[2],
        activity4: student.ratings[3],
      }));
      console.log("Data to save:", dataToSend);

      await axios.post(
        `${url}/activityJournal/addActivityJournalRecord/${classId}-${themeId}`,
        dataToSend
      );

      alert("Данные успешно сохранены!");
    } catch (err) {
      console.error("Error saving data:", err);
      setSaveError("Ошибка при сохранении данных");
    }
  };

  const handleSportSelection = (sport) => {
    if (sport === "football") {
      setThemes(footballThemes);
    } else if (sport === "volleyball") {
      setThemes(volleyballThemes);
    }
  };

  const getInputClass = (rating) => {
    if (rating.includes("+")) {
      return styles.positiveInput; // Class for green background
    } else if (rating.includes("⚪")) {
      return styles.circleInput; // Class for circle input
    }
    return styles.defaultInput; // Default class
  };

  const handleCellClick = (studentId, cellIndex) => {
    setSelectedCell({ studentId, cellIndex }); // Save selected cell
    const updatedStudents = students.map((student) => {
      if (student.studentId === studentId) {
        const currentRating = student.ratings[cellIndex];
        if (inputMode === "plus") {
          const plusCount = (currentRating.match(/\+/g) || []).length; // Count plus signs
          if (plusCount < 5) {
            const updatedRatings = student.ratings.map(
              (rating, index) =>
                index === cellIndex ? currentRating + "+" : rating // Add plus to existing value
            );
            return { ...student, ratings: updatedRatings };
          }
        } else if (inputMode === "circle") {
          const updatedRatings = student.ratings.map(
            (rating, index) =>
              index === cellIndex ? currentRating + "🔴" : rating // Add circle to existing value
          );
          return { ...student, ratings: updatedRatings };
        }
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const toggleInputMode = () => {
    setInputMode((prevMode) => (prevMode === "plus" ? "circle" : "plus"));
  };

  const openModal = (studentId, cellIndex) => {
    const student = students.find((s) => s.studentId === studentId);
    setCurrentRating(student.ratings[cellIndex]);
    setCurrentStudentId(studentId);
    setCurrentCellIndex(cellIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const saveRating = () => {
    const updatedStudents = students.map((student) => {
      if (student.studentId === currentStudentId) {
        const updatedRatings = student.ratings.map((rating, index) =>
          index === currentCellIndex ? currentRating : rating
        );
        return { ...student, ratings: updatedRatings };
      }
      return student;
    });
    setStudents(updatedStudents);
    closeModal();
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  const Modal = ({ isOpen, onClose, onSave, rating, setRating }) => {
    if (!isOpen) return null;

    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2>Редактировать рейтинг</h2>
          <input
            type="text"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <button onClick={onSave}>Сохранить</button>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h2>Рейтинг класса: {className}</h2>
      <h3>Тема: {themeName}</h3>
      <div className={styles.buttons}>
        <button
          onClick={() => handleSportSelection("football")}
          className={styles.button}
        >
          Футбол
        </button>
        <button
          onClick={() => handleSportSelection("volleyball")}
          className={styles.button}
        >
          Волейбол
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ФИО учащегося</th>
            {themes.map((theme, index) => (
              <th key={index}>
                <input
                  type="text"
                  placeholder={`Тема ${index + 1}`}
                  value={theme}
                  onChange={(e) => handleThemeChange(e, index)}
                  className={styles.themeInput}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.studentId}>
              <td>{student.fullName}</td>
              {student.ratings.map((rating, cellIndex) => (
                <td
                  key={cellIndex}
                  onClick={() => handleCellClick(student.studentId, cellIndex)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openModal(student.studentId, cellIndex);
                  }}
                >
                  <input
                    type="text"
                    value={rating}
                    onChange={(e) =>
                      handleRatingChange(e, student.studentId, cellIndex)
                    }
                    className={getInputClass(rating)}
                    readOnly
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={toggleInputMode}
        className={inputMode === "plus" ? styles.greenButton : styles.redButton}
      >
        Переключить режим: {inputMode === "plus" ? "Кружок" : "Плюс"}
      </button>
      <button onClick={saveData} className={styles.button}>
        Сохранить
      </button>
      <button onClick={handleBack} className={styles.button}>
        Назад
      </button>
      {saveError && <p className={styles.error}>{saveError}</p>}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveRating}
        rating={currentRating}
        setRating={setCurrentRating}
      />
    </div>
  );
};

export default Rating;
