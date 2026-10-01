import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Area } from '../types/Area';

interface CreateAreaModalProps {
  initialArea?: Area | null;
  onSave: (areaData: { name: string; color: string }) => void;
  onClose: () => void;
}

// 14 підготовлених кольорів для темної теми
const PRESET_COLORS = [
  '#3f78ff', // Синій
  '#6366f1', // Індиго
  '#8b5cf6', // Фіолетовий
  '#a855f7', // Пурпуровий
  '#ec4899', // Рожевий
  '#f43f5e', // Червоний
  '#f97316', // Помаранчевий
  '#f59e0b', // Янтарний
  '#10b981', // Смарагдовий
  '#14b8a6', // Бірюзовий
  '#06b6d4', // Ціан
  '#0ea5e9', // Небесний
  '#84cc16', // Лайм
  '#64748b', // Сірий
];

export const CreateAreaModal: React.FC<CreateAreaModalProps> = ({
  initialArea,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialArea?.name || '');
  const [color, setColor] = useState(initialArea?.color || PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Введіть назву сфери');
      return;
    }

    onSave({ name: trimmed, color });
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
            <label className="modal-form__label">Назва сфери</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="Наприклад: Трейдинг, Blender, Навчання..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              autoFocus
              maxLength={30}
            />
            {error && <span className="modal-form__error">{error}</span>}
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