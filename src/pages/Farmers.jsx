import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdAdd,
  MdAgriculture,
  MdCheckCircle,
  MdClose,
  MdCloud,
  MdDelete,
  MdGroups,
  MdPersonAdd,
  MdVisibility,
  MdWaterDrop
} from 'react-icons/md'
import api from '../api/axios'
import { C } from '../theme'
import {
  Card,
  SectionTitle,
  Btn,
  Input,
  Sel,
  Alert,
  Spinner,
  EmptyState
} from '../components/UI'

const DS_AREAS = [
  'Ratnapura',
  'Weligepola',
  'Balangoda',
  'Elapatha',
  'Godakawela',
  'Ayagama',
  'Eheliyagoda',
  'Kalawana',
  'Kuruwita',
  'Ibulpe'
]

const GN_BY_DS = {
  Ratnapura: [
    'Nivitigala',
    'Malangama',
    'Amunugoda',
    'Weralupa',
    'Kataliyanpalla'
  ],

  Weligepola: [
    'Amuduwa',
    'Galpala',
    'Gangodagama',
    'Panana',
    'Ranwala'
  ],

  Balangoda: [
    'Balangoda',
    'Aldora',
    'Bopawatta',
    'Dombagaha',
    'Mulgama'
  ],

  Elapatha: [
    'Elapatha',
    'Amunugoda',
    'Kahawatta',
    'Karanagoda',
    'Malangama'
  ],

  Godakawela: [
    'Godakawela',
    'Panadawela',
    'Ridiwita',
    'Kotaketha'
  ],

  Ayagama: [
    'Pallegama',
    'Hingura',
    'Modarawana',
    'Walgoda'
  ],

  Eheliyagoda: [
    'Arupola',
    'Kananda',
    'Mitipola',
    'Waliwita'
  ],

  Kalawana: [
    'Koswatta',
    'Meepagama',
    'Samanpura',
    'Kathalana'
  ],

  Kuruwita: [
    'Kuruwita',
    'Galukagama',
    'Kosdagoda',
    'Pussella'
  ],

  Ibulpe: [
    'Alkolawella',
    'Belihulaoya',
    'Meddegama',
    'Pinnawala'
  ]
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  nic: '',
  ds_area: '',
  gn_division: '',
  acres: '',
  cultivation_type: 'irrigated'
}

