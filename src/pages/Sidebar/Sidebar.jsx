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
          <i className="fas fa-graduation-cap"></i>
          Классы
        </li>
        <li className={getItemClass("/subject")}>
          <i className="fas fa-book"></i>
          Предметы
        </li>
        <li className={getItemClass("/theme")}>
          <i className="fas fa-list"></i>
          Темы
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
