import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Table from "./pages/table/Table";
import Theme from "./pages/theme/Theme";
import Class from "./pages/class/Class";
import ThemeDetails from "./pages/ThemeDetails/ThemeDetails";
import Subject from "./pages/subject/Subject";

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/theme/:subjectId" element={<Theme />} />
          <Route path="/table" element={<Table />} />
          <Route path="/class" element={<Class />} />
          <Route path="/subject" element={<Subject />} />
          <Route path="/theme/details" element={<ThemeDetails />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
