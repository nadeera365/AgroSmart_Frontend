import { useState, useEffect } from 'react'
import api from '../api/axios'
import { C } from '../theme'
import {
  Card,
  SectionTitle,
  Badge,
  Btn,
  Input,
  Alert,
  Spinner,
  EmptyState,
  StatCard,
} from '../components/UI'

import {
  FiRefreshCw,
  FiX,
  FiMail,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiMessageSquare,
  FiSmartphone,
} from 'react-icons/fi'

export default function SMSLog() {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    phone: '',
    message: '',
  })

  useEffect(() => {
    loadLog()
  }, [])

  async function loadLog() {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/sms/log')
      setLog(data)
    } catch {
      setError('Failed to load SMS history.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e) {
    e.preventDefault()

    if (!form.phone.trim() || !form.message.trim()) {
      setError('Phone and message are required.')
      return
    }

    setSending(true)
    setError('')
    setSuccess('')

    try {
      await api.post('/sms/send', {
        phone: form.phone,
        message: form.message,
      })

      setSuccess(`SMS sent to ${form.phone}`)

      setForm({
        phone: '',
        message: '',
      })

      setComposing(false)

      await loadLog()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to send SMS.'
      )
    } finally {
      setSending(false)
    }
  }

  const sent = log.filter(
    m => m.status === 'sent'
  ).length

  const failed = log.filter(
    m => m.status === 'failed'
  ).length

  const today = new Date().toDateString()

  const todayCount = log.filter(
    m =>
      new Date(m.sent_at).toDateString() === today
  ).length

  return (
    <div className="fade">

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.text,
              marginBottom: 4,
            }}
          >
            SMS Log
          </h1>

          <p
            style={{
              fontSize: 13,
              color: C.muted,
            }}
          >
            Reminder history and manual SMS alerts
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            onClick={loadLog}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              borderRadius: 7,
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.muted,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          >
            <FiRefreshCw size={15} />
            Refresh
          </button>

          <Btn
            onClick={() => {
              setComposing(!composing)
              setError('')
              setSuccess('')
            }}
          >
            {composing ? (
              <>
                <FiX size={15} />
                Cancel
              </>
            ) : (
              <>
                <FiMail size={15} />
                Send Manual SMS
              </>
            )}
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Sent"
          value={log.length}
          icon={<FiSend />}
          color={C.text}
          bg={C.greenLt}
        />

        <StatCard
          label="Delivered"
          value={sent}
          icon={<FiCheckCircle />}
          color={C.success}
          bg={C.successLt}
        />

        <StatCard
          label="Failed"
          value={failed}
          icon={<FiXCircle />}
          color={C.danger}
          bg={C.dangerLt}
        />

        <StatCard
          label="Today"
          value={todayCount}
          icon={<FiCalendar />}
          color={C.info}
          bg={C.infoLt}
        />
      </div>

      {/* Alerts */}
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

      {/* Compose Manual SMS */}
      {composing && (
        <Card
          style={{
            marginBottom: 20,
            border: `1.5px solid ${C.green}`,
          }}
        >
          <SectionTitle>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <FiMessageSquare size={17} />
              Compose Manual SMS
            </span>
          </SectionTitle>

          <form onSubmit={handleSend}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <Input
                label="Phone Number *"
                value={form.phone}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    phone: e.target.value,
                  }))
                }
                placeholder="+94 77 XXX XXXX"
                type="tel"
                required
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Message *
                </label>

                <textarea
                  value={form.message}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      message: e.target.value,
                    }))
                  }
                  rows={3}
                  maxLength={160}
                  required
                  style={{
                    padding: '9px 12px',
                    borderRadius: 7,
                    border: `1.5px solid ${C.border}`,
                    fontSize: 13,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    color: C.text,
                  }}
                  placeholder="Type your message... (max 160 characters)"
                />

                <div
                  style={{
                    fontSize: 11,
                    color:
                      form.message.length > 140
                        ? C.danger
                        : C.muted,
                    textAlign: 'right',
                  }}
                >
                  {form.message.length}/160
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                }}
              >
                <Btn
                  type="submit"
                  loading={sending}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <FiSend size={15} />
                  Send SMS
                </Btn>

                <Btn
                  variant="secondary"
                  onClick={() =>
                    setComposing(false)
                  }
                >
                  <FiX size={15} />
                  Cancel
                </Btn>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Message History */}
      <Card>
        <SectionTitle>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <FiMessageSquare size={17} />
            Message History ({log.length})
          </span>
        </SectionTitle>

        {loading ? (
          <Spinner />
        ) : log.length === 0 ? (
          <EmptyState
            icon={<FiSmartphone size={28} />}
            title="No SMS sent yet"
            subtitle="SMS reminders are sent automatically when creating crop cycles, or you can send them manually."
          />
        ) : (
          log.map((msg, i) => (
            <div
              key={msg.id}
              className="fade"
              style={{
                display: 'flex',
                gap: 14,
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom:
                  i < log.length - 1
                    ? `1px solid ${C.border}`
                    : 'none',
                animationDelay: `${i * 35}ms`,
              }}
            >

              {/* Avatar */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background:
                    msg.status === 'sent'
                      ? C.greenLt
                      : C.dangerLt,
                  color:
                    msg.status === 'sent'
                      ? C.green
                      : C.danger,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                  border: `1px solid ${
                    msg.status === 'sent'
                      ? C.borderMd
                      : '#fecaca'
                  }`,
                }}
              >
                {msg.farmer_name
                  ?.charAt(0)
                  ?.toUpperCase() || '?'}
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 4,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {msg.farmer_name || 'Manual'}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      color: C.muted,
                    }}
                  >
                    {msg.phone}
                  </span>

                  <Badge
                    status={msg.status}
                    label={
                      msg.status === 'sent'
                        ? 'Delivered'
                        : 'Failed'
                    }
                  />
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: C.textMd,
                    lineHeight: 1.6,
                    marginBottom: 6,
                    background: C.bg,
                    padding: '8px 10px',
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {msg.message}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    color: C.muted,
                  }}
                >
                  <FiCalendar size={12} />

                  {new Date(
                    msg.sent_at
                  ).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}