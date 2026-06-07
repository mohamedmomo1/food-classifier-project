import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 4000, onConfirm = null) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false, onConfirm }]);

    // Only auto-dismiss if not a confirmation toast
    if (type !== 'confirm') {
      // Begin exit animation before removal
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      }, duration - 400);

      // Remove from DOM
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 380);
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur),
    info:    (msg, dur) => addToast(msg, 'info',     dur),
    warning: (msg, dur) => addToast(msg, 'warning',  dur),
    confirm: (msg, onConfirm) => addToast(msg, 'confirm', 0, onConfirm),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

/* ─── Icons ───────────────────────────────────────────────────── */
const ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  confirm: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

/* ─── Colours ─────────────────────────────────────────────────── */
const PALETTE = {
  success: {
    bg:     'linear-gradient(135deg, #0d2e1c 0%, #0f3d26 100%)',
    border: '#22c55e',
    icon:   '#4ade80',
    bar:    '#22c55e',
  },
  error: {
    bg:     'linear-gradient(135deg, #2d0a0a 0%, #3d1010 100%)',
    border: '#ef4444',
    icon:   '#f87171',
    bar:    '#ef4444',
  },
  info: {
    bg:     'linear-gradient(135deg, #0a1929 0%, #0d2137 100%)',
    border: '#3b82f6',
    icon:   '#60a5fa',
    bar:    '#3b82f6',
  },
  warning: {
    bg:     'linear-gradient(135deg, #1f1505 0%, #2e1e07 100%)',
    border: '#f59e0b',
    icon:   '#fbbf24',
    bar:    '#f59e0b',
  },
  confirm: {
    bg:     'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
    border: '#a855f7',
    icon:   '#c084fc',
    bar:    '#a855f7',
  },
};

/* ─── Toast Item ──────────────────────────────────────────────── */
function ToastItem({ toast, onDismiss }) {
  const p = PALETTE[toast.type] || PALETTE.info;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px 16px 16px',
        borderRadius: '12px',
        background: p.bg,
        border: `1px solid ${p.border}40`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${p.border}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
        backdropFilter: 'blur(16px)',
        minWidth: '320px',
        maxWidth: '420px',
        overflow: 'hidden',
        animation: toast.exiting
          ? 'toastOut 0.38s cubic-bezier(0.4,0,0.2,1) forwards'
          : 'toastIn 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
        {/* Icon badge */}
        <div style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: `${p.border}20`,
          border: `1px solid ${p.border}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: p.icon,
        }}>
          {ICONS[toast.type]}
        </div>

        {/* Message */}
        <div style={{ flex: 1, paddingTop: '2px' }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 500,
            color: '#f1f5f9',
            lineHeight: 1.5,
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            direction: /[\u0600-\u06FF]/.test(toast.message) ? 'rtl' : 'ltr',
          }}>
            {toast.message}
          </p>
        </div>

        {/* Close button (only shown if not a confirm type to prevent accidental bypass) */}
        {toast.type !== 'confirm' && (
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
            style={{
              flexShrink: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '2px',
              lineHeight: 1,
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#cbd5e1'}
            onMouseLeave={e => e.target.style.color = '#64748b'}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>

      {/* Confirmation buttons */}
      {toast.type === 'confirm' && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end', width: '100%' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
          >
            {/[\u0600-\u06FF]/.test(toast.message) ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (toast.onConfirm) toast.onConfirm();
              onDismiss(toast.id);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: p.border,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            {/[\u0600-\u06FF]/.test(toast.message) ? 'تأكيد' : 'Confirm'}
          </button>
        </div>
      )}

      {/* Progress bar */}
      {toast.type !== 'confirm' && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          borderRadius: '0 0 12px 12px',
          background: p.bar,
          width: '100%',
          animation: toast.exiting ? 'none' : 'progressBar 3.6s linear forwards',
          opacity: 0.8,
        }} />
      )}
    </div>
  );
}

/* ─── Container ───────────────────────────────────────────────── */
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%) scale(0.85); }
          to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0)   scale(1);    }
          to   { opacity: 0; transform: translateX(110%) scale(0.85); }
        }
        @keyframes progressBar {
          from { transform: scaleX(1); transform-origin: left; }
          to   { transform: scaleX(0); transform-origin: left; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>
  );
}
