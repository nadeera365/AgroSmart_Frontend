import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBolt,
  FaCalendarAlt,
  FaCheckCircle,
  FaEye,
  FaLeaf,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaPlus,
  FaSpinner,
  FaSyncAlt,
  FaTrash
} from 'react-icons/fa'
import {
  GiPlantSeed,
  GiWaterDrop,
  GiWheat
} from 'react-icons/gi'

import api from '../api/axios'
import { C } from '../theme'
import {
  Alert,
  Badge,
  Btn,
  Card,
  EmptyState,
  Spinner
} from '../components/UI'

const TABS = [
  'all',
  'pending',
  'applied',
  'done'
]

const stageIcons = {
  seedling: GiPlantSeed,
  water: GiWaterDrop,
  wheat: GiWheat,
  bolt: FaBolt,
  leaf: FaLeaf
}

function StageIcon({ name, size = 19 }) {
  const Icon = stageIcons[name] || FaLeaf

  return <Icon size={size} />
}

function FertilizerPill({
  name,
  value,
  background,
  color,
  border
}) {
  if (parseFloat(value) <= 0) {
    return null
  }

  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        background,
        color,
        border
      }}
    >
      {name} {value}kg
    </span>
  )
}

export default function Schedule() {
  const navigate = useNavigate()

  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const [
    selectedFarmer,
    setSelectedFarmer
  ] = useState('all')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sending, setSending] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadSchedule()
  }, [])

  async function loadSchedule() {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/schedule')

      setStages(
        Array.isArray(data) ? data : []
      )
    } catch (err) {
      console.error(err)

      setError('Failed to load schedule.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSMS(stage) {
    setSending(stage.id)
    setSuccess('')
    setError('')

    try {
      const parts = [
        parseFloat(stage.urea_kg) > 0 &&
          `Urea: ${stage.urea_kg}kg`,

        parseFloat(stage.tsp_kg) > 0 &&
          `TSP: ${stage.tsp_kg}kg`,

        parseFloat(stage.mop_kg) > 0 &&
          `MOP: ${stage.mop_kg}kg`
      ]
        .filter(Boolean)
        .join(', ')

      const fertilizerText = parts
        ? ` ${parts}.`
        : ''

      const message =
        `AgroSmart: ${stage.stage_name} on ` +
        `${stage.scheduled_date}.${fertilizerText}`

      await api.post('/sms/send', {
        phone: stage.farmer_phone,
        message,
        farmer_id: stage.farmer_id,
        stage_id: stage.id
      })

      setSuccess(
        `SMS sent to ${stage.farmer_name}`
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

      setStages(current =>
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
          'Failed to update stage.'
      )
    }
  }

  async function handleDelete(stage) {
    const confirmed = window.confirm(
      `Delete "${stage.stage_name}" for ` +
        `${stage.farmer_name}? ` +
        'This cannot be undone.'
    )

    if (!confirmed) return

    setDeleting(stage.id)
    setError('')
    setSuccess('')

    try {
      await api.delete(
        `/schedule/${stage.id}`
      )

      setStages(current =>
        current.filter(
          item => item.id !== stage.id
        )
      )

      setSuccess(
        'Stage deleted successfully.'
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to delete stage.'
      )
    } finally {
      setDeleting(null)
    }
  }

  const farmers = Array.from(
    new Map(
      stages.map(stage => [
        stage.farmer_id,
        {
          farmer_id: stage.farmer_id,
          farmer_name: stage.farmer_name
        }
      ])
    ).values()
  )

  const farmerFilteredStages =
    stages.filter(stage => {
      if (selectedFarmer === 'all') {
        return true
      }

      return (
        String(stage.farmer_id) ===
        String(selectedFarmer)
      )
    })

  const counts = {
    all: farmerFilteredStages.length,

    pending: farmerFilteredStages.filter(
      stage => stage.status === 'pending'
    ).length,

    applied: farmerFilteredStages.filter(
      stage => stage.status === 'applied'
    ).length,

    done: farmerFilteredStages.filter(
      stage => stage.status === 'done'
    ).length
  }

  const filtered =
    farmerFilteredStages.filter(stage => {
      if (filter === 'all') {
        return true
      }

      return stage.status === filter
    })

  const grouped = filtered.reduce(
    (result, stage) => {
      const key = stage.farmer_id

      if (!result[key]) {
        result[key] = {
          farmer_id: stage.farmer_id,
          farmer_name: stage.farmer_name,
          farmer_phone: stage.farmer_phone,
          gn_division: stage.gn_division,
          ds_area: stage.ds_area,
          stages: []
        }
      }

      result[key].stages.push(stage)

      return result
    },
    {}
  )

  const farmerGroups = Object.values(grouped)

  return (
    <div className="fade">
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.text,
              marginBottom: 4
            }}
          >
            Schedule
          </h1>

          <p
            style={{
              fontSize: 13,
              color: C.muted
            }}
          >
            {farmerGroups.length} farmer
            {farmerGroups.length !== 1
              ? 's'
              : ''}

            {' · '}

            {filtered.length} stage
            {filtered.length !== 1
              ? 's'
              : ''}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10
          }}
        >
          <button
            type="button"
            onClick={loadSchedule}
            style={{
              padding: '8px 14px',
              borderRadius: 7,
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.muted,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            <FaSyncAlt size={12} />
            Refresh
          </button>

          <Btn
            onClick={() =>
              navigate('/new-cycle')
            }
          >
            <FaPlus size={11} />
            New Cycle
          </Btn>
        </div>
      </div>

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

      {/* FARMER DROPDOWN */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16
        }}
      >
        <label
          htmlFor="farmer-filter"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.text
          }}
        >
          Farmer:
        </label>

        <select
          id="farmer-filter"
          value={selectedFarmer}
          onChange={event => {
            setSelectedFarmer(
              event.target.value
            )

            setFilter('all')
          }}
          style={{
            padding: '7px 12px',
            borderRadius: 7,
            border: `1px solid ${C.border}`,
            background: C.white,
            color: C.text,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
            minWidth: 220,
            outline: 'none'
          }}
        >
          <option value="all">
            All Farmers
          </option>

          {farmers.map(farmer => (
            <option
              key={farmer.farmer_id}
              value={farmer.farmer_id}
            >
              {farmer.farmer_name}
            </option>
          ))}
        </select>
      </div>

      {/* FILTER TABS */}

      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 20,
          flexWrap: 'wrap'
        }}
      >
        {TABS.map(tab => (
          <button
            type="button"
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 16px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontFamily: 'inherit',

              border: `1.5px solid ${
                filter === tab
                  ? C.green
                  : C.border
              }`,

              background:
                filter === tab
                  ? C.greenLt
                  : C.white,

              color:
                filter === tab
                  ? C.green
                  : C.muted,

              transition: 'all 0.14s'
            }}
          >
            {tab} ({counts[tab] || 0})
          </button>
        ))}
      </div>

      {/* CONTENT */}

      {loading ? (
        <Spinner />
      ) : farmerGroups.length === 0 ? (
        <EmptyState
          icon={
            <FaCalendarAlt size={28} />
          }
          title="No stages in this category"
          subtitle={
            'Try a different filter or ' +
            'create a new crop cycle'
          }
          action={
            <Btn
              onClick={() =>
                navigate('/new-cycle')
              }
            >
              <FaPlus size={11} />
              New Crop Cycle
            </Btn>
          }
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {farmerGroups.map(group => (
            <Card
              key={group.farmer_id}
              style={{
                padding: 0,
                overflow: 'hidden'
              }}
            >
              {/* FARMER HEADER */}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  padding: '14px 20px',
                  background: C.greenXlt,
                  borderBottom:
                    `1px solid ${C.border}`,
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: C.green,
                      color: C.white || '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0
                    }}
                  >
                    {group.farmer_name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.text
                      }}
                    >
                      {group.farmer_name}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        marginTop: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        flexWrap: 'wrap'
                      }}
                    >
                      <FaMapMarkerAlt size={10} />

                      <span>
                        {group.gn_division}

                        {group.ds_area
                          ? `, ${group.ds_area}`
                          : ''}
                      </span>

                      {group.farmer_phone && (
                        <>
                          <span>·</span>

                          <FaMobileAlt size={10} />

                          <span>
                            {group.farmer_phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.muted,
                      background: C.white,
                      border:
                        `1px solid ${C.border}`,
                      padding: '3px 10px',
                      borderRadius: 20
                    }}
                  >
                    {group.stages.length} stage
                    {group.stages.length !== 1
                      ? 's'
                      : ''}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/farmers/${group.farmer_id}`
                      )
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: C.info,
                      background: C.white,
                      border:
                        `1px solid ${C.border}`,
                      borderRadius: 7,
                      padding: '5px 12px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600
                    }}
                  >
                    <FaEye size={11} />
                    View Farmer
                  </button>
                </div>
              </div>

              {/* STAGES */}

              <div
                style={{
                  padding: '0 20px'
                }}
              >
                {group.stages.map(
                  (stage, index) => (
                    <div
                      key={stage.id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '14px 0',

                        borderBottom:
                          index <
                          group.stages.length - 1
                            ? `1px solid ${C.border}`
                            : 'none'
                      }}
                    >
                      {/* STAGE ICON */}

                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,

                          background:
                            stage.status ===
                            'applied'
                              ? C.successLt
                              : C.infoLt,

                          color:
                            stage.status ===
                            'applied'
                              ? C.success
                              : C.info,

                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <StageIcon
                          name={stage.stage_icon}
                          size={18}
                        />
                      </div>

                      {/* STAGE INFORMATION */}

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            marginBottom: 4
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: C.text
                            }}
                          >
                            {stage.stage_name}
                          </span>

                          <Badge
                            status={stage.status}
                          />
                        </div>

                        {/* DATE */}

                        <div
                          style={{
                            fontSize: 12,
                            color: C.muted,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <FaCalendarAlt size={11} />

                          <span>
                            {stage.scheduled_date}
                          </span>

                          {stage.days_after !==
                            undefined && (
                            <>
                              <span>·</span>

                              <span>
                                Day {stage.days_after}
                              </span>
                            </>
                          )}
                        </div>

                        {/* FERTILIZER VALUES */}

                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap'
                          }}
                        >
                          <FertilizerPill
                            name="Urea"
                            value={stage.urea_kg}
                            background={C.successLt}
                            color={C.success}
                            border="1px solid #bbf7d0"
                          />

                          <FertilizerPill
                            name="TSP"
                            value={stage.tsp_kg}
                            background={C.infoLt}
                            color={C.info}
                            border="1px solid #bfdbfe"
                          />

                          <FertilizerPill
                            name="MOP"
                            value={stage.mop_kg}
                            background={C.warningLt}
                            color={C.warning}
                            border="1px solid #fde68a"
                          />

                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 20,
                              fontSize: 11,
                              background: C.bg,
                              color: C.muted,
                              border:
                                `1px solid ${C.border}`
                            }}
                          >
                            Total {stage.total_kg}kg
                          </span>
                        </div>
                      </div>

                      {/* STAGE ACTIONS */}

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {stage.status !==
                          'applied' &&
                          stage.status !== 'done' && (
                            <>
                              <Btn
                                variant="ghost"
                                onClick={() =>
                                  handleSMS(stage)
                                }
                                loading={
                                  sending === stage.id
                                }
                                style={{
                                  fontSize: 11,
                                  padding: '4px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <FaMobileAlt size={11} />
                                SMS
                              </Btn>

                              <Btn
                                variant="secondary"
                                onClick={() =>
                                  handleMarkDone(stage)
                                }
                                style={{
                                  fontSize: 11,
                                  padding: '4px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <FaCheckCircle size={11} />
                                Applied
                              </Btn>
                            </>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(stage)
                          }
                          disabled={
                            deleting === stage.id
                          }
                          style={{
                            fontSize: 11,

                            color:
                              deleting === stage.id
                                ? C.muted
                                : C.danger,

                            background: 'none',

                            border: `1px solid ${
                              deleting === stage.id
                                ? C.border
                                : '#fecaca'
                            }`,

                            borderRadius: 6,
                            padding: '4px 12px',

                            cursor:
                              deleting === stage.id
                                ? 'not-allowed'
                                : 'pointer',

                            fontFamily: 'inherit',
                            fontWeight: 600,
                            transition: 'all 0.14s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {deleting === stage.id ? (
                            <FaSpinner
                              size={10}
                              className="spin"
                            />
                          ) : (
                            <>
                              <FaTrash size={10} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* FARMER TOTALS */}

              <div
                style={{
                  padding: '10px 20px',
                  background: C.bg,
                  borderTop:
                    `1px solid ${C.border}`,
                  display: 'flex',
                  gap: 20,
                  fontSize: 12,
                  flexWrap: 'wrap'
                }}
              >
                <span
                  style={{
                    color: C.muted
                  }}
                >
                  Season totals:
                </span>

                <span>
                  Urea{' '}

                  <strong
                    style={{
                      color: C.success
                    }}
                  >
                    {group.stages
                      .reduce(
                        (total, stage) =>
                          total +
                          parseFloat(
                            stage.urea_kg || 0
                          ),
                        0
                      )
                      .toFixed(1)}
                    kg
                  </strong>
                </span>

                <span>
                  TSP{' '}

                  <strong
                    style={{
                      color: C.info
                    }}
                  >
                    {group.stages
                      .reduce(
                        (total, stage) =>
                          total +
                          parseFloat(
                            stage.tsp_kg || 0
                          ),
                        0
                      )
                      .toFixed(1)}
                    kg
                  </strong>
                </span>

                <span>
                  MOP{' '}

                  <strong
                    style={{
                      color: C.warning
                    }}
                  >
                    {group.stages
                      .reduce(
                        (total, stage) =>
                          total +
                          parseFloat(
                            stage.mop_kg || 0
                          ),
                        0
                      )
                      .toFixed(1)}
                    kg
                  </strong>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}