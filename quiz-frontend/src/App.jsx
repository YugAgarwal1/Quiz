import './App.css';
import 'flowbite';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { MainPage } from "./pages/MainPage.jsx";
import Practise from './pages/Practise.jsx';
import SyllabusPage from './pages/SyllabusPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import CustomizePage from './pages/CustomizePage.jsx';
import ApplyCodePage from './pages/ApplyCodePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TimerProvider } from './context/TimerContext.jsx';
import AuthModal from './components/AuthModal.jsx';

export { TimerContext } from './context/TimerContext.jsx';

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <Router>
          <AuthModal />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/practise" element={<Practise />} />
            <Route path="/customized" element={<CustomizePage />} />
            <Route path="/apply-code" element={<ApplyCodePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/practise/:subject/syllabus" element={<SyllabusPage />} />
            <Route path="/practise/:subject/test/:testId" element={<QuizPage />} />
            <Route path="/practise/:subject/test/:testId/result" element={<ResultPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users/:userId" element={<AdminUserDetailsPage />} />
          </Routes>
        </Router>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;
