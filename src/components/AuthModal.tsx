import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !password) {
      setErrorMsg('Будь ласка, заповніть усі поля');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Пароль має містити щонайменше 6 символів');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const internalEmail = `${cleanUser}@focustime.app`;

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            data: { username: cleanUser },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setErrorMsg('Користувач із таким логіном уже існує');
          } else {
            setErrorMsg(error.message);
          }
          return;
        }

        if (data.user) {
          onSuccess(cleanUser);
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        });

        if (error) {
          setErrorMsg('Невірний логін або пароль');
          return;
        }

        if (data.user) {
          onSuccess(cleanUser);
          onClose();
        }
      }
    } catch {
      setErrorMsg('Помилка з’єднання із сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 99999,
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '350px',
          width: '100%',
          padding: '18px 20px',
          zIndex: 100000,
          position: 'relative',
        }}
      >
        <div
          className="modal-card__header"
          style={{ marginBottom: '8px', paddingBottom: 0, border: 'none' }}
        >
          <h3 className="modal-card__title" style={{ margin: 0, fontSize: '16px' }}>
            {isSignUp ? 'Створити акаунт' : 'Хмарна синхронізація'}
          </h3>
          <button
            type="button"
            className="modal-card__close-btn"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm, 6px)',
              color: '#f87171',
              fontSize: '12px',
              margin: '6px 0',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                marginBottom: '3px',
              }}
            >
              Логін
            </label>
            <input
              type="text"
              className="tasks-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              disabled={isLoading}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                marginBottom: '3px',
              }}
            >
              Пароль
            </label>
            <input
              type="password"
              className="tasks-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            className="timer-hero__btn"
            disabled={isLoading}
            style={{
              width: '100%',
              minWidth: 'auto',
              padding: '8px 16px',
              marginTop: '4px',
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus size={15} />
                <span>Зареєструватися</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Увійти</span>
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '10px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {isSignUp ? 'Вже маєте акаунт?' : 'Ще немає акаунта?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontWeight: 550,
              padding: 0,
            }}
          >
            {isSignUp ? 'Увійти' : 'Створити'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};