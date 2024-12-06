import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Cookies from "js-cookie"; // Для работы с cookie
import "./App.css";
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
import VoiceRecorder from "./pages/voiceRecorder/VoiceRecorder";
import LoginV2 from "./pages/auth/Login/LoginV2";
import Offset from "./pages/offset/Offset";
import OffsetTable from "./pages/OffsetTable/OffsetTable";

function App() {
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
          <Route
            path="/theme/:subjectId"
            element={<ProtectedRoute component={Theme} />}
          />
          <Route path="/table" element={<ProtectedRoute component={Table} />} />
          <Route path="/" element={<ProtectedRoute component={Class} />} />
          <Route
            path="/subject"
            element={<ProtectedRoute component={Subject} />}
          />
          <Route
            path="/themeDetails"
            element={<ProtectedRoute component={ThemeDetails} />}
          />
          <Route
            path="/offset"
            element={<ProtectedRoute component={Offset} />}
          />
          <Route
            path="/rating/:classId/:themeId/:className/:themeName"
            element={<ProtectedRoute component={Rating} />}
          />
          <Route
            path="/timer/:classId/:themeId/"
            element={<ProtectedRoute component={Timer} />}
          />
          <Route
            path="/offsetTable"
            element={<ProtectedRoute component={OffsetTable} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/voice" element={<VoiceRecorder />} />
          <Route path="/LoginV2" element={<LoginV2 />} />
        </Routes>
      </>
    </Router>
  );
}

// Компонент для защиты маршрутов
const ProtectedRoute = ({ component: Component }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwtToken");
    if (!token) {
      navigate("/login"); // Перенаправление на login, если токена нет
    }
  }, [navigate]);

  return <Component />;
};

export default App;
