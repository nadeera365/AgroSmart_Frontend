import { C } from '../theme'

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: 24,
      ...style
    }}>
      {children}
    </div>
  )
}

export function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: C.muted,
      marginBottom: 16,
      paddingBottom: 10,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {children}
    </div>
  )
}

export function Badge({ status, label }) {
  const map = {
    done:        { bg: C.successLt, color: C.success, border: '#bbf7d0' },
    pending:     { bg: C.infoLt,    color: C.info,    border: '#bfdbfe' },
    rescheduled: { bg: C.warningLt, color: C.warning, border: '#fde68a' },
    active:      { bg: C.successLt, color: C.success, border: '#bbf7d0' },
    inactive:    { bg: '#f3f4f6',   color: '#6b7280', border: '#e5e7eb' },
    sent:        { bg: C.successLt, color: C.success, border: '#bbf7d0' },
    failed:      { bg: C.dangerLt,  color: C.danger,  border: '#fecaca' },
    applied:     { bg: C.successLt, color: C.success, border: '#bbf7d0' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {label || status}
    </span>
  )
}

export function Btn({ children, onClick, variant = 'primary', style = {}, disabled = false, loading = false, type = 'button' }) {
  const variants = {
    primary: {
      background: C.green,
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: C.white,
      color: C.text,
      border: `1px solid ${C.border}`,
    },
    ghost: {
      background: 'transparent',
      color: C.muted,
      border: `1px solid ${C.border}`,
    },
    danger: {
      background: C.danger,
      color: '#fff',
      border: 'none',
    },
  }
  const v = variants[variant] || variants.primary
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '8px 16px',
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.15s',
        ...v,
        ...style,
      }}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  )
}

export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          padding: '9px 12px',
          borderRadius: 7,
          border: `1.5px solid ${error ? C.danger : C.border}`,
          fontSize: 14,
          color: C.text,
          background: C.white,
          width: '100%',
          ...style,
        }}
      />
      {error && <span style={{ fontSize: 11, color: C.danger }}>{error}</span>}
    </div>
  )
}

export function Sel({ label, options = [], style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          padding: '9px 12px',
          borderRadius: 7,
          border: `1.5px solid ${C.border}`,
          fontSize: 14,
          color: C.text,
          background: C.white,
          width: '100%',
          ...style,
        }}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Alert({ type = 'error', children }) {
  const map = {
    error:   { bg: C.dangerLt,  border: '#fecaca', color: C.danger,  icon: '⚠️' },
    warning: { bg: C.warningLt, border: '#fde68a', color: C.warning, icon: '⚠️' },
    success: { bg: C.successLt, border: '#bbf7d0', color: C.success, icon: '✅' },
    info:    { bg: C.infoLt,    border: '#bfdbfe', color: C.info,    icon: 'ℹ️' },
  }
  const s = map[type] || map.error
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
    }}>
      <span>{s.icon}</span>
      <span>{children}</span>
    </div>
  )
}

export function Spinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <span className="spinner spinner-green" style={{ width: size, height: size }} />
    </div>
  )
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: C.muted }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.textMd, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, marginBottom: 20 }}>{subtitle}</div>}
      {action}
    </div>
  )
}

export function StatCard({ label, value, icon, color, bg }) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        background: bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 18, marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || C.text }}>
        {value}
      </div>
    </Card>
  )
}
