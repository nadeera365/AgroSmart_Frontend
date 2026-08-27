import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm]     = useState({ phone: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.phone, form.password)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

        .login-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          border: 1.5px solid #d1d5db;
          font-size: 14px;
          font-family: inherit;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input:focus {
          border-color: #1e6b1e;
          box-shadow: 0 0 0 3px rgba(30,107,30,0.12);
        }
        .login-input::placeholder { color: #9ca3af; }

        .login-btn {
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
        }
        .login-btn:hover:not(:disabled) { background: #155215; }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .login-link { color: #1e6b1e; font-weight: 700; text-decoration: none; }
        .login-link:hover { text-decoration: underline; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease both; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
          .login-left  { display: none !important; }
          .login-right { width: 100% !important; }
        }
      `}</style>

      {/* ── Left panel — paddy field image ── */}
      <div className="login-left" style={S.left}>

        {/* Dark overlay for readability */}
        <div style={S.overlay} />

        {/* Content over image */}
        <div style={S.leftContent}>
          <div style={S.badge}> Ratnapura District</div>

          <h2 style={S.leftTitle}>
            Smart Fertilizer Management for<br />
            Sri Lankan Farmers
          </h2>

          <p style={S.leftSub}>
            Precision farming powered by soil data, weather forecasts <br />
            and SMS notifications.
          </p>

        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="login-right fade-up" style={S.right}>

        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoIcon}>🌾</div>
          <div>
            <div style={S.logoName}>AgroSmart SL</div>
            <div style={S.logoSub}>Fertilizer Management System</div>
          </div>
        </div>

        <h1 style={S.formHeading}>Welcome back</h1>
        <p style={S.formSub}>Sign in to manage your farmers and schedules</p>

        {/* Error */}
        {error && (
          <div style={S.error}>
            <span style={{ fontSize: 15 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div style={S.field}>
            <label style={S.label}>Phone Number</label>
            <input
              className="login-input"
              type="tel"
              placeholder="+94 77 123 4567"
              value={form.phone}
              onChange={set('phone')}
              required
            />
          </div>

          <div style={S.field}>
            <label style={S.label}>Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={set('password')}
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <><span className="spinner" />Signing in…</> : 'Sign In →'}
          </button>
        </form>

        {/* Divider */}
        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span style={S.dividerText}>or</span>
          <div style={S.dividerLine} />
        </div>

        <p style={S.foot}>
          Don't have an account?{' '}
          <Link to="/register" className="login-link">
            Create one here
          </Link>
        </p>

        {/* Footer note */}
        <div style={S.note}>
          <span style={{ color: '#1e6b1e' }}>🔒</span>
          Secure login · Data stays within your organization
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
    width: '55%',
    flexShrink: 0,
    // Sri Lankan paddy field from Unsplash (free to use)
    backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(10,30,10,0.35) 0%, rgba(10,40,10,0.75) 100%)',
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
    lineHeight: 1.2,
    marginBottom: 16,
    letterSpacing: '-0.01em',
  },

  leftSub: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 1.7,
    marginBottom: 36,
  },

  statsRow: {
    display: 'flex',
    gap: 32,
    paddingTop: 28,
    borderTop: '1px solid rgba(255,255,255,0.15)',
  },

  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: '#8dc63f',
    lineHeight: 1,
  },

  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },

  /* Right — form panel */
  right: {
    flex: 1,
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '56px 52px',
    minWidth: 0,
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
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
    marginBottom: 0,
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
    marginTop: 20,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 7,
    letterSpacing: '0.02em',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '28px 0 20px',
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: '#e5e7eb',
  },

  dividerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: 500,
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
    marginTop: 32,
    fontSize: 11,
    color: '#9ca3af',
    paddingTop: 24,
    borderTop: '1px solid #f3f4f6',
  },
}
