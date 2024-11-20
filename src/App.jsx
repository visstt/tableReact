import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Table from "./pages/table/Table";
import Theme from "./pages/theme/Theme";
import Class from "./pages/class/Class";
import ThemeDetails from "./pages/ThemeDetails/ThemeDetails";
import Subject from "./pages/subject/Subject";
import Rating from "./pages/rating/Rating";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          <Route path="/theme/:subjectId" element={<Theme />} />
          <Route path="/table" element={<Table />} />
          <Route path="/" element={<Class />} />
          <Route path="/subject" element={<Subject />} />
          <Route path="/themeDetails" element={<ThemeDetails />} />
          <Route path="/rating" element={<Rating />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
