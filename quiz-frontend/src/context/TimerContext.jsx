import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import Helpers from '../utils/helpers.js';
import api from '../services/api.js';

export const TimerContext = createContext();

export function TimerProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const intervalRef = useRef(null);
  const activeSecondsCounter = useRef(0);

  // When user session changes (login/logout/different user), switch to their isolated timer
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const userKey = `totalTimeElapsed_user_${user.id}`;
      const savedUserTime = localStorage.getItem(userKey);
      if (savedUserTime !== null) {
        setElapsedTime(parseInt(savedUserTime, 10));
      } else {
        // Brand new user: starts at 0
        setElapsedTime(0);
        localStorage.setItem(userKey, '0');
      }
    } else {
      // Guest: isolated guest timer
      const guestKey = 'totalTimeElapsed_guest';
      const savedGuestTime = localStorage.getItem(guestKey) || '0';
      setElapsedTime(parseInt(savedGuestTime, 10));
    }
  }, [user?.id, isAuthenticated]);

  // Active Timer Tracker
  useEffect(() => {
    const userKey = isAuthenticated && user?.id ? `totalTimeElapsed_user_${user.id}` : 'totalTimeElapsed_guest';

    const startTimer = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1000;
          localStorage.setItem(userKey, newElapsed.toString());
          return newElapsed;
        });

        // Sync with backend every 30 seconds for logged-in users
        if (isAuthenticated) {
          activeSecondsCounter.current += 1;
          if (activeSecondsCounter.current >= 30) {
            api.logActiveTime(activeSecondsCounter.current).catch(() => {});
            activeSecondsCounter.current = 0;
          }
        }
      }, 1000);
    };

    const stopTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Flush any pending seconds to backend
      if (isAuthenticated && activeSecondsCounter.current > 0) {
        api.logActiveTime(activeSecondsCounter.current).catch(() => {});
        activeSecondsCounter.current = 0;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, isAuthenticated]);

  // Format display whenever elapsed time updates
  useEffect(() => {
    setTimerDisplay(Helpers.millisecondsToHuman(elapsedTime));
  }, [elapsedTime]);

  return (
    <TimerContext.Provider value={{ elapsedTime, timerDisplay }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export default TimerContext;
