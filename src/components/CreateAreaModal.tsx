import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Area } from '../types/Area';

interface CreateAreaModalProps {
  initialArea?: Area | null;
  onSave: (areaData: { name: { uk: string; en: string }; color: string }) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3f78ff', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#f97316', '#f59e0b',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#84cc16', '#64748b',
];

export const CreateAreaModal: React.FC<CreateAreaModalProps> = ({
  initialArea,
  onSave,
  onClose,
}) => {
  const getInitialUk = () => {
    if (!initialArea) return '';
    return typeof initialArea.name === 'string' ? initialArea.name : initialArea.name.uk || '';
  };

  const getInitialEn = () => {
    if (!initialArea) return '';
    return typeof initialArea.name === 'string' ? initialArea.name : initialArea.name.en || '';
  };

  const [nameUk, setNameUk] = useState(getInitialUk());
  const [nameEn, setNameEn] = useState(getInitialEn());
  const [color, setColor] = useState(initialArea?.color || PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUk = nameUk.trim();

    if (!trimmedUk) {
      setError('Введіть назву сфери (UA)');
      return;
    }

    onSave({
      name: {
        uk: trimmedUk,
        en: nameEn.trim() || trimmedUk,
      },
      color,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h3 className="modal-card__title">
            {initialArea ? 'Редагувати сферу' : 'Нова сфера діяльності'}
          </h3>
          <button
            type="button"
            className="modal-card__close-btn"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label">Назва сфери (UA)</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="Наприклад: Навчання..."
              value={nameUk}
              onChange={(e) => {
                setNameUk(e.target.value);
                setError(null);
              }}
              autoFocus
              maxLength={30}
            />
            {error && <span className="modal-form__error">{error}</span>}
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Назва сфери (EN)</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="For example: Study..."
              value={nameEn}
              onChange={(e) => {
                setNameEn(e.target.value);
              }}
              maxLength={30}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Колір сфери</label>
            <div className="area-color-picker">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="area-color-picker__item"
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Обрати колір ${c}`}
                >
                  {color === c && <Check size={14} color="#ffffff" />}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-card__actions" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="modal-btn modal-btn--secondary"
              onClick={onClose}
            >
              Скасувати
            </button>
            <button type="submit" className="modal-btn modal-btn--primary">
              {initialArea ? 'Зберегти зміни' : 'Створити сферу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAreaModal;