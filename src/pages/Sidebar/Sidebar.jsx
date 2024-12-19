import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar() {
  const location = useLocation();

  const getItemClass = (path) => {
    return location.pathname === path ||
      (path === "/theme" && location.pathname.startsWith("/theme/"))
      ? styles.active
      : styles.inactive;
  };

  return (
    <div className={styles.sidebar}>
      <ul>
        <li className={getItemClass("/")}>
          <img
            src="https://img.icons8.com/ios-filled/50/000000/classroom.png"
            alt="Классы"
          />
          Классы
        </li>
        <li className={getItemClass("/subject")}>
          <img
            src="https://img.icons8.com/ios-filled/50/000000/book.png"
            alt="Предметы"
          />
          Предметы
        </li>
        <li className={getItemClass("/theme")}>
          <img
            src="https://img.icons8.com/ios-filled/50/000000/list.png"
            alt="Темы"
          />
          Темы
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
