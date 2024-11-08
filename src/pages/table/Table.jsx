import React from "react";
import "./Table.css";

function Table() {
  const students = [
    { name: "Иванов Иван И.", scores: Array(20).fill("") },
    { name: "Сергеев Антон", scores: Array(20).fill("") },
    { name: "Комчаров Юрий С.", scores: Array(20).fill("") },
    { name: "Иванова Вероника С.", scores: Array(20).fill("") },
    { name: "Захаров Артем С.", scores: Array(20).fill("") },
    { name: "Студенко Никита С.", scores: Array(20).fill("") },
    { name: "Абдулаев Шукрат В.", scores: Array(20).fill("") },
    { name: "Бухарев Бахрам Ф.", scores: Array(20).fill("") },
    { name: "Сергеев Оруз Р.", scores: Array(20).fill("") },
    { name: "Ушаков Антон А.", scores: Array(20).fill("") },
    { name: "Римаков Роман Е.", scores: Array(20).fill("") },
    { name: "Пак Анастасия П.", scores: Array(20).fill("") },
    { name: "Павлов Ренат А.", scores: Array(20).fill("") },
    { name: "Балакина Адилия Г.", scores: Array(20).fill("") },
    { name: "Катибергенов Алик А.", scores: Array(20).fill("") },
    { name: "Гатин Анатолий А.", scores: Array(20).fill("") },
    { name: "Темерина Динара С.", scores: Array(20).fill("") },
    { name: "Балабанова Гули Е.", scores: Array(20).fill("") },
  ];

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

  return (
    <div className="container">
      <div className="buttons">
        <button>Предмет: Физ.Культура</button>
        <button>Активность класса</button>
        <button>Рейтинг класса</button>
        <button>Класс: 7Б</button>
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
            {students.map((student, index) => (
              <tr key={index}>
                <td className="name">
                  <div className="name-checkbox">
                    <input type="checkbox" />
                    <span>{student.name}</span>
                  </div>
                </td>
                {student.scores.map((_, idx) => (
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
