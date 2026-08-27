import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6)       return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.phone, form.password)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'e.g. Kamal Perera'    },
    { key: 'phone',    label: 'Phone Number',     type: 'tel',      placeholder: '+94 77 123 4567'       },
    { key: 'password', label: 'Password',         type: 'password', placeholder: 'Minimum 6 characters'  },
    { key: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password'  },
  ]

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

        .reg-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1.5px solid #d1d5db;
          font-size: 14px;
          font-family: inherit;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .reg-input:focus {
          border-color: #1e6b1e;
          box-shadow: 0 0 0 3px rgba(30,107,30,0.12);
        }
        .reg-input::placeholder { color: #9ca3af; }

        .reg-btn {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          background: #1e6b1e;
          color: #fff;
          border: none;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.15s, opacity 0.15s;
          margin-top: 6px;
        }
        .reg-btn:hover:not(:disabled) { background: #155215; }
        .reg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .reg-link { color: #1e6b1e; font-weight: 700; text-decoration: none; }
        .reg-link:hover { text-decoration: underline; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease both; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }

        @media (max-width: 768px) {
          .reg-left  { display: none !important; }
          .reg-right { width: 100% !important; }
        }
      `}</style>

      {/* ── Left panel — paddy field image ── */}
      <div className="reg-left" style={S.left}>
        <div style={S.overlay} />
        <div style={S.leftContent}>

          <div style={S.badge}>New Administrator</div>

          <h2 style={S.leftTitle}>
            Join the AgroSmart<br />
            Network
          </h2>

          <p style={S.leftSub}>
            Register to start managing fertilizer schedules for farmers across<br />
            the Ratnapura District.
          </p>

        </div>
      </div>

      {/* ── Right panel — register form ── */}
      <div className="reg-right fade-up" style={S.right}>

        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoIcon}>🌾</div>
          <div>
            <div style={S.logoName}>AgroSmart SL</div>
            <div style={S.logoSub}>Fertilizer Management System</div>
          </div>
        </div>

        <h1 style={S.formHeading}>Create account</h1>
        <p style={S.formSub}>Set up your administrator access</p>

        {/* Error */}
        {error && (
          <div style={S.error}>
            <span style={{ fontSize: 15 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: 22 }}>
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} style={S.field}>
              <label style={S.label}>{label}</label>
              <input
                className="reg-input"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                required
              />
            </div>
          ))}

          <button type="submit" className="reg-btn" disabled={loading}>
            {loading ? <><span className="spinner" />Creating account…</> : 'Create Account →'}
          </button>
        </form>

        {/* Divider */}
        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span style={S.dividerText}>already registered?</span>
          <div style={S.dividerLine} />
        </div>

        <p style={S.foot}>
          <Link to="/login" className="reg-link">
            ← Sign in to your account
          </Link>
        </p>

        {/* Footer note */}
        <div style={S.note}>
          <span style={{ color: '#1e6b1e' }}>🔒</span>
          Admin accounts only · Contact your supervisor for access
        </div>
      </div>
    </div>
  )
}

/* ── Styles ── */
const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },

  /* Left — image panel */
  left: {
    position: 'relative',
    width: '50%',
    flexShrink: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(5,25,5,0.4) 0%, rgba(5,30,5,0.82) 100%)',
  },

  leftContent: {
    position: 'relative',
    zIndex: 1,
    padding: '48px 52px',
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 14px',
    borderRadius: 20,
    background: 'rgba(141,198,63,0.2)',
    border: '1px solid rgba(141,198,63,0.4)',
    color: '#8dc63f',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.04em',
    marginBottom: 20,
  },

  leftTitle: {
    fontSize: 42,
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.15,
    marginBottom: 16,
    letterSpacing: '-0.01em',
  },

  leftSub: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 1.7,
    marginBottom: 32,
  },

  /* Right — form panel */
  right: {
    flex: 1,
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '48px 52px',
    minWidth: 0,
    overflowY: 'auto',
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 36,
  },

  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    background: 'linear-gradient(135deg, #1c2b1a, #2d7a2d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },

  logoName: {
    fontSize: 16,
    fontWeight: 800,
    color: '#1e6b1e',
    lineHeight: 1.2,
  },

  logoSub: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
  },

  formHeading: {
    fontSize: 26,
    fontWeight: 800,
    color: '#111827',
    marginBottom: 6,
    letterSpacing: '-0.01em',
  },

  formSub: {
    fontSize: 14,
    color: '#6b7280',
  },

  error: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 13,
    marginTop: 16,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    letterSpacing: '0.02em',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '24px 0 16px',
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: '#e5e7eb',
  },

  dividerText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  foot: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },

  note: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
    fontSize: 11,
    color: '#9ca3af',
    paddingTop: 20,
    borderTop: '1px solid #f3f4f6',
  },
}
