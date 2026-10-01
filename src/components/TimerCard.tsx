import React, { useState } from 'react';
import { Play, Square, ChevronDown } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTimer } from '../hooks/useTimer';
import { formatTime } from '../utils/time';

export const TimerCard: React.FC = () => {
  const { areas } = useAppContext();
  const { isActive, seconds, startTimer, stopTimer, activeTimer } = useTimer();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // Обчислення актуальної сфери на льоту без виклику useEffect
  const resolvedAreaId =
    activeTimer?.areaId ??
    (selectedAreaId && areas.some((a) => a.id === selectedAreaId) ? selectedAreaId : null) ??
    (areas[0]?.id ?? null);

  const currentArea = areas.find((a) => a.id === resolvedAreaId) ?? null;

  const handleToggleTimer = () => {
    if (isActive) {
      stopTimer();
    } else {
      if (!currentArea) return;
      startTimer(currentArea.id);
    }
  };

  const handleSelectArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="timer-hero__center">
      {/* Великий цифровий дисплей */}
      <div className="timer-hero__display">{formatTime(seconds)}</div>

      {/* Селектор сфери */}
      <div className="timer-hero__area-wrapper" style={{ position: 'relative' }}>
        {areas.length === 0 ? (
          <div
            className="timer-hero__area-selector"
            style={{ opacity: 0.5, cursor: 'default' }}
          >
            <span>Немає створених сфер</span>
          </div>
        ) : (
          <button
            type="button"
            className="timer-hero__area-selector"
            onClick={() => !isActive && setIsDropdownOpen((prev) => !prev)}
            disabled={isActive}
          >
            {currentArea && (
              <span
                className="timer-hero__area-dot"
                style={{ backgroundColor: currentArea.color }}
              />
            )}
            <span>{currentArea?.name || 'Оберіть сферу'}</span>
            {!isActive && <ChevronDown size={14} />}
          </button>
        )}

        {isDropdownOpen && !isActive && areas.length > 0 && (
          <div className="timer-hero__dropdown">
            {areas.map((area) => (
              <div
                key={area.id}
                className={`timer-hero__dropdown-item ${
                  area.id === currentArea?.id ? 'timer-hero__dropdown-item--active' : ''
                }`}
                onClick={() => handleSelectArea(area.id)}
              >
                <span
                  className="timer-hero__area-dot"
                  style={{ backgroundColor: area.color }}
                />
                <span>{area.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Головна кнопка дії */}
      <button
        type="button"
        className={`timer-hero__btn ${isActive ? 'timer-hero__btn--stop' : ''}`}
        onClick={handleToggleTimer}
        disabled={!isActive && areas.length === 0}
        style={
          !isActive && areas.length === 0
            ? { opacity: 0.45, cursor: 'not-allowed' }
            : undefined
        }
        title={
          !isActive && areas.length === 0
            ? 'Спочатку створіть сферу в налаштуваннях'
            : undefined
        }
      >
        {isActive ? (
          <>
            <Square size={16} fill="currentColor" />
            <span>Завершити сесію</span>
          </>
        ) : (
          <>
            <Play size={16} fill="currentColor" />
            <span>{areas.length === 0 ? 'Створіть сферу' : 'Почати роботу'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TimerCard;