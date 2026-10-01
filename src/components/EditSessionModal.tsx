import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import type { Session } from '../types/Session';
import { formatHours } from '../utils/time';

interface EditSessionModalProps {
  session: Session;
  onClose: () => void;
}

// Конвертує ISO-рядок у формат "YYYY-MM-DDTHH:mm" для input[type="datetime-local"]
function toDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({ session, onClose }) => {
  const { areas, setSessions } = useAppContext();

  const [areaId, setAreaId] = useState(session.areaId);
  const [startTimeLocal, setStartTimeLocal] = useState(() => toDateTimeLocal(session.startTime));
  const [endTimeLocal, setEndTimeLocal] = useState(() => toDateTimeLocal(session.endTime));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Розрахунок тривалості на льоту під час редагування часу
  const startTimestamp = new Date(startTimeLocal).getTime();
  const endTimestamp = new Date(endTimeLocal).getTime();
  const calculatedSeconds = Math.max(0, Math.floor((endTimestamp - startTimestamp) / 1000));
  const isTimeValid = endTimestamp > startTimestamp;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTimeValid) {
      setErrorMessage('Час завершення повинен бути пізнішим за час початку');
      return;
    }

    const updatedSession: Session = {
      ...session,
      areaId,
      startTime: new Date(startTimeLocal).toISOString(),
      endTime: new Date(endTimeLocal).toISOString(),
      duration: calculatedSeconds,
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? updatedSession : s))
    );

    onClose();
  };

  const handleDelete = () => {
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Шапка модального вікна */}
        <div className="modal-card__header">
          <h3 className="modal-card__title">Редагувати сесію</h3>
          <button
            type="button"
            className="modal-card__close-btn"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X size={18} />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSave} className="modal-form">
          {/* Вибір сфери */}
          <div className="modal-form__group">
            <label className="modal-form__label">Сфера діяльності</label>
            <select
              className="modal-form__select"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Час початку */}
          <div className="modal-form__group">
            <label className="modal-form__label">Час початку</label>
            <input
              type="datetime-local"
              className="modal-form__input"
              value={startTimeLocal}
              onChange={(e) => {
                setStartTimeLocal(e.target.value);
                setErrorMessage(null);
              }}
              required
            />
          </div>

          {/* Час завершення */}
          <div className="modal-form__group">
            <label className="modal-form__label">Час завершення</label>
            <input
              type="datetime-local"
              className="modal-form__input"
              value={endTimeLocal}
              onChange={(e) => {
                setEndTimeLocal(e.target.value);
                setErrorMessage(null);
              }}
              required
            />
          </div>

          {/* Розрахована тривалість */}
          <div className="modal-form__duration-badge">
            <span>Розрахована тривалість:</span>
            <strong>
              {isTimeValid ? `${formatHours(calculatedSeconds)} год` : '—'}
            </strong>
          </div>

          {errorMessage && (
            <div className="modal-form__error">{errorMessage}</div>
          )}

          {/* Кнопки дій */}
          <div className="modal-card__actions">
            <button
              type="button"
              className="modal-btn modal-btn--danger"
              onClick={handleDelete}
            >
              <Trash2 size={15} />
              <span>Видалити</span>
            </button>

            <div className="modal-card__actions-right">
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={onClose}
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="modal-btn modal-btn--primary"
                disabled={!isTimeValid}
              >
                Зберегти
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;