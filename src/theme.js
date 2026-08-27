// AgroSmart — White/Green Professional Theme
export const C = {
  // Base
  bg:       '#f5f7f5',
  white:    '#ffffff',
  border:   '#e2e8e2',
  borderMd: '#c8d8c8',

  // Green scale
  green:    '#1e6b1e',
  greenMd:  '#2d8a2d',
  greenLt:  '#e8f5e8',
  greenXlt: '#f0faf0',

  // Sidebar
  sidebar:  '#ffffff',
  sidebarBorder: '#e2e8e2',

  // Text
  text:     '#1a2e1a',
  textMd:   '#374737',
  muted:    '#6b7f6b',

  // Status
  danger:   '#c0392b',
  dangerLt: '#fdf0ef',
  warning:  '#b45309',
  warningLt:'#fffbeb',
  info:     '#1d4ed8',
  infoLt:   '#eff6ff',
  success:  '#15803d',
  successLt:'#f0fdf4',
}

export const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: ${C.bg}; color: ${C.text}; font-size: 14px; line-height: 1.5; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  .fade { animation: fadeUp 0.25s ease both; }
  .spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
  .spinner-green { border-color: ${C.borderMd}; border-top-color: ${C.green}; }
  input, select, textarea, button { font-family: inherit; font-size: 14px; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(30,107,30,0.12); }
  table { border-collapse: collapse; width: 100%; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.borderMd}; border-radius: 3px; }
  a { text-decoration: none; }
`
