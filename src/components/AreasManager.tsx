import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import type { Area } from '../types/Area';

const PRESET_COLORS = [
  '#3b82f6', // Синій
  '#8b5cf6', // Фіолетовий
  '#10b981', // Смарагдовий
  '#f59e0b', // Бурштиновий
  '#f43f5e', // Рожевий
  '#06b6d4', // Бірюзовий
  '#ec4899', // Маджента
  '#84cc16', // Лайм
];

export const AreasManager: React.FC = () => {
  const { areas, setAreas } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAddModal = () => {
    setEditingArea(null);
    setName('');
    setColor(PRESET_COLORS[areas.length % PRESET_COLORS.length]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (area: Area) => {
    setEditingArea(area);
    setName(area.name);
    setColor(area.color);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setName('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingArea) {
      setAreas((prev) =>
        prev.map((a) => (a.id === editingArea.id ? { ...a, name: name.trim(), color } : a))
      );
    } else {
      const newArea: Area = {
        id: crypto.randomUUID(),
        name: name.trim(),
        color,
      };
      setAreas((prev) => [...prev, newArea]);
    }

    handleCloseModal();
  };

  const handleDeleteArea = (areaId: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== areaId));
    setOpenMenuId(null);
  };

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">Сфери діяльності</h2>
        <button
          type="button"
          className="settings-btn settings-btn--primary"
          onClick={handleOpenAddModal}
        >
          <Plus size={16} /> Додати сферу
        </button>
      </div>

      {areas.length === 0 ? (
        <div className="settings-empty">У вас ще немає створених сфер діяльності</div>
      ) : (
        <div className="areas-list">
          {areas.map((area) => (
            <div key={area.id} className="area-item">
              <div className="area-item__left">
                <span className="area-item__dot" style={{ backgroundColor: area.color }} />
                <span className="area-item__name">{area.name}</span>
              </div>

              <div className="area-item__right">
                <div
                  className="area-item__menu-wrapper"
                  ref={openMenuId === area.id ? menuRef : null}
                >
                  <button
                    type="button"
                    className="area-item__menu-btn"
                    onClick={() => setOpenMenuId(openMenuId === area.id ? null : area.id)}
                    aria-label="Меню сфери"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {openMenuId === area.id && (
                    <div className="area-item__dropdown">
                      <button
                        type="button"
                        className="area-item__dropdown-btn"
                        onClick={() => handleOpenEditModal(area)}
                      >
                        <Pencil size={13} /> Редагувати
                      </button>
                      <button
                        type="button"
                        className="area-item__dropdown-btn area-item__dropdown-btn--danger"
                        onClick={() => handleDeleteArea(area.id)}
                      >
                        <Trash2 size={13} /> Видалити
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка створення / редагування сфери */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header">
              <h3 className="modal-card__title">
                {editingArea ? 'Редагувати сферу' : 'Нова сфера діяльності'}
              </h3>
              <button
                type="button"
                className="modal-card__close-btn"
                onClick={handleCloseModal}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="modal-form__group">
                <label className="modal-form__label">Назва сфери</label>
                <input
                  type="text"
                  className="modal-form__input"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
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
                    >
                      {color === c && <Check size={14} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-card__actions">
                <button
                  type="button"
                  className="modal-btn modal-btn--secondary"
                  onClick={handleCloseModal}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn--primary"
                  disabled={!name.trim()}
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreasManager;