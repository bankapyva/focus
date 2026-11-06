import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CheckSquare, Square, Check, Plus, MoreHorizontal,
  Trash2, Tag, ArrowUpDown, X, Pencil, Pin, PinOff
} from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { useTranslation } from '../hooks/useTranslation';
import type { Task } from '../types/Task';
import { getAreaName } from '../utils/areaHelper';

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface MenuPosition {
  taskId: string;
  right: number;
  top?: number;
  bottom?: number;
}

export const TasksCard: React.FC = () => {
  const { tasks, setTasks, areas } = useAppContext();
  const { t, lang } = useTranslation();
  const [newTitle, setNewTitle] = useState('');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [isAreaSubmenuOpen, setIsAreaSubmenuOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDeleteDropdownOpen, setIsDeleteDropdownOpen] = useState(false);
  const deleteMenuRef = useRef<HTMLDivElement>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [sortByArea, setSortByArea] = useLocalStorage<boolean>('focustime-tasks-sort-area', false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deleteMenuRef.current && !deleteMenuRef.current.contains(e.target as Node)) {
        setIsDeleteDropdownOpen(false);
      }
    };
    if (isDeleteDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDeleteDropdownOpen]);

  const displayedTasks = useMemo(() => {
    const sorted = [...tasks];
    if (sortByArea) {
      sorted.sort((a, b) => {
        const indexA = a.areaId ? areas.findIndex((ar) => ar.id === a.areaId) : 9999;
        const indexB = b.areaId ? areas.findIndex((ar) => ar.id === b.areaId) : 9999;
        return indexA - indexB;
      });
    }
    sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
    return sorted;
  }, [tasks, sortByArea, areas]);

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      areaId: null,
      createdAt: new Date().toISOString(),
      isPinned: false,
    };
    setTasks((prev: Task[]) => [newTask, ...prev]);
    setNewTitle('');
  };

  const toggleTask = (taskId: string) => {
    if (editingTaskId === taskId) return;
    setTasks((prev: Task[]) =>
      prev.map((t: Task) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const togglePinTask = (taskId: string) => {
    setTasks((prev: Task[]) =>
      prev.map((t: Task) => (t.id === taskId ? { ...t, isPinned: !t.isPinned } : t))
    );
    closeMenu();
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== taskId));
    closeMenu();
  };

  const handleStartEdit = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setEditingTaskId(taskId);
    setEditingTitle(task.title);
    closeMenu();
  };

  const handleSaveEdit = (taskId: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setTasks((prev: Task[]) =>
        prev.map((t: Task) => (t.id === taskId ? { ...t, title: trimmed } : t))
      );
    }
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const handleDeleteCompleted = () => {
    setTasks((prev: Task[]) => prev.filter((t: Task) => !t.completed));
    setIsDeleteDropdownOpen(false);
  };

  const handleOpenClearModal = () => {
    setIsDeleteDropdownOpen(false);
    setIsConfirmClearOpen(true);
  };

  const handleConfirmClear = () => {
    setTasks([]);
    setIsConfirmClearOpen(false);
  };

  const assignArea = (taskId: string, areaId: string | null) => {
    setTasks((prev: Task[]) =>
      prev.map((t: Task) => (t.id === taskId ? { ...t, areaId } : t))
    );
    closeMenu();
  };

  const handleToggleMenu = (taskId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (menuPosition?.taskId === taskId) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < 180;
    setMenuPosition({
      taskId,
      right: window.innerWidth - rect.right,
      top: openUpwards ? undefined : rect.bottom + 4,
      bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
    });
    setIsAreaSubmenuOpen(false);
  };

  const closeMenu = () => {
    setMenuPosition(null);
    setIsAreaSubmenuOpen(false);
  };

  const handleDragStart = (index: number) => {
    closeMenu();
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (sortByArea) {
      const draggedTask = displayedTasks[draggedIndex];
      const targetTask = displayedTasks[index];
      if (draggedTask.areaId !== targetTask.areaId) return;
    }
    const updated = [...displayedTasks];
    const movedItem = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, movedItem);
    setDraggedIndex(index);
    setTasks(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const completedCount = tasks.filter((t: Task) => t.completed).length;

  return (
    <div className="timer-card-panel tasks-panel">
      <div className="timer-card-panel__header" style={{ marginBottom: '14px' }}>
        <div className="timer-card-panel__title-group">
          <CheckSquare size={16} />
          <h2 className="timer-card-panel__title">{t('tasks.title')}</h2>
        </div>

        {tasks.length > 0 && (
          <div className="tasks-header-actions">
            <button
              type="button"
              className={`tasks-header-btn ${sortByArea ? 'tasks-header-btn--active' : ''}`}
              onClick={() => setSortByArea((prev) => !prev)}
              title={sortByArea ? t('tasks.sortOff') : t('tasks.sortOn')}
              aria-label={t('tasks.sortOn')}
            >
              <ArrowUpDown size={14} />
            </button>

            <div className="tasks-delete-menu-wrapper" ref={deleteMenuRef}>
              <button
                type="button"
                className={`tasks-header-btn tasks-header-btn--danger ${
                  isDeleteDropdownOpen ? 'tasks-header-btn--active-danger' : ''
                }`}
                onClick={() => setIsDeleteDropdownOpen((prev) => !prev)}
                title={t('tasks.clearAllBtn')}
                aria-label={t('tasks.clearAllBtn')}
              >
                <Trash2 size={14} />
              </button>

              {isDeleteDropdownOpen && (
                <div className="tasks-delete-dropdown">
                  <button
                    type="button"
                    className="tasks-delete-dropdown__item"
                    onClick={handleDeleteCompleted}
                    disabled={completedCount === 0}
                  >
                    <CheckSquare size={13} />
                    <span>{t('tasks.delCompleted')} ({completedCount})</span>
                  </button>
                  <button
                    type="button"
                    className="tasks-delete-dropdown__item tasks-delete-dropdown__item--danger"
                    onClick={handleOpenClearModal}
                  >
                    <Trash2 size={13} />
                    <span>{t('tasks.delAll')} ({tasks.length})</span>
                  </button>
                </div>
              )}
            </div>

            <span className="tasks-panel__counter">
              {completedCount}/{tasks.length}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleAddTask} className="tasks-input-form">
        <input
          type="text"
          className="tasks-input"
          placeholder={t('tasks.addPlaceholder')}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          type="submit"
          className="tasks-add-btn"
          disabled={!newTitle.trim()}
          aria-label="Додати"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="tasks-list" onScroll={closeMenu}>
        {displayedTasks.length === 0 ? (
          <div className="timer-card-panel__empty" style={{ minHeight: '120px' }}>
            {t('tasks.empty')}
          </div>
        ) : (
          displayedTasks.map((task: Task, index: number) => {
            const taskArea = areas.find((a) => a.id === task.areaId);
            const isDragging = draggedIndex === index;
            const isEditing = editingTaskId === task.id;
            const isPinned = task.isPinned;

            const dynamicStyle: React.CSSProperties = taskArea
              ? {
                  backgroundColor: hexToRgba(taskArea.color, 0.07),
                  borderColor: hexToRgba(taskArea.color, 0.16),
                }
              : {};

            return (
              <div
                key={task.id}
                draggable={!isEditing}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={dynamicStyle}
                className={`task-item ${taskArea ? 'task-item--tinted' : ''} ${
                  task.completed ? 'task-item--completed' : ''
                } ${isDragging ? 'task-item--dragging' : ''}`}
              >
                <button
                  type="button"
                  className="task-item__checkbox-btn"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckSquare size={16} className="task-checkbox--checked" />
                  ) : (
                    <Square size={16} className="task-checkbox" />
                  )}
                </button>

                {isEditing ? (
                  <input
                    type="text"
                    className="tasks-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(task.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    onBlur={() => handleSaveEdit(task.id)}
                    autoFocus
                    style={{
                      padding: '2px 8px',
                      fontSize: '13px',
                      height: '24px',
                      flex: 1,
                    }}
                  />
                ) : (
                  <span
                    className="task-item__title"
                    onClick={() => toggleTask(task.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isPinned && <Pin size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                    {task.title}
                  </span>
                )}

                {taskArea && (
                  <span
                    className="task-item__area-dot"
                    style={{ backgroundColor: taskArea.color }}
                    title={getAreaName(taskArea, lang)} // Переклад тултипу крапки
                  />
                )}

                <div className="task-item__menu-wrapper">
                  <button
                    type="button"
                    className="task-item__menu-btn"
                    onClick={(e) => handleToggleMenu(task.id, e)}
                    aria-label="Опції"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {menuPosition && (
        <>
          <div className="task-menu-backdrop" onClick={closeMenu} />
          <div
            className="task-menu-dropdown task-menu-dropdown--fixed"
            style={{
              right: `${menuPosition.right}px`,
              top: menuPosition.top !== undefined ? `${menuPosition.top}px` : 'auto',
              bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : 'auto',
              left: 'auto',
            }}
          >
            {!isAreaSubmenuOpen ? (
              <>
                <button
                  type="button"
                  className="task-menu-dropdown__btn"
                  onClick={() => togglePinTask(menuPosition.taskId)}
                >
                  {tasks.find((t) => t.id === menuPosition.taskId)?.isPinned ? (
                    <>
                      <PinOff size={13} />
                      <span>{t('tasks.menu.unpin')}</span>
                    </>
                  ) : (
                    <>
                      <Pin size={13} />
                      <span>{t('tasks.menu.pin')}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="task-menu-dropdown__btn"
                  onClick={() => handleStartEdit(menuPosition.taskId)}
                >
                  <Pencil size={13} />
                  <span>{t('tasks.menu.edit')}</span>
                </button>
                <button
                  type="button"
                  className="task-menu-dropdown__btn"
                  onClick={() => setIsAreaSubmenuOpen(true)}
                >
                  <Tag size={13} />
                  <span>{t('tasks.menu.selectArea')}</span>
                </button>
                <button
                  type="button"
                  className="task-menu-dropdown__btn task-menu-dropdown__btn--danger"
                  onClick={() => deleteTask(menuPosition.taskId)}
                >
                  <Trash2 size={13} />
                  <span>{t('tasks.menu.delete')}</span>
                </button>
              </>
            ) : (
              <div className="task-area-submenu">
                <button
                  type="button"
                  className="task-menu-dropdown__btn"
                  onClick={() => assignArea(menuPosition.taskId, null)}
                >
                  <span className="task-item__area-dot task-item__area-dot--empty" />
                  <span>{t('tasks.menu.noArea')}</span>
                  {tasks.find((t) => t.id === menuPosition.taskId)?.areaId === null && (
                    <Check size={12} style={{ marginLeft: 'auto' }} />
                  )}
                </button>
                {areas.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="task-menu-dropdown__btn"
                    onClick={() => assignArea(menuPosition.taskId, a.id)}
                  >
                    <span
                      className="task-item__area-dot"
                      style={{ backgroundColor: a.color }}
                    />
                    {/* Використовуємо getAreaName */}
                    <span>{getAreaName(a, lang)}</span>
                    {tasks.find((t) => t.id === menuPosition.taskId)?.areaId === a.id && (
                      <Check size={12} style={{ marginLeft: 'auto' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {isConfirmClearOpen && (
        <div className="modal-backdrop" onClick={() => setIsConfirmClearOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header">
              <h3 className="modal-card__title">{t('modal.clearTasks.title')}</h3>
              <button
                type="button"
                className="modal-card__close-btn"
                onClick={() => setIsConfirmClearOpen(false)}
                aria-label="Закрити"
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {t('modal.clearTasks.desc', { count: tasks.length })}
            </p>

            <div className="modal-card__actions" style={{ justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => setIsConfirmClearOpen(false)}
              >
                {t('modal.cancel')}
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--danger"
                onClick={handleConfirmClear}
              >
                {t('modal.deleteAll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksCard;