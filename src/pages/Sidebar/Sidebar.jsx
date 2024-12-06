import React from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <ul>
        <li>
          <i className="fas fa-book"></i>
          Предметы
        </li>
        <li>
          <i className="fas fa-graduation-cap"></i>
          Классы
        </li>
        <li>
          <i className="fas fa-list"></i>
          Темы
        </li>
        <li>
          <i className="fas fa-chart-bar"></i>
          Оценки
        </li>
        <li>
          <i className="fas fa-trophy"></i>
          Рейтинг
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
