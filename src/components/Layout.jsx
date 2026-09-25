import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { C, globalCSS } from '../theme'
import Dashboard from '../pages/Dashboard'
import Farmers from '../pages/Farmers'
import FarmerDetail from '../pages/FarmerDetail'
import NewCycle from '../pages/NewCycle'
import Schedule from '../pages/Schedule'
import Weather from '../pages/Weather'
import SMSLog from '../pages/SMSLog'
import {
  FaHome, FaUsers, FaPlusCircle,
  FaCalendarAlt, FaCloudSun, FaSms,
  FaSignOutAlt, FaBars, FaTimes
} from 'react-icons/fa'

const NAV = [
  { path: '/dashboard', icon: <FaHome size={16} />,        label: 'Dashboard' },
  { path: '/farmers',   icon: <FaUsers size={16} />,       label: 'Farmers'   },
  { path: '/new-cycle', icon: <FaPlusCircle size={16} />,  label: 'New Cycle' },
  { path: '/schedule',  icon: <FaCalendarAlt size={16} />, label: 'Schedule'  },
  { path: '/weather',   icon: <FaCloudSun size={16} />,    label: 'Weather'   },
  { path: '/sms',       icon: <FaSms size={16} />,         label: 'SMS Log'   },
]

const SIDEBAR_W = 220
const HEADER_H  = 56

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close the drawer whenever the route changes (e.g. tapping a nav link)
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <style>{globalCSS + `
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 18px;
          text-decoration: none;
          color: ${C.muted};
          border-left: 3px solid transparent;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.14s;
          user-select: none;
        }
        .nav-link:hover {
          background: ${C.greenXlt};
          color: ${C.green};
          border-left-color: ${C.borderMd};
        }
        .nav-link.active {
          background: ${C.greenXlt};
          color: ${C.green};
          border-left-color: ${C.green};
          font-weight: 700;
        }
        .signout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 7px;
          border: 1px solid ${C.border};
          background: transparent;
          color: ${C.muted};
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.14s;
        }
        .signout-btn:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid ${C.border};
          background: ${C.white};
          color: ${C.text};
          cursor: pointer;
          flex-shrink: 0;
        }
        .hamburger-btn:hover {
          background: ${C.greenXlt};
          border-color: ${C.borderMd};
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 900px) {
          .app-sidebar {
            transform: translateX(-100%);
            transition: transform 0.22s ease;
          }
          .app-sidebar.open {
            transform: translateX(0);
            box-shadow: 6px 0 20px rgba(0,0,0,0.18);
          }
          .app-main {
            margin-left: 0 !important;
          }
          .hamburger-btn {
            display: inline-flex;
          }
          .sidebar-overlay.show {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(10, 20, 10, 0.45);
            z-index: 90;
          }
          .header-subtitle {
            display: none;
          }
          .app-header {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .app-main-content {
            padding: 18px !important;
          }
        }

        @media (max-width: 480px) {
          .status-badge-text {
            display: none;
          }
          .status-badge {
            padding: 6px !important;
            width: 26px;
            height: 26px;
            justify-content: center;
          }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>

        {/* Backdrop shown behind the drawer on mobile */}
        <div
          className={`sidebar-overlay${mobileOpen ? ' show' : ''}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* SIDEBAR */}
        <aside className={`app-sidebar${mobileOpen ? ' open' : ''}`} style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: SIDEBAR_W,
          background: C.white,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}>

          {/* Logo bar - same height as top header */}
          <div style={{
            height: HEADER_H,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 18px',
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: 9,
              background: C.green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              flexShrink: 0,
            }}>
              AS
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.green, lineHeight: 1.2 }}>
                AgroSmart
              </div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>
                Sri Lanka
              </div>
            </div>
            <button
              className="hamburger-btn"
              style={{ display: mobileOpen ? 'inline-flex' : undefined }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Section label */}
          <div style={{ padding: '18px 18px 6px' }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: C.muted, letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, overflowY: 'auto' }}>
            {NAV.map(n => (
              <NavLink
                key={n.path}
                to={n.path}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 20 }}>
                  {n.icon}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User / sign out */}
          <div style={{
            borderTop: `1px solid ${C.border}`,
            padding: '14px 16px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34,
                borderRadius: '50%',
                background: C.greenLt,
                color: C.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0,
                border: `2px solid ${C.borderMd}`,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  color: C.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.name || 'Admin'}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>Administrator</div>
              </div>
            </div>
            <button className="signout-btn" onClick={logout}>
              <FaSignOutAlt size={11} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="app-main" style={{
          marginLeft: SIDEBAR_W,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}>

          {/* Top header - same height as logo bar */}
          <header className="app-header" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${C.border}`,
            height: HEADER_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '0 28px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
              <button
                className="hamburger-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <FaBars size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted, minWidth: 0, overflow: 'hidden' }}>
                <span style={{ whiteSpace: 'nowrap' }}>Ratnapura District</span>
                <span className="header-subtitle" style={{ color: C.border, fontSize: 16, lineHeight: 1 }}>·</span>
                <span className="header-subtitle" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Fertilizer Management System</span>
              </div>
            </div>
            <div className="status-badge" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: 20,
              background: C.successLt,
              border: `1px solid #bbf7d0`,
              fontSize: 12,
              color: C.success,
              fontWeight: 600,
              flexShrink: 0,
            }}>
              <span style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: C.success,
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span className="status-badge-text">System Online</span>
            </div>
          </header>

          {/* Page content */}
          <main className="app-main-content" style={{ flex: 1, padding: '28px', width: '100%', maxWidth: 1280 }}>
            <Routes>
              <Route path="/dashboard"   element={<Dashboard />}    />
              <Route path="/farmers"     element={<Farmers />}      />
              <Route path="/farmers/:id" element={<FarmerDetail />} />
              <Route path="/new-cycle"   element={<NewCycle />}     />
              <Route path="/schedule"    element={<Schedule />}     />
              <Route path="/weather"     element={<Weather />}      />
              <Route path="/sms"         element={<SMSLog />}       />
              <Route path="*"            element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  )
}
