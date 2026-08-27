import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { C } from '../theme'
import {
  Card,
  SectionTitle,
  StatCard,
  Spinner,
  Alert,
  Btn
} from '../components/UI'
import Timeline from '../components/Timeline'

import {
  MdPeople,
  MdGrass,
  MdCalendarMonth,
  MdCloud,
  MdWaterDrop,
  MdWbSunny,
  MdAdd,
  MdNotifications,
  MdArrowForward,
} from 'react-icons/md'

export default function Dashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      const [farmersRes, scheduleRes, weatherRes] =
        await Promise.allSettled([
          api.get('/farmers'),
          api.get('/schedule'),
          api.get('/weather?lat=6.7&lon=80.4'),
        ])

      const farmers =
        farmersRes.status === 'fulfilled'
          ? farmersRes.value.data
          : []

      const schedule =
        scheduleRes.status === 'fulfilled'
          ? scheduleRes.value.data
          : []

      const wx =
        weatherRes.status === 'fulfilled'
          ? weatherRes.value.data
          : null

      setStats({
        total: farmers.length,
        active: farmers.filter(
          (f) => f.active_cycle
        ).length,
        pending: schedule.filter(
          (s) => s.status === 'pending'
        ).length,
        rescheduled: schedule.filter(
          (s) => s.rescheduled
        ).length,
      })

      setUpcoming(schedule.slice(0, 4))
      setWeather(wx)

    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spinner size={32} />
  }

  return (
    <div className="fade">

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: C.text,
            marginBottom: 4,
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            fontSize: 13,
            color: C.muted,
          }}
        >
          Overview of your fertilizer management system
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 20 }}>
          <Alert type="error">
            {error}
          </Alert>
        </div>
      )}

      {/* Weather Alert */}
      {weather?.rainRisk && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <MdWaterDrop
            size={22}
            color={C.warning}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: C.warning,
                marginBottom: 3,
              }}
            >
              Rain Alert — Ratnapura Region
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#92400e',
              }}
            >
              High rainfall probability detected.
              Some fertilizer stages may be
              automatically rescheduled.
            </div>
          </div>

          <Btn
            variant="ghost"
            onClick={() => navigate('/weather')}
            style={{
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            View Forecast
          </Btn>
        </div>
      )}

      {/* Stat Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Total Farmers"
            value={stats.total}
            icon={<MdPeople size={24} />}
            bg={C.greenLt}
          />

          <StatCard
            label="Active Cycles"
            value={stats.active}
            icon={<MdGrass size={24} />}
            bg={C.successLt}
          />

          <StatCard
            label="Pending Stages"
            value={stats.pending}
            icon={
              <MdCalendarMonth size={24} />
            }
            bg={C.infoLt}
          />

          <StatCard
            label="Rescheduled"
            value={stats.rescheduled}
            icon={<MdCloud size={24} />}
            bg={C.warningLt}
          />
        </div>
      )}

      {/* Bottom Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >

        {/* Upcoming Schedule */}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MdCalendarMonth
                size={19}
                color={C.green}
              />

              <SectionTitle>
                Upcoming Applications
              </SectionTitle>
            </div>

            <button
              onClick={() =>
                navigate('/schedule')
              }
              style={{
                fontSize: 12,
                color: C.green,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              View all →
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 32,
                color: C.muted,
                fontSize: 13,
              }}
            >
              No upcoming applications.
            </div>
          ) : (
            <Timeline stages={upcoming} />
          )}
        </Card>

        {/* Right Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >

          {/* Weather Card */}
          <Card
            style={{
              background: '#f0f9ff',
              borderColor: '#bae6fd',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <MdWbSunny
                size={20}
                color="#0369a1"
              />

              <SectionTitle>
                Weather — Ratnapura
              </SectionTitle>
            </div>

            {weather ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 20,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 38,
                        fontWeight: 800,
                        color: C.text,
                      }}
                    >
                      {weather.current?.temp}°C
                    </div>

                    <div
                      style={{
                        color: '#0369a1',
                        fontSize: 13,
                        marginTop: 3,
                        textTransform:
                          'capitalize',
                      }}
                    >
                      {weather.current?.condition}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        marginTop: 2,
                      }}
                    >
                      Humidity{' '}
                      {weather.current?.humidity}%
                      {' · '}
                      Wind{' '}
                      {weather.current?.wind}
                      {' km/h'}
                    </div>
                  </div>

                  <div
                    style={{
                      marginLeft: 'auto',
                    }}
                  >
                    <MdWbSunny
                      size={48}
                      color="#0284c7"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                  }}
                >
                  {weather.forecast?.map(
                    (f, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '8px 4px',
                          borderRadius: 7,
                          background: f.warn
                            ? '#fff7ed'
                            : C.white,
                          border: `1px solid ${
                            f.warn
                              ? '#fed7aa'
                              : C.border
                          }`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: C.muted,
                            marginBottom: 3,
                          }}
                        >
                          {f.day}
                        </div>

                        <div
                          style={{
                            fontSize: 16,
                            marginBottom: 3,
                          }}
                        >
                          {f.icon}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {f.temp}°
                        </div>

                        <div
                          style={{
                            fontSize: 10,
                            color: f.warn
                              ? C.danger
                              : C.muted,
                            fontWeight: f.warn
                              ? 700
                              : 400,
                          }}
                        >
                          {f.rain}%
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  color: C.muted,
                  fontSize: 13,
                }}
              >
                Weather data unavailable.
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <MdCloud
                size={20}
                color={C.green}
              />

              <SectionTitle>
                Quick Actions
              </SectionTitle>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {[
                {
                  label: 'Register New Farmer',
                  path: '/farmers',
                  desc: 'Add a farmer to the system',
                  icon: (
                    <MdAdd size={20} />
                  ),
                },
                {
                  label: 'Start New Crop Cycle',
                  path: '/new-cycle',
                  desc: 'Create fertilizer schedule',
                  icon: (
                    <MdGrass size={20} />
                  ),
                },
                {
                  label: 'Send SMS Reminders',
                  path: '/sms',
                  desc: 'View and send SMS notifications',
                  icon: (
                    <MdNotifications
                      size={20}
                    />
                  ),
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() =>
                    navigate(a.path)
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition:
                      'border-color 0.15s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        color: C.green,
                        display: 'flex',
                      }}
                    >
                      {a.icon}
                    </span>

                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.text,
                          marginBottom: 2,
                        }}
                      >
                        {a.label}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                        }}
                      >
                        {a.desc}
                      </div>
                    </div>
                  </div>

                  <MdArrowForward
                    size={18}
                    color={C.muted}
                  />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}