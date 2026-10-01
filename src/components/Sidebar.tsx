import React from 'react';
import { NavLink } from 'react-router-dom';
import { Timer, BarChart3, Settings as SettingsIcon, Clock } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTimer } from '../hooks/useTimer';

export const Sidebar: React.FC = () => {
  const { areas } = useAppContext();
  const { isActive, activeTimer } = useTimer();

  const activeArea = areas.find((a) => a.id === activeTimer?.areaId);

  return (
    <aside className="sidebar">
      {/* Логотип */}
      <NavLink to="/" className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Clock size={20} />
        </div>
        <span>FocusTime</span>
      </NavLink>

      {/* Навігація */}
      <nav className="sidebar__navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <Timer size={18} />
          <span>Таймер</span>
        </NavLink>

        <NavLink
          to="/statistics"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <BarChart3 size={18} />
          <span>Статистика</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <SettingsIcon size={18} />
          <span>Налаштування</span>
        </NavLink>
      </nav>

      {/* Динамічний статус системи внизу */}
      <div className="sidebar__status">
        <div
          className="sidebar__status-dot"
          style={isActive ? { background: '#22c55e', boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)' } : undefined}
        />
        <div className="sidebar__status-content">
          <span className="sidebar__status-title">
            {isActive ? 'Зараз працюю' : 'Система готова'}
          </span>
          {isActive && activeArea && (
            <span style={{ fontSize: '13px', color: 'var(--color-text)', fontWeight: 500 }}>
              {activeArea.name}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;