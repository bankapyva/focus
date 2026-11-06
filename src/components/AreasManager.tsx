import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { Area } from '../types/Area';
import { getAreaName } from '../utils/areaHelper'; // Імпортуємо хелпер

const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#f43f5e', '#06b6d4', '#ec4899', '#84cc16',
];

export const AreasManager: React.FC = () => {
  const { areas, setAreas } = useAppContext();
  const { t, lang } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  
  // Тепер маємо два стани для назви
  const [nameUk, setNameUk] = useState('');
  const [nameEn, setNameEn] = useState('');
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
    setNameUk('');
    setNameEn('');
    setColor(PRESET_COLORS[areas.length % PRESET_COLORS.length]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (area: Area) => {
    setEditingArea(area);
    
    // Заповнюємо поля залежно від старого/нового формату name
    if (typeof area.name === 'string') {
        setNameUk(area.name);
        setNameEn(area.name); // Або залишити порожнім
    } else {
        setNameUk(area.name.uk || '');
        setNameEn(area.name.en || '');
    }
    
    setColor(area.color);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setNameUk('');
    setNameEn('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUk.trim()) return; // Укр. назва обов'язкова (або зроби обидві)

    // Формуємо об'єкт з назвами
    const newNameObj = { 
        uk: nameUk.trim(), 
        en: nameEn.trim() || nameUk.trim() // Якщо англ не ввели, дублюємо укр
    };

    if (editingArea) {
      setAreas((prev) =>
        prev.map((a) => (a.id === editingArea.id ? { ...a, name: newNameObj, color } : a))
      );
    } else {
      const newArea: Area = {
        id: crypto.randomUUID(),
        name: newNameObj,
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
        <h2 className="settings-section__title">{t('settings.areas')}</h2>
        <button
          type="button"
          className="settings-btn settings-btn--primary"
          onClick={handleOpenAddModal}
        >
          <Plus size={16} /> {t('settings.areas.add')}
        </button>
      </div>

      {areas.length === 0 ? (
        <div className="settings-empty">{t('settings.areas.empty')}</div>
      ) : (
        <div className="areas-list">
          {areas.map((area) => (
            <div key={area.id} className="area-item">
              <div className="area-item__left">
                <span className="area-item__dot" style={{ backgroundColor: area.color }} />
                {/* Використовуємо хелпер для відображення */}
                <span className="area-item__name">{getAreaName(area, lang)}</span>
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
                        <Pencil size={13} /> {t('tasks.menu.edit')}
                      </button>
                      <button
                        type="button"
                        className="area-item__dropdown-btn area-item__dropdown-btn--danger"
                        onClick={() => handleDeleteArea(area.id)}
                      >
                        <Trash2 size={13} /> {t('tasks.menu.delete')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header">
              <h3 className="modal-card__title">
                {editingArea ? t('settings.areas.edit') : t('settings.areas.new')}
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
              {/* Поле для Української назви */}
              <div className="modal-form__group">
                <label className="modal-form__label">{t('settings.areas.name')} (UA)</label>
                <input
                  type="text"
                  className="modal-form__input"
                  value={nameUk}
                  onChange={(e) => setNameUk(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Поле для Англійської назви */}
              <div className="modal-form__group">
                <label className="modal-form__label">{t('settings.areas.name')} (EN)</label>
                <input
                  type="text"
                  className="modal-form__input"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>

              <div className="modal-form__group">
                <label className="modal-form__label">{t('settings.areas.color')}</label>
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
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn--primary"
                  disabled={!nameUk.trim()} // Вимагаємо хоча б українську назву
                >
                  {t('settings.save')}
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