import {
  MdCalendarMonth,
  MdCheckCircle,
  MdPhoneAndroid,
  MdWarningAmber
} from 'react-icons/md'
import {
  FaBolt,
  FaLeaf
} from 'react-icons/fa'
import {
  GiPlantSeed,
  GiWaterDrop,
  GiWheat
} from 'react-icons/gi'

import { C } from '../theme'
import {
  Badge,
  Btn
} from './UI'

// --------------------------------------------------
// STAGE ICON MAPPING
// --------------------------------------------------

const stageIconMap = {
  seedling: GiPlantSeed,
  seed: GiPlantSeed,
  basal: GiPlantSeed,

  water: GiWaterDrop,
  watering: GiWaterDrop,

  wheat: GiWheat,
  harvest: GiWheat,

  bolt: FaBolt,
  energy: FaBolt,

  leaf: FaLeaf,
  plant: FaLeaf
}

// --------------------------------------------------
// SELECT SUITABLE STAGE ICON
// --------------------------------------------------

function getStageIcon(stage, index) {
  const iconName = String(
    stage.stage_icon || ''
  ).toLowerCase()

  const stageName = String(
    stage.stage_name || ''
  ).toLowerCase()

  if (stageIconMap[iconName]) {
    return stageIconMap[iconName]
  }

  if (
    stageName.includes('basal') ||
    stageName.includes('planting')
  ) {
    return GiPlantSeed
  }

  if (
    stageName.includes('week 3') ||
    stageName.includes('week3')
  ) {
    return GiWaterDrop
  }

  if (
    stageName.includes('week 5') ||
    stageName.includes('week5')
  ) {
    return FaLeaf
  }

  if (
    stageName.includes('week 7') ||
    stageName.includes('week7')
  ) {
    return FaBolt
  }

  if (
    stageName.includes('week 8') ||
    stageName.includes('week8')
  ) {
    return GiWheat
  }

  const fallbackIcons = [
    GiPlantSeed,
    GiWaterDrop,
    FaLeaf,
    FaBolt,
    GiWheat
  ]

  return (
    fallbackIcons[index] ||
    FaLeaf
  )
}

// --------------------------------------------------
// FERTILIZER PILL
// --------------------------------------------------

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
        padding: '2px 10px',
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

// --------------------------------------------------
// TIMELINE COMPONENT
// --------------------------------------------------

export default function Timeline({
  stages = [],
  onSMS,
  sending,
  onMarkDone
}) {
  if (
    !Array.isArray(stages) ||
    stages.length === 0
  ) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: C.muted,
          padding: 32,
          fontSize: 13
        }}
      >
        No schedule stages yet.
      </div>
    )
  }

  const dotColor = {
    done: {
      border: C.success,
      bg: C.successLt
    },

    pending: {
      border: C.info,
      bg: C.infoLt
    },

    rescheduled: {
      border: C.warning,
      bg: C.warningLt
    },

    applied: {
      border: C.success,
      bg: C.successLt
    }
  }

  return (
    <div>
      {stages.map((stage, index) => {
        const color =
          dotColor[stage.status] ||
          dotColor.pending

        const isLast =
          index === stages.length - 1

        const stageName =
          stage.stage_name ||
          `Stage ${index + 1}`

        const StageIcon = getStageIcon(
          stage,
          index
        )

        const scheduledDate =
          stage.scheduled_date ||
          stage.date ||
          'Date not available'

        const showActions =
          stage.status !== 'done' &&
          stage.status !== 'applied'

        return (
          <div
            key={stage.id || index}
            className="fade"
            style={{
              display: 'flex',
              gap: 16,
              paddingBottom:
                isLast ? 0 : 24,
              position: 'relative',
              animationDelay:
                `${index * 60}ms`
            }}
          >
            {/* VERTICAL LINE */}

            {!isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: 15,
                  top: 36,
                  bottom: 0,
                  width: 2,
                  background: C.border
                }}
              />
            )}

            {/* STAGE ICON */}

            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border:
                  `2px solid ${color.border}`,
                background: color.bg,
                color: color.border,
                position: 'relative',
                zIndex: 1
              }}
            >
              <StageIcon size={16} />
            </div>

            {/* STAGE CONTENT */}

            <div style={{ flex: 1 }}>
              {/* STAGE NAME AND STATUS */}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                  flexWrap: 'wrap'
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.text
                  }}
                >
                  {stageName}
                </span>

                <Badge status={stage.status} />

                {stage.rescheduled && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: C.warning,
                      fontWeight: 600
                    }}
                  >
                    <MdWarningAmber size={14} />

                    Rain rescheduled
                  </span>
                )}
              </div>

              {/* SCHEDULED DATE */}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                  fontSize: 12,
                  color: C.muted,
                  marginBottom: 8
                }}
              >
                <MdCalendarMonth size={15} />

                <span>
                  {scheduledDate}
                </span>

                {stage.days_after !==
                  undefined &&
                  stage.days_after !== null && (
                    <>
                      <span>·</span>

                      <span>
                        Day {stage.days_after}{' '}
                        after planting
                      </span>
                    </>
                  )}

                {stage.original_date && (
                  <span
                    style={{
                      color: C.muted
                    }}
                  >
                    (was {stage.original_date})
                  </span>
                )}
              </div>

              {/* FERTILIZER PILLS */}

              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                  marginBottom: 8
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
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    background: C.bg,
                    color: C.muted,
                    border:
                      `1px solid ${C.border}`
                  }}
                >
                  Total {stage.total_kg || 0}kg
                </span>
              </div>

              {/* ACTION BUTTONS */}

              {showActions && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}
                >
                  {onSMS && (
                    <Btn
                      variant="ghost"
                      onClick={() =>
                        onSMS(stage)
                      }
                      loading={
                        sending === stage.id
                      }
                      disabled={
                        sending === stage.id
                      }
                      style={{
                        fontSize: 11,
                        padding: '4px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <MdPhoneAndroid size={14} />

                      Send Reminder
                    </Btn>
                  )}

                  {onMarkDone && (
                    <Btn
                      variant="secondary"
                      onClick={() =>
                        onMarkDone(stage)
                      }
                      style={{
                        fontSize: 11,
                        padding: '4px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <MdCheckCircle size={14} />

                      Mark Applied
                    </Btn>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}