import React, { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { exportDataAsJSON } from '../utils/exportData';
import { parseImportFile } from '../utils/importData';

export const ResetDataCard: React.FC = () => {
  const { areas, sessions, settings, setAreas, setSessions, setSettings, setActiveTimer } =
    useAppContext();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    exportDataAsJSON({ areas, sessions, settings });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseImportFile(file);

      if (data.areas) setAreas(data.areas);
      if (data.sessions) setSessions(data.sessions);
      if (data.settings) setSettings(data.settings);

      setImportStatus('Дані успішно імпортовано!');
      setTimeout(() => setImportStatus(null), 3000);
    } catch {
      alert('Не вдалося імпортувати дані. Перевірте формат JSON-файлу.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = () => {
    localStorage.removeItem('focustime-areas');
    localStorage.removeItem('focustime-sessions');
    localStorage.removeItem('focustime-settings');
    localStorage.removeItem('focustime-active-timer');

    setAreas([]);
    setSessions([]);
    setActiveTimer(null);
    setSettings({ theme: 'dark', accentColor: 'blue' });

    setIsConfirmOpen(false);
  };

  return (
    <>
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">Дані</h2>
        </div>

        <div className="data-actions-row">
          <button
            type="button"
            className="settings-btn settings-btn--secondary"
            onClick={handleExport}
          >
            <Download size={15} />
            <span>Експортувати дані (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="settings-btn settings-btn--secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} />
            <span>Імпортувати дані</span>
          </button>
        </div>

        {importStatus && <div className="settings-success-msg">{importStatus}</div>}
      </div>

      <div className="settings-section settings-section--danger">
        <div className="settings-section__header">
          <h2 className="settings-section__title" style={{ color: '#f87171' }}>
            Небезпечна зона
          </h2>

          <button
            type="button"
            className="settings-btn settings-btn--danger"
            onClick={() => setIsConfirmOpen(true)}
          >
            Очистити всі дані
          </button>
        </div>
      </div>

      {isConfirmOpen && (
        <div className="modal-backdrop" onClick={() => setIsConfirmOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="#f87171" />
                <h3 className="modal-card__title" style={{ color: '#f87171' }}>
                  Очистити всі дані?
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Ця дія видалить усі сфери, сесії та статистику. Відновити дані буде неможливо.
            </p>

            <div className="modal-card__actions" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => setIsConfirmOpen(false)}
              >
                Скасувати
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--danger"
                onClick={handleConfirmReset}
              >
                Так, видалити все
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetDataCard;