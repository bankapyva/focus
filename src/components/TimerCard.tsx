import React, { useState } from 'react';
import { Play, Square, ChevronDown } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTimer } from '../hooks/useTimer';
import { formatTime } from '../utils/time';
import { useTranslation } from '../hooks/useTranslation';
import { getAreaName } from '../utils/areaHelper';

export const TimerCard: React.FC = () => {
  const { areas } = useAppContext();
  const { isActive, seconds, startTimer, stopTimer, activeTimer } = useTimer();
  const { t, lang } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

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
      <div className="timer-hero__display">{formatTime(seconds)}</div>

      <div className="timer-hero__area-wrapper" style={{ position: 'relative' }}>
        {areas.length === 0 ? (
          <div
            className="timer-hero__area-selector"
            style={{ opacity: 0.5, cursor: 'default' }}
          >
            <span>{t('timer.noAreas')}</span>
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
            {/* Безпечно використовуємо getAreaName або fall-back текст */}
            <span>{currentArea ? getAreaName(currentArea, lang) : t('timer.selectArea')}</span>
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
                {/* Переклад в дропдауні */}
                <span>{getAreaName(area, lang)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
            ? t('timer.createFirst')
            : undefined
        }
      >
        {isActive ? (
          <>
            <Square size={16} fill="currentColor" />
            <span>{t('timer.stopFocus')}</span>
          </>
        ) : (
          <>
            <Play size={16} fill="currentColor" />
            <span>{areas.length === 0 ? t('timer.createArea') : t('timer.startFocus')}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TimerCard;