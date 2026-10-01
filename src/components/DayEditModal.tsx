import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import type { Area } from '../types/Area';
import type { Session } from '../types/Session';
import { formatDuration } from '../utils/time';

interface DayEditModalProps {
  dateStr: string;
  areas: Area[];
  sessions: Session[];
  onSave: (dateStr: string, updatedSecondsByArea: Record<string, number>) => void;
  onClose: () => void;
}

interface TimeEntry {
  hours: number;
  minutes: number;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  dateStr,
  areas,
  sessions,
  onSave,
  onClose,
}) => {
  const daySessions = sessions.filter((s) => s.startTime.startsWith(dateStr));

  // Зберігаємо години та хвилини для кожної сфери
  const [timeByArea, setTimeByArea] = useState<Record<string, TimeEntry>>(() => {
    const init: Record<string, TimeEntry> = {};
    daySessions.forEach((s) => {
      const totalMin = Math.round(s.duration / 60);
      const existing = init[s.areaId] || { hours: 0, minutes: 0 };
      const combinedMin = existing.hours * 60 + existing.minutes + totalMin;

      init[s.areaId] = {
        hours: Math.floor(combinedMin / 60),
        minutes: combinedMin % 60,
      };
    });
    return init;
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const [y, m, d] = dateStr.split('-').map(Number);
  const formattedTitle = new Date(y, m - 1, d).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Загальна кількість секунд за день
  const totalDaySeconds = Object.values(timeByArea).reduce(
    (acc, t) => acc + (t.hours * 3600 + t.minutes * 60),
    0
  );

  const updateHours = (areaId: string, hours: number) => {
    setTimeByArea((prev) => ({
      ...prev,
      [areaId]: {
        hours: Math.max(0, hours || 0),
        minutes: prev[areaId]?.minutes || 0,
      },
    }));
  };

  const updateMinutes = (areaId: string, minutes: number) => {
    // Автоматичне перенесення, якщо хвилин >= 60
    const validMin = Math.max(0, minutes || 0);
    const extraHours = Math.floor(validMin / 60);
    const remMin = validMin % 60;

    setTimeByArea((prev) => ({
      ...prev,
      [areaId]: {
        hours: (prev[areaId]?.hours || 0) + extraHours,
        minutes: remMin,
      },
    }));
  };

  const addQuickMinutes = (areaId: string, deltaMinutes: number) => {
    setTimeByArea((prev) => {
      const current = prev[areaId] || { hours: 0, minutes: 0 };
      const currentTotalMin = current.hours * 60 + current.minutes;
      const newTotalMin = Math.max(0, currentTotalMin + deltaMinutes);

      return {
        ...prev,
        [areaId]: {
          hours: Math.floor(newTotalMin / 60),
          minutes: newTotalMin % 60,
        },
      };
    });
  };

  const handleRemoveArea = (areaId: string) => {
    setTimeByArea((prev) => {
      const updated = { ...prev };
      delete updated[areaId];
      return updated;
    });
  };

  const handleAddArea = (areaId: string) => {
    setTimeByArea((prev) => ({
      ...prev,
      [areaId]: { hours: 1, minutes: 0 },
    }));
    setIsSelectOpen(false);
  };

  const handleSave = () => {
    const secondsByArea: Record<string, number> = {};
    Object.entries(timeByArea).forEach(([areaId, t]) => {
      const sec = t.hours * 3600 + t.minutes * 60;
      if (sec > 0) {
        secondsByArea[areaId] = sec;
      }
    });

    onSave(dateStr, secondsByArea);
    onClose();
  };

  const availableToAdd = areas.filter((a) => timeByArea[a.id] === undefined);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card day-edit-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <h3 className="modal-card__title">Активність за день</h3>
            <span className="day-edit-date-sub">{formattedTitle}</span>
          </div>

          <button
            type="button"
            className="modal-card__close-btn"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X size={18} />
          </button>
        </div>

        {/* Сумарний час за день */}
        <div className="day-edit-total-row">
          <span>Загальний час:</span>
          <strong>{formatDuration(totalDaySeconds)}</strong>
        </div>

        {/* Список сфер із полями годин і хвилин */}
        <div className="day-edit-items-list">
          {Object.keys(timeByArea).length === 0 ? (
            <div className="day-edit-empty">У цей день немає записаного часу</div>
          ) : (
            Object.entries(timeByArea).map(([areaId, time]) => {
              const area = areas.find((a) => a.id === areaId);
              if (!area) return null;

              return (
                <div key={areaId} className="day-edit-item">
                  <div className="day-edit-item__left">
                    <span
                      className="day-edit-item__dot"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="day-edit-item__name">{area.name}</span>
                  </div>

                  <div className="day-edit-item__right">
                    {/* Поле Годин */}
                    <div className="time-field-wrapper">
                      <input
                        type="number"
                        min="0"
                        className="day-edit-stepper__input"
                        value={time.hours}
                        onChange={(e) => updateHours(areaId, parseInt(e.target.value, 10))}
                      />
                      <span className="time-field-label">год</span>
                    </div>

                    {/* Поле Хвилин */}
                    <div className="time-field-wrapper">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        className="day-edit-stepper__input"
                        value={time.minutes}
                        onChange={(e) => updateMinutes(areaId, parseInt(e.target.value, 10))}
                      />
                      <span className="time-field-label">хв</span>
                    </div>

                    {/* Швидкі кнопки */}
                    <button
                      type="button"
                      className="day-edit-btn-quick"
                      onClick={() => addQuickMinutes(areaId, 15)}
                    >
                      +15хв
                    </button>

                    <button
                      type="button"
                      className="day-edit-item__delete-btn"
                      onClick={() => handleRemoveArea(areaId)}
                      title="Видалити"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Додавання нової сфери */}
        {availableToAdd.length > 0 && (
          <div className="day-edit-add-wrapper">
            <button
              type="button"
              className="day-edit-add-trigger"
              onClick={() => setIsSelectOpen((prev) => !prev)}
            >
              <div className="day-edit-add-trigger__left">
                <Plus size={15} />
                <span>Додати сферу на цей день</span>
              </div>
              <ChevronDown size={14} />
            </button>

            {isSelectOpen && (
              <div className="day-edit-custom-dropdown">
                {availableToAdd.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    className="day-edit-dropdown-item"
                    onClick={() => handleAddArea(area.id)}
                  >
                    <span
                      className="day-edit-item__dot"
                      style={{ backgroundColor: area.color }}
                    />
                    <span>{area.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Дії */}
        <div className="modal-card__actions" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="button"
            className="modal-btn modal-btn--secondary"
            onClick={onClose}
          >
            Скасувати
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--primary"
            onClick={handleSave}
          >
            Зберегти зміни
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayEditModal;