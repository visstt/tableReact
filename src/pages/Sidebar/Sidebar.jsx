import React from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css"; 

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <ul>
        <li>
          <i className="fas fa-book"></i>
          <Link to="#">Предметы</Link>
        </li>
        <li>
          <i className="fas fa-graduation-cap"></i>
          <Link to="#" className={styles.active}>
            Классы
          </Link>
        </li>
        <li>
          <i className="fas fa-list"></i>
          <Link to="#">Темы</Link>
        </li>
        <li>
          <i className="fas fa-chart-bar"></i>
          <Link to="#">Оценки</Link>
        </li>
        <li>
          <i className="fas fa-trophy"></i>
          <Link to="#">Рейтинг</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
