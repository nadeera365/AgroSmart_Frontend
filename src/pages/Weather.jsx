import { useState, useEffect } from 'react'
import api from '../api/axios'
import { C } from '../theme'
import { Card, SectionTitle, Alert, Spinner } from '../components/UI'

export default function Weather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => { loadWeather() }, [])

  async function loadWeather() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/weather?lat=6.7&lon=80.4')
      setWeather(data)
    } catch {
      setError('Failed to load weather data. Check your OpenWeather API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Weather Monitor</h1>
          <p style={{ fontSize: 13, color: C.muted }}>Rain forecast and fertilizer schedule impact — Ratnapura District</p>
        </div>
        <button
          onClick={loadWeather}
          style={{ padding: '8px 14px', borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, color: C.muted, cursor: 'pointer', fontSize: 13 }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && <div style={{ marginBottom: 20 }}><Alert type="error">{error}</Alert></div>}

      {loading ? <Spinner size={32} /> : weather && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Current + 5-day — full width */}
          <Card style={{ gridColumn: '1 / -1', background: '#f0f9ff', borderColor: '#bae6fd' }}>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>

              {/* Current conditions */}
              <div style={{ minWidth: 180 }}>
                <SectionTitle>🌤 Current — Ratnapura</SectionTitle>
                <div style={{ fontSize: 52, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                  {weather.current?.temp}°C
                </div>
                <div style={{ color: '#0369a1', fontSize: 15, marginTop: 8, textTransform: 'capitalize' }}>
                  {weather.current?.condition}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  Humidity {weather.current?.humidity}% · Wind {weather.current?.wind} km/h
                </div>
                {weather.rainRisk && (
                  <div style={{
                    marginTop: 14,
                    padding: '8px 12px',
                    background: C.warningLt,
                    border: '1px solid #fde68a',
                    borderRadius: 8,
                    fontSize: 12,
                    color: C.warning,
                    fontWeight: 700,
                    display: 'inline-block',
                  }}>
                    ⚠️ High rain risk detected
                  </div>
                )}
              </div>

              {/* 5-day forecast */}
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  5-Day Forecast
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {weather.forecast?.map((f, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: 'center',
                      padding: '12px 6px', borderRadius: 9,
                      background: f.warn ? '#fff7ed' : C.white,
                      border: `1px solid ${f.warn ? '#fed7aa' : C.border}`,
                    }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{f.day}</div>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{f.temp}°</div>
                      <div style={{ fontSize: 11, marginTop: 4, fontWeight: f.warn ? 700 : 400, color: f.warn ? C.danger : C.muted }}>
                        {f.rain}%
                      </div>
                      {f.warn && (
                        <div style={{ fontSize: 9, color: C.danger, fontWeight: 700, marginTop: 4 }}>⚠ HIGH</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Rainfall risk bars */}
          <Card>
            <SectionTitle>📊 Rainfall Risk Index</SectionTitle>
            {weather.forecast?.map((f, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: C.text, fontWeight: 500 }}>{f.day}</span>
                  <span style={{ fontWeight: 700, color: f.warn ? C.danger : C.success }}>{f.rain}%</span>
                </div>
                <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${f.rain}%`,
                    borderRadius: 4,
                    background: f.warn
                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                      : 'linear-gradient(90deg, #22c55e, #16a34a)',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '10px 14px', background: C.bg, borderRadius: 8, fontSize: 12, color: C.muted }}>
              💡 Stages with &gt;60% rain probability are automatically rescheduled by 3 days when creating a new cycle.
            </div>
          </Card>

          {/* Advisory card */}
          <Card>
            <SectionTitle>📋 Fertilizer Advisory</SectionTitle>
            {weather.rainRisk ? (
              <div>
                <div style={{ background: C.warningLt, border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
                  <strong>⚠️ High Rain Risk:</strong> Avoid fertilizer application on high-risk days. Chemical fertilizers applied before heavy rain can wash off and cause waste or environmental damage.
                </div>
                {[
                  { title: 'Recommended Days', value: weather.forecast?.filter(f => !f.warn).map(f => f.day).join(', ') || 'None this week', color: C.success },
                  { title: 'Avoid Days',       value: weather.forecast?.filter(f => f.warn).map(f => f.day).join(', ')  || 'None',           color: C.danger  },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === 0 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{item.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: C.successLt, border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#166534' }}>
                ✅ <strong>Good conditions</strong> — No significant rain risk detected this week. Safe to proceed with fertilizer applications as scheduled.
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Best Times to Apply
              </div>
              {['Early morning (6–9 AM)', 'Evening (4–6 PM)', 'After light rain clears', 'When wind is calm'].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: C.textMd }}>
                  <span style={{ color: C.success, fontSize: 14 }}>✓</span>
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
