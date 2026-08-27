import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams
} from 'react-router-dom'
import {
  MdAdd,
  MdAgriculture,
  MdArrowBack,
  MdBadge,
  MdCalendarMonth,
  MdCancel,
  MdCheckCircle,
  MdLocationOn,
  MdPerson,
  MdPhone,
  MdSms,
  MdWaterDrop
} from 'react-icons/md'

import api from '../api/axios'
import { C } from '../theme'
import {
  Alert,
  Badge,
  Btn,
  Card,
  SectionTitle,
  Spinner
} from '../components/UI'
import Timeline from '../components/Timeline'

export default function FarmerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [farmer, setFarmer] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [smsLog, setSmsLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadAll()
  }, [id])

  // --------------------------------------------------
  // LOAD FARMER INFORMATION
  // --------------------------------------------------

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      const [
        farmerRes,
        scheduleRes,
        smsRes
      ] = await Promise.allSettled([
        api.get(`/farmers/${id}`),
        api.get(`/schedule/farmer/${id}`),
        api.get(`/sms/farmer/${id}`)
      ])

      if (farmerRes.status === 'fulfilled') {
        setFarmer(farmerRes.value.data)
      } else {
        setFarmer(null)
        setError('Failed to load farmer details.')
      }

      if (scheduleRes.status === 'fulfilled') {
        setSchedule(
          Array.isArray(scheduleRes.value.data)
            ? scheduleRes.value.data
            : []
        )
      } else {
        setSchedule([])
      }

      if (smsRes.status === 'fulfilled') {
        setSmsLog(
          Array.isArray(smsRes.value.data)
            ? smsRes.value.data
            : []
        )
      } else {
        setSmsLog([])
      }
    } catch (err) {
      console.error(err)

      setError('Failed to load farmer details.')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // SEND SMS
  // --------------------------------------------------

  async function handleSMS(stage) {
    if (!farmer) return

    setSending(stage.id)
    setSuccess('')
    setError('')

    try {
      const fertilizerParts = [
        parseFloat(stage.urea_kg) > 0 &&
          `Urea: ${stage.urea_kg}kg`,

        parseFloat(stage.tsp_kg) > 0 &&
          `TSP: ${stage.tsp_kg}kg`,

        parseFloat(stage.mop_kg) > 0 &&
          `MOP: ${stage.mop_kg}kg`
      ]
        .filter(Boolean)
        .join(', ')

      const fertilizerMessage =
        fertilizerParts
          ? ` ${fertilizerParts}.`
          : ''

      const message =
        `AgroSmart Reminder: ` +
        `${stage.stage_name} on ` +
        `${stage.scheduled_date}.` +
        `${fertilizerMessage} AgroSmart SL`

      await api.post('/sms/send', {
        phone: farmer.phone,
        message,
        farmer_id: farmer.id,
        stage_id: stage.id
      })

      setSuccess(
        `SMS sent to ${farmer.name} for ` +
          `${stage.stage_name}`
      )

      const smsRes = await api.get(
        `/sms/farmer/${id}`
      )

      setSmsLog(
        Array.isArray(smsRes.data)
          ? smsRes.data
          : []
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to send SMS.'
      )
    } finally {
      setSending(null)
    }
  }

  // --------------------------------------------------
  // MARK STAGE AS APPLIED
  // --------------------------------------------------

  async function handleMarkDone(stage) {
    setError('')
    setSuccess('')

    try {
      await api.patch(
        `/schedule/${stage.id}`,
        {
          status: 'applied'
        }
      )

      setSchedule(current =>
        current.map(item =>
          item.id === stage.id
            ? {
                ...item,
                status: 'applied'
              }
            : item
        )
      )

      setSuccess(
        `${stage.stage_name} marked as applied.`
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to update stage status.'
      )
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return <Spinner size={32} />
  }

  // --------------------------------------------------
  // FARMER NOT FOUND
  // --------------------------------------------------

  if (!farmer) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 48
        }}
      >
        <MdPerson
          size={44}
          color={C.muted}
          style={{
            marginBottom: 12
          }}
        />

        <div
          style={{
            color: C.muted
          }}
        >
          Farmer not found.

          <button
            type="button"
            onClick={() =>
              navigate('/farmers')
            }
            style={{
              color: C.green,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontFamily: 'inherit',
              marginLeft: 5
            }}
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // FERTILIZER TOTALS
  // --------------------------------------------------

  const totalUrea = schedule
    .reduce(
      (total, stage) =>
        total +
        parseFloat(stage.urea_kg || 0),
      0
    )
    .toFixed(1)

  const totalTSP = schedule
    .reduce(
      (total, stage) =>
        total +
        parseFloat(stage.tsp_kg || 0),
      0
    )
    .toFixed(1)

  const totalMOP = schedule
    .reduce(
      (total, stage) =>
        total +
        parseFloat(stage.mop_kg || 0),
      0
    )
    .toFixed(1)

  const farmerInformation = [
    {
      Icon: MdPhone,
      value: farmer.phone
    },

    farmer.nic
      ? {
          Icon: MdBadge,
          value: farmer.nic
        }
      : null,

    {
      Icon: MdLocationOn,
      value:
        `${farmer.gn_division}, ` +
        `${farmer.ds_area}`
    },

    {
      Icon: MdAgriculture,
      value: `${farmer.acres} acres`
    },

    {
      Icon: MdWaterDrop,
      value: farmer.cultivation_type,
      capitalize: true
    }
  ].filter(Boolean)

  const soilData = [
    {
      label: 'Soil pH',
      value:
        farmer.soil_ph ??
        '—',
      status:
        farmer.ph_status || ''
    },
    {
      label: 'Phosphorus',
      value:
        farmer.phosphorus_mg_kg ??
        '—',
      status:
        farmer.phosphorus_status || ''
    },
    {
      label: 'Potassium',
      value:
        farmer.potassium_mg_kg ??
        '—',
      status:
        farmer.potassium_status || ''
    },
    {
      label: 'Organic Matter',
      value:
        farmer.organic_matter_pct !== null &&
        farmer.organic_matter_pct !== undefined
          ? `${farmer.organic_matter_pct}%`
          : '—',
      status:
        farmer.organic_matter_status || ''
    }
  ]

  return (
    <div className="fade">
      {/* BACK BUTTON */}

      <button
        type="button"
        onClick={() =>
          navigate('/farmers')
        }
        style={{
          fontSize: 13,
          color: C.muted,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'inherit'
        }}
      >
        <MdArrowBack size={17} />
        Back to Farmers
      </button>

      {/* ALERTS */}

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">
            {error}
          </Alert>
        </div>
      )}

      {success && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="success">
            {success}
          </Alert>
        </div>
      )}

      {/* FARMER HEADER */}

      <Card
        style={{
          marginBottom: 20
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 20,
            flexWrap: 'wrap'
          }}
        >
          {/* FARMER AVATAR */}

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: C.greenLt,
              color: C.green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              flexShrink: 0,
              border:
                `2px solid ${C.borderMd}`
            }}
          >
            {farmer.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          {/* FARMER INFORMATION */}

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
                flexWrap: 'wrap'
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: C.text,
                  margin: 0
                }}
              >
                {farmer.name}
              </h2>

              <Badge
                status={
                  farmer.active_cycle
                    ? 'active'
                    : 'inactive'
                }
                label={
                  farmer.active_cycle
                    ? 'Active Cycle'
                    : 'No Cycle'
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 18,
                fontSize: 13,
                color: C.muted,
                flexWrap: 'wrap'
              }}
            >
              {farmerInformation.map(
                (
                  {
                    Icon,
                    value,
                    capitalize
                  },
                  index
                ) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      textTransform:
                        capitalize
                          ? 'capitalize'
                          : 'none'
                    }}
                  >
                    <Icon
                      size={16}
                      color={C.green}
                    />

                    {value}
                  </span>
                )
              )}
            </div>
          </div>

          {/* NEW CYCLE BUTTON */}

          <Btn
            onClick={() =>
              navigate('/new-cycle', {
                state: {
                  farmerId: farmer.id
                }
              })
            }
          >
            <MdAdd size={18} />
            New Cycle
          </Btn>
        </div>

        {/* SOIL DATA */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginTop: 18,
            paddingTop: 18,
            borderTop:
              `1px solid ${C.border}`
          }}
        >
          {soilData.map(
            (
              {
                label,
                value,
                status
              },
              index
            ) => (
              <div
                key={index}
                style={{
                  background: C.bg,
                  borderRadius: 8,
                  padding: '10px 14px',
                  border:
                    `1px solid ${C.border}`
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    marginBottom: 4
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.text
                  }}
                >
                  {value}
                </div>

                {status && (
                  <div
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      marginTop: 2
                    }}
                  >
                    {status}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </Card>

      {/* SCHEDULE AND SMS HISTORY */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 20
        }}
      >
        {/* FERTILIZER SCHEDULE */}

        <Card>
          <SectionTitle>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7
              }}
            >
              <MdCalendarMonth size={19} />
              Fertilizer Schedule
            </span>
          </SectionTitle>

          {schedule.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 32,
                color: C.muted
              }}
            >
              <MdCalendarMonth
                size={36}
                color={C.muted}
                style={{
                  marginBottom: 10
                }}
              />

              <div
                style={{
                  fontSize: 13
                }}
              >
                No schedule yet.
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/new-cycle', {
                    state: {
                      farmerId: farmer.id
                    }
                  })
                }
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: C.green,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <MdAdd size={17} />
                Create Crop Cycle
              </button>
            </div>
          ) : (
            <>
              <Timeline
                stages={schedule}
                onSMS={handleSMS}
                sending={sending}
                onMarkDone={handleMarkDone}
              />

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop:
                    `1px solid ${C.border}`,
                  display: 'flex',
                  gap: 20,
                  fontSize: 12,
                  flexWrap: 'wrap'
                }}
              >
                <span>
                  Urea:{' '}

                  <strong
                    style={{
                      color: C.success
                    }}
                  >
                    {totalUrea} kg
                  </strong>
                </span>

                <span>
                  TSP:{' '}

                  <strong
                    style={{
                      color: C.info
                    }}
                  >
                    {totalTSP} kg
                  </strong>
                </span>

                <span>
                  MOP:{' '}

                  <strong
                    style={{
                      color: C.warning
                    }}
                  >
                    {totalMOP} kg
                  </strong>
                </span>
              </div>
            </>
          )}
        </Card>

        {/* SMS HISTORY */}

        <Card>
          <SectionTitle>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7
              }}
            >
              <MdSms size={19} />
              SMS History ({smsLog.length})
            </span>
          </SectionTitle>

          {smsLog.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 32,
                color: C.muted,
                fontSize: 13
              }}
            >
              <MdSms
                size={34}
                color={C.muted}
                style={{
                  display: 'block',
                  margin: '0 auto 10px'
                }}
              />

              No SMS sent yet.
            </div>
          ) : (
            <div
              style={{
                maxHeight: 420,
                overflowY: 'auto'
              }}
            >
              {smsLog.map(
                (message, index) => {
                  const isSent =
                    message.status === 'sent'

                  return (
                    <div
                      key={message.id}
                      style={{
                        paddingBottom: 14,
                        marginBottom: 14,

                        borderBottom:
                          index <
                          smsLog.length - 1
                            ? `1px solid ${C.border}`
                            : 'none'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 5
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: C.muted
                          }}
                        >
                          {new Date(
                            message.sent_at
                          ).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }
                          )}
                        </span>

                        <Badge
                          status={message.status}
                          label={
                            <span
                              style={{
                                display:
                                  'inline-flex',
                                alignItems:
                                  'center',
                                gap: 4
                              }}
                            >
                              {isSent ? (
                                <MdCheckCircle
                                  size={13}
                                />
                              ) : (
                                <MdCancel
                                  size={13}
                                />
                              )}

                              {isSent
                                ? 'Sent'
                                : 'Failed'}
                            </span>
                          }
                        />
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: C.text,
                          lineHeight: 1.6,
                          background: C.bg,
                          padding: '8px 10px',
                          borderRadius: 6
                        }}
                      >
                        {message.message}
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}