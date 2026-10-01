import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/useAppContext';
import type { Session } from '../types/Session';

export function useTimer() {
  const { activeTimer, setActiveTimer, setSessions } = useAppContext();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeTimer) return;

    // Оновлюємо мітку часу раз на секунду лише тоді, коли таймер активний
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Секунди обчислюються автоматично без виклику setState усередині effect
  const seconds = activeTimer
    ? Math.max(0, Math.floor((now - new Date(activeTimer.startTime).getTime()) / 1000))
    : 0;

  const startTimer = (areaId: string) => {
    setNow(Date.now());
    setActiveTimer({
      areaId,
      startTime: new Date().toISOString(),
    });
  };

  const stopTimer = () => {
    if (!activeTimer) return;

    const endTime = new Date().toISOString();
    const duration = Math.max(
      0,
      Math.floor((new Date(endTime).getTime() - new Date(activeTimer.startTime).getTime()) / 1000)
    );

    // Зберігаємо нову сесію у глобальний стан (і LocalStorage)
    if (duration > 0) {
      const newSession: Session = {
        id: crypto.randomUUID(),
        areaId: activeTimer.areaId,
        startTime: activeTimer.startTime,
        endTime,
        duration,
      };

      setSessions((prev) => [newSession, ...prev]);
    }

    setActiveTimer(null);
  };

  return {
    isActive: !!activeTimer,
    seconds,
    activeTimer,
    startTimer,
    stopTimer,
  };
}