export default function Farmers() {
  const navigate = useNavigate()

  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadFarmers()
  }, [])

  // --------------------------------------------------
  // LOAD FARMERS
  // --------------------------------------------------

  async function loadFarmers() {
    setLoading(true)

    try {
      const { data } = await api.get('/farmers')

      setFarmers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)

      setError(
        'Failed to load farmers. Check your connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // FORM INPUT HANDLER
  // --------------------------------------------------

  const set = key => event => {
    setForm(current => ({
      ...current,
      [key]: event.target.value
    }))

    setFormErrors(current => ({
      ...current,
      [key]: ''
    }))
  }

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  function validate() {
    const errors = {}

    if (!form.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!form.phone.trim()) {
      errors.phone = 'Phone is required'
    }

    if (!form.ds_area) {
      errors.ds_area = 'Select DS Area'
    }

    if (!form.gn_division) {
      errors.gn_division = 'Select GN Division'
    }

    if (!form.acres || Number(form.acres) <= 0) {
      errors.acres = 'Enter valid acreage'
    }

    return errors
  }

  // --------------------------------------------------
  // REGISTER FARMER
  // --------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    const errors = validate()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setSubmitting(true)

    try {
      await api.post('/farmers', {
        ...form,
        acres: parseFloat(form.acres)
      })

      setSuccess(
        `${form.name} registered successfully!`
      )

      setForm(EMPTY_FORM)
      setShowForm(false)

      await loadFarmers()
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to register farmer.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------------------------
  // DELETE FARMER
  // --------------------------------------------------

  async function handleDelete(id, name) {
    const confirmed = window.confirm(
      `Delete farmer "${name}"? This cannot be undone.`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await api.delete(`/farmers/${id}`)

      setFarmers(current =>
        current.filter(farmer => farmer.id !== id)
      )

      setSuccess(
        `Farmer "${name}" deleted successfully.`
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to delete farmer.'
      )
    }
  }

  // --------------------------------------------------
  // GN OPTIONS
  // --------------------------------------------------

  const gnOpts = GN_BY_DS[form.ds_area] || []

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filtered = farmers.filter(farmer => {
    const searchText = search.toLowerCase().trim()

    return (
      farmer.name
        ?.toLowerCase()
        .includes(searchText) ||
      farmer.gn_division
        ?.toLowerCase()
        .includes(searchText) ||
      farmer.phone
        ?.toString()
        .includes(search.trim())
    )
  })

  // --------------------------------------------------
  // CHECK CYCLE
  // --------------------------------------------------

  function hasCycle(farmer) {
    return (
      farmer.cycle ||
      farmer.cycle_id ||
      farmer.cultivation_cycle ||
      farmer.current_cycle
    )
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="fade">
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          gap: 16,
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
            Farmers
          </h1>

          <p
            style={{
              fontSize: 13,
              color: C.muted
            }}
          >
            {farmers.length} registered · Ratnapura District
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap'
          }}
        >
          {/* SEARCH */}

          <input
            value={search}
            onChange={event =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, phone, GN…"
            style={{
              padding: '8px 12px',
              borderRadius: 7,
              border: `1.5px solid ${C.border}`,
              fontSize: 13,
              width: 220,
              color: C.text,
              outline: 'none'
            }}
          />

          {/* REGISTER FARMER */}

          <Btn
            onClick={() => {
              setShowForm(current => !current)
              setError('')
              setSuccess('')
              setFormErrors({})
            }}
          >
            {showForm ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <MdClose size={17} />
                Cancel
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <MdPersonAdd size={17} />
                Register Farmer
              </span>
            )}
          </Btn>
        </div>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">
            {error}
          </Alert>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {success && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="success">
            {success}
          </Alert>
        </div>
      )}

      {/* REGISTRATION FORM */}

      {showForm && (
        <Card
          style={{
            marginBottom: 24,
            border: `1.5px solid ${C.green}`
          }}
        >
          <SectionTitle>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7
              }}
            >
              <MdAgriculture size={19} />

              New Farmer Registration
            </span>
          </SectionTitle>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginBottom: 16
              }}
            >
              {/* FULL NAME */}

              <Input
                label="Full Name *"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Bandara Silva"
                error={formErrors.name}
              />

              {/* PHONE */}

              <Input
                label="Phone Number *"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+94 77 123 4567"
                type="tel"
                error={formErrors.phone}
              />

              {/* NIC */}

              <Input
                label="NIC Number"
                value={form.nic}
                onChange={set('nic')}
                placeholder="e.g. 901234567V"
              />

              {/* ACRES */}

              <Input
                label="Land Area (Acres) *"
                value={form.acres}
                onChange={set('acres')}
                placeholder="e.g. 2.5"
                type="number"
                step="0.1"
                min="0.1"
                error={formErrors.acres}
              />

              {/* DS AREA */}

              <Sel
                label="Divisional Secretariat *"
                value={form.ds_area}
                onChange={event => {
                  setForm(current => ({
                    ...current,
                    ds_area: event.target.value,
                    gn_division: ''
                  }))

                  setFormErrors(current => ({
                    ...current,
                    ds_area: '',
                    gn_division: ''
                  }))
                }}
                options={[
                  {
                    value: '',
                    label: 'Select DS Area'
                  },

                  ...DS_AREAS.map(ds => ({
                    value: ds,
                    label: ds
                  }))
                ]}
                error={formErrors.ds_area}
              />

              {/* GN DIVISION */}

              <Sel
                label="GN Division *"
                value={form.gn_division}
                onChange={set('gn_division')}
                options={[
                  {
                    value: '',
                    label: form.ds_area
                      ? 'Select GN Division'
                      : 'Select DS Area first'
                  },

                  ...gnOpts.map(gn => ({
                    value: gn,
                    label: gn
                  }))
                ]}
                disabled={!form.ds_area}
                error={formErrors.gn_division}
              />

              {/* CULTIVATION TYPE */}

              <div
                style={{
                  gridColumn: '1 / -1'
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'block',
                    marginBottom: 8
                  }}
                >
                  Cultivation Type *
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap'
                  }}
                >
                  {[
                    {
                      value: 'irrigated',
                      label: 'Irrigated (වාරිජලය)',
                      Icon: MdWaterDrop
                    },
                    {
                      value: 'rainfed',
                      label: 'Rain-fed (අහසදිය)',
                      Icon: MdCloud
                    }
                  ].map(({ value, label, Icon }) => (
                    <label
                      key={value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight:
                          form.cultivation_type === value
                            ? 700
                            : 400
                      }}
                    >
                      <input
                        type="radio"
                        name="cultivation_type"
                        value={value}
                        checked={
                          form.cultivation_type === value
                        }
                        onChange={set('cultivation_type')}
                        style={{
                          accentColor: C.green
                        }}
                      />

                      <Icon
                        size={17}
                        color={C.green}
                      />

                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* FORM BUTTONS */}

            <div
              style={{
                display: 'flex',
                gap: 10
              }}
            >
              <Btn
                type="submit"
                loading={submitting}
                disabled={submitting}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '11px'
                }}
              >
                {submitting ? (
                  'Registering…'
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                  >
                    <MdPersonAdd size={17} />
                    Register Farmer
                  </span>
                )}
              </Btn>

              <Btn
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setFormErrors({})
                  setForm(EMPTY_FORM)
                }}
              >
                Cancel
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* FARMERS TABLE */}

      <Card>
        <SectionTitle>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            <MdGroups size={19} />

            Registered Farmers ({filtered.length})
          </span>
        </SectionTitle>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MdGroups size={34} />}
            title={
              search
                ? 'No farmers match your search'
                : 'No farmers registered yet'
            }
            subtitle={
              search
                ? 'Try a different name or phone number'
                : 'Click "Register Farmer" to get started'
            }
          />
        ) : (
          <div
            style={{
              overflowX: 'auto'
            }}
          >
            <table>
              {/* TABLE HEADER */}

              <thead>
                <tr
                  style={{
                    borderBottom: `2px solid ${C.border}`
                  }}
                >
                  {[
                    'Farmer',
                    'GN Division',
                    'DS Area',
                    'Acres',
                    'Type',
                    'Soil pH',
                    'Cycle',
                    'Actions'
                  ].map(header => (
                    <th
                      key={header}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {filtered.map((farmer, index) => {
                  const cycle = hasCycle(farmer)

                  return (
                    <tr
                      key={farmer.id}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        transition: 'background 0.12s',
                        animation:
                          `fadeUp 0.25s ease ${
                            index * 40
                          }ms both`
                      }}
                      onMouseEnter={event => {
                        event.currentTarget.style.background =
                          C.bg
                      }}
                      onMouseLeave={event => {
                        event.currentTarget.style.background =
                          'transparent'
                      }}
                    >
                      {/* FARMER */}

                      <td
                        style={{
                          padding: '12px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: C.greenLt,
                              color: C.green,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                              border:
                                `1px solid ${C.borderMd}`
                            }}
                          >
                            {farmer.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13
                              }}
                            >
                              {farmer.name}
                            </div>

                            <div
                              style={{
                                fontSize: 11,
                                color: C.muted
                              }}
                            >
                              {farmer.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* GN DIVISION */}

                      <td
                        style={{
                          padding: '12px',
                          fontSize: 13
                        }}
                      >
                        {farmer.gn_division || '—'}
                      </td>

                      {/* DS AREA */}

                      <td
                        style={{
                          padding: '12px',
                          fontSize: 13,
                          color: C.muted
                        }}
                      >
                        {farmer.ds_area || '—'}
                      </td>

                      {/* ACRES */}

                      <td
                        style={{
                          padding: '12px',
                          fontSize: 13,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {farmer.acres} ac
                      </td>

                      {/* CULTIVATION TYPE */}

                      <td
                        style={{
                          padding: '12px',
                          fontSize: 12,
                          color: C.muted,
                          textTransform: 'capitalize'
                        }}
                      >
                        {farmer.cultivation_type || '—'}
                      </td>

                      {/* SOIL PH */}

                      <td
                        style={{
                          padding: '12px',
                          fontSize: 13
                        }}
                      >
                        {farmer.soil_ph !== null &&
                        farmer.soil_ph !== undefined ? (
                          <span
                            style={{
                              fontWeight: 600,
                              color:
                                parseFloat(farmer.soil_ph) > 7
                                  ? C.warning
                                  : C.success
                            }}
                          >
                            {farmer.soil_ph}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: C.muted
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* CYCLE */}

                      <td
                        style={{
                          padding: '12px',
                          fontSize: 12,
                          minWidth: 120
                        }}
                      >
                        {cycle ? (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                color: C.success,
                                fontWeight: 700
                              }}
                            >
                              <MdCheckCircle size={15} />

                              Active
                            </span>

                            {typeof cycle === 'object' && (
                              <span
                                style={{
                                  color: C.muted,
                                  fontSize: 11
                                }}
                              >
                                {cycle.name ||
                                  cycle.crop_name ||
                                  cycle.crop ||
                                  'Current cycle'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            style={{
                              color: C.muted,
                              fontStyle: 'italic',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            No cycle yet
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td
                        style={{
                          padding: '12px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center'
                          }}
                        >
                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/farmers/${farmer.id}`
                              )
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: C.info,
                              background: C.white,
                              border:
                                `1px solid ${C.border}`,
                              borderRadius: 7,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontFamily: 'inherit',
                              transition: 'all 0.14s',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={event => {
                              event.currentTarget.style.background =
                                C.infoLt

                              event.currentTarget.style.borderColor =
                                C.info
                            }}
                            onMouseLeave={event => {
                              event.currentTarget.style.background =
                                C.white

                              event.currentTarget.style.borderColor =
                                C.border
                            }}
                          >
                            <MdVisibility size={15} />
                            View
                          </button>

                          {/* NEW CYCLE */}

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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: C.green,
                              background: C.greenLt,
                              border:
                                `1px solid ${C.green}`,
                              borderRadius: 7,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontFamily: 'inherit',
                              transition: 'all 0.14s',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={event => {
                              event.currentTarget.style.background =
                                C.green

                              event.currentTarget.style.color =
                                C.white
                            }}
                            onMouseLeave={event => {
                              event.currentTarget.style.background =
                                C.greenLt

                              event.currentTarget.style.color =
                                C.green
                            }}
                          >
                            <MdAdd size={16} />
                            Cycle
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                farmer.id,
                                farmer.name
                              )
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: C.danger,
                              background: '#fff5f5',
                              border: '1px solid #fecaca',
                              borderRadius: 7,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontFamily: 'inherit',
                              transition: 'all 0.14s',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={event => {
                              event.currentTarget.style.background =
                                C.danger

                              event.currentTarget.style.color =
                                C.white

                              event.currentTarget.style.borderColor =
                                C.danger
                            }}
                            onMouseLeave={event => {
                              event.currentTarget.style.background =
                                '#fff5f5'

                              event.currentTarget.style.color =
                                C.danger

                              event.currentTarget.style.borderColor =
                                '#fecaca'
                            }}
                          >
                            <MdDelete size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}