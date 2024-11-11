import React, { useEffect, useState } from "react";
import "./Table.css";

function Table() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const dates = [
    "1.11",
    "2.11",
    "3.11",
    "4.11",
    "5.11",
    "6.11",
    "7.11",
    "8.11",
    "9.11",
    "10.11",
    "11.11",
    "12.11",
    "13.11",
    "14.11",
    "15.11",
    "16.11",
    "17.11",
    "18.11",
    "19.11",
    "20.11",
  ];

  useEffect(() => {
    // Получение всех предметов
    fetch("http://localhost:8080/subject/getAllSubjects")
      .then((response) => response.json())
      .then((data) => setSubjects(data))
      .catch((error) =>
        console.error("Ошибка при получении предметов:", error)
      );

    // Получение всех классов
    fetch("http://localhost:8080/class/getAllClasses")
      .then((response) => response.json())
      .then((data) => setClasses(data))
      .catch((error) => console.error("Ошибка при получении классов:", error));

    // Получение всех студентов
    fetch("http://localhost:8080/student/getAllStudents")
      .then((response) => response.json())
      .then((data) => setStudents(data))
      .catch((error) =>
        console.error("Ошибка при получении студентов:", error)
      );
  }, []);

  // Фильтруем студентов по выбранному классу
  const filteredStudents = students.filter(
    (student) =>
      selectedClass === "" || student.classId === Number(selectedClass)
  );

  const formatName = (fullName) => {
    const [lastName, firstName, middleName] = fullName.split(" ");
    return fullName.length > 20 && middleName
      ? `${lastName} ${firstName.charAt(0)}. ${middleName.charAt(0)}.`
      : fullName;
  };

  return (
    <div className="container">
      <div className="buttons">
        {/* Выпадающий список предметов */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="subject-select"
        >
          <option value="">Выберите предмет</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>

        <button>Активность класса</button>
        <button>Рейтинг класса</button>

        {/* Выпадающий список классов */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="class-select"
        >
          <option value="">Выберите класс</option>
          {classes.map((cls) => (
            <option key={cls.classId} value={cls.classId}>
              {cls.className}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">ФИО учащегося</th>
              <th colSpan="20">Оценки</th>
            </tr>
            <tr>
              {dates.map((date, index) => (
                <th key={index}>{date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={index}>
                <td className="name">
                  <div className="name-checkbox">
                    <input type="checkbox" />
                    <span>{formatName(student.fullName)}</span>
                  </div>
                </td>
                {Array(20)
                  .fill("")
                  .map((_, idx) => (
                    <td key={idx}>
                      <select className="score-select">
                        <option value=""></option>
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="н">Н</option>
                        <option value="б">Б</option>
                      </select>
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="footer-buttons">
        <button>+</button>
        <button>-</button>
      </div>
    </div>
  );
}

export default Table;
