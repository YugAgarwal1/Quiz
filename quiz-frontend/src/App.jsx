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
import { useEffect, useState, createContext, useRef } from 'react';
import Helpers from './utils/helpers.js';

// Create context for global timer
export const TimerContext = createContext();

function App() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initialize subjects in local storage only once
    const subjects = localStorage.getItem('subjects');
    if (!subjects) {
      const subjectList = ['Frontend', 'Backend', 'Adv Java'];
      localStorage.setItem('subjects', JSON.stringify(subjectList));
    }

    // Initialize subject count in local storage only once
    const subjectCount = localStorage.getItem('subjectCount');
    if (!subjectCount) {
      localStorage.setItem('subjectCount', '3');
    }
  }, []);

  // Global timer - runs whenever user is on the website
  useEffect(() => {
    // Initialize timer from local storage
    const storedElapsed = localStorage.getItem('totalTimeElapsed');
    
    if (storedElapsed) {
      setElapsedTime(parseInt(storedElapsed, 10));
    }
  }, []);

  useEffect(() => {
    const startTimer = () => {
      // Clear any existing interval first
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1000;
          localStorage.setItem('totalTimeElapsed', newElapsed.toString());
          return newElapsed;
        });
      }, 1000);
    };

    const stopTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the website - stop timer
        stopTimer();
      } else {
        // User returned to the website - start timer
        startTimer();
      }
    };

    // Start timer initially
    startTimer();

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Update display whenever elapsed time changes
  useEffect(() => {
    setTimerDisplay(Helpers.millisecondsToHuman(elapsedTime));
  }, [elapsedTime]);

  // set the practise test given local storage respectively
  useEffect(() =>{
    const quiz = JSON.parse(localStorage.getItem('quiz'));
    if(quiz){
        console.log(quiz.length)
        localStorage.setItem('practise_test_given', JSON.stringify(quiz.length));
    }
    else{
      localStorage.setItem('practise_test_given', JSON.stringify(0));
    }
  }, [])

  return (
   <TimerContext.Provider value={{ timerDisplay }}>
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
   </TimerContext.Provider>
  )
}

export default App
