import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Rating.module.css";
import { url } from "../../costants/constants";

const Rating = () => {
  const [students, setStudents] = useState([]);
  const [themes, setThemes] = useState(["", "", "", ""]); // Темы, которые можно редактировать
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null); // Ошибка сохранения

  // Извлекаем параметры из URL
  const { classId, className, themeName, themeId } = useParams();

  // Темы для футбола и волейбола
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
          ratings: ["", "", "", ""], // Инициализируем пустой массив для оценок
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

        // Обновляем темы и оценки
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
                (entry) => entry.studentId === student.studentId
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
    const value = e.target.value.replace(/[^0-9+\\-]/g, ""); // Разрешаем цифры, плюс и минус
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
        subjectId: null, // subjectId как null
        themeId, // Извлекается из URL
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
    if (rating === "+") {
      return styles.positiveInput; // класс для зеленого фона
    } else if (rating === "-") {
      return styles.negativeInput; // класс для красного фона
    }
    return styles.defaultInput; // класс по умолчанию
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

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
                <td key={cellIndex}>
                  <input
                    type="text"
                    value={rating}
                    onChange={(e) =>
                      handleRatingChange(e, student.studentId, cellIndex)
                    }
                    className={getInputClass(rating)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveData} className={styles.button}>
        Сохранить
      </button>
      {saveError && <p className={styles.error}>{saveError}</p>}
    </div>
  );
};

export default Rating;
