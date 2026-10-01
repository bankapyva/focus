import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import type { Session } from '../types/Session';
import { formatHours } from '../utils/time';

interface RecentSessionsProps {
  onEditSession?: (session: Session) => void;
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({ onEditSession }) => {
  const { sessions, setSessions, areas } = useAppContext();
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Сортуємо сесії від найновішої до найстарішої та беремо останні 4 записи
  const recentList = [...sessions]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 4);

  // Закриваємо меню при кліку за його межами
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuSessionId(null);
      }
    };

    if (activeMenuSessionId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuSessionId]);

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setActiveMenuSessionId(null);
  };

  const handleEditClick = (session: Session) => {
    setActiveMenuSessionId(null);
    if (onEditSession) {
      onEditSession(session);
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const end = new Date(endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${start} – ${end}`;
  };

  return (
    <div className="timer-card-panel">
      <div className="timer-card-panel__header">
        <div className="timer-card-panel__title-group">
          <Clock size={16} />
          <h2 className="timer-card-panel__title">Останні сесії</h2>
        </div>
        <NavLink to="/statistics" className="timer-card-panel__link">
          Всі записи &rarr;
        </NavLink>
      </div>

      {recentList.length === 0 ? (
        <div className="timer-card-panel__empty">Історія сесій порожня</div>
      ) : (
        <div className="recent-sessions-list">
          {recentList.map((session) => {
            const area = areas.find((a) => a.id === session.areaId);
            const isMenuOpen = activeMenuSessionId === session.id;

            return (
              <div key={session.id} className="recent-session-item">
                <div className="recent-session-item__info">
                  <span
                    className="recent-session-item__dot"
                    style={{ backgroundColor: area?.color || '#3f78ff' }}
                  />
                  <div className="recent-session-item__details">
                    <span className="recent-session-item__title">
                      {area?.name || 'Невідома сфера'}
                    </span>
                    <span className="recent-session-item__time">
                      {formatTimeRange(session.startTime, session.endTime)}
                    </span>
                  </div>
                </div>

                <div className="recent-session-item__actions">
                  <span className="recent-session-item__duration">
                    {formatHours(session.duration)} год
                  </span>

                  <div className="recent-session-item__menu-wrapper" ref={isMenuOpen ? menuRef : null}>
                    <button
                      type="button"
                      className="recent-session-item__menu-btn"
                      onClick={() =>
                        setActiveMenuSessionId((prev) => (prev === session.id ? null : session.id))
                      }
                      aria-label="Опції сесії"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {isMenuOpen && (
                      <div className="recent-session-dropdown">
                        <button
                          type="button"
                          className="recent-session-dropdown__item"
                          onClick={() => handleEditClick(session)}
                        >
                          <Pencil size={13} />
                          <span>Редагувати</span>
                        </button>
                        <button
                          type="button"
                          className="recent-session-dropdown__item recent-session-dropdown__item--danger"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 size={13} />
                          <span>Видалити</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentSessions;