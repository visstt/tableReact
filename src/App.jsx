import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Table from "./pages/table/Table";
import Theme from "./pages/theme/Theme";
import Class from "./pages/class/Class";
import ThemeDetails from "./pages/ThemeDetails/ThemeDetails";
import Subject from "./pages/subject/Subject";
import Rating from "./pages/rating/Rating";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Timer from "./pages/timer/Timer";
import Login from "./pages/auth/Login/Login";
import { useState, useEffect } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Компонент для защиты маршрутов
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Открытые маршруты */}
          <Route path="/login" element={<Login />} />

          {/* Защищённые маршруты */}
          <Route path="/" element={<ProtectedRoute element={<Class />} />} />
          <Route
            path="/theme/:subjectId"
            element={<ProtectedRoute element={<Theme />} />}
          />
          <Route
            path="/table"
            element={<ProtectedRoute element={<Table />} />}
          />
          <Route
            path="/subject"
            element={<ProtectedRoute element={<Subject />} />}
          />
          <Route
            path="/themeDetails"
            element={<ProtectedRoute element={<ThemeDetails />} />}
          />
          <Route
            path="/rating"
            element={<ProtectedRoute element={<Rating />} />}
          />
          <Route
            path="/timer"
            element={<ProtectedRoute element={<Timer />} />}
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;
