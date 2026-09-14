import './App.css'
import 'flowbite';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { MainPage } from "./pages/MainPage.jsx"
import Practise from './pages/Practise.jsx'
import SyllabusPage from './pages/SyllabusPage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import ResultPage from './pages/ResultPage.jsx';
import CustomizePage from './pages/CustomizePage.jsx';
import ApplyCodePage from './pages/ApplyCodePage.jsx';
function App() {

  return (
   <>
   <Router>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/practise" element={<Practise />} />
      <Route path="/customized" element={<CustomizePage />} />
      <Route path="/apply-code" element={<ApplyCodePage />} />
      <Route path="/practise/:subject/syllabus" element={<SyllabusPage />} />
      <Route path="/practise/:subject/test/:testId" element={<QuizPage />} />
      <Route path="/practise/:subject/test/:testId/result" element={<ResultPage />} />
    </Routes>
   </Router>
   </>
  )
}

export default App
