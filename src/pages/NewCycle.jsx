import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { C } from '../theme'
import { Card, SectionTitle, Sel, Btn, Alert, Spinner } from '../components/UI'
import Timeline from '../components/Timeline'

export default function NewCycle() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [farmers,       setFarmers]       = useState([])
  const [form,          setForm]          = useState({
    farmer_id:     location.state?.farmerId ? String(location.state.farmerId) : '',
    planting_date: '',
  })
  const [preview,  setPreview]  = useState([])
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [soilWarn, setSoilWarn] = useState('')

  useEffect(() => { loadFarmers() }, [])

  // Auto-generate preview when both fields set
  useEffect(() => {
    if (form.farmer_id && form.planting_date) generatePreview()
    else setPreview([])
  }, [form.farmer_id, form.planting_date])

  async function loadFarmers() {
    setLoading(true)
    try {
      const { data } = await api.get('/farmers')
      setFarmers(data)
    } catch {
      setError('Failed to load farmers.')
    } finally {
      setLoading(false)
    }
  }

  function generatePreview() {
    const farmer = farmers.find(f => String(f.id) === String(form.farmer_id))
    if (!farmer) return

    const isIrrigated = farmer.cultivation_type === 'irrigated'
    const acres = parseFloat(farmer.acres)

    // Use real soil data from backend if available
    const ureaPerAcre = isIrrigated
      ? parseFloat(farmer.irrigated_urea_kg_acre || 56)
      : parseFloat(farmer.rainfed_urea_kg_acre   || 56)
    const tspPerAcre  = isIrrigated
      ? parseFloat(farmer.irrigated_tsp_kg_acre  || 8)
      : parseFloat(farmer.rainfed_tsp_kg_acre    || 8)
    const mopPerAcre  = isIrrigated
      ? parseFloat(farmer.irrigated_mop_kg_acre  || 16)
      : parseFloat(farmer.rainfed_mop_kg_acre    || 16)

    const isPatternB = ureaPerAcre >= 70
    const ureaStages = isPatternB ? [0, 20, 30, 26, 14] : [0, 8, 22, 18, 8]
    const tspStages  = [tspPerAcre, 0, 0, 0, 0]
    const mopHalf    = Math.round(mopPerAcre / 2)
    const mopStages  = [0, 0, mopHalf, mopPerAcre - mopHalf, 0]

    const stageDefs = [
      { index: 0, stage_name: 'Basal Application',    stage_icon: '🌱', daysAfter: 0  },
      { index: 1, stage_name: 'Top Dress 1 — Week 3', stage_icon: '💧', daysAfter: 21 },
      { index: 2, stage_name: 'Top Dress 2 — Week 5', stage_icon: '🌾', daysAfter: 35 },
      { index: 3, stage_name: 'Top Dress 3 — Week 7', stage_icon: '⚡', daysAfter: 49 },
      { index: 4, stage_name: 'Top Dress 4 — Week 8', stage_icon: '🌿', daysAfter: 56 },
    ]

    const addDays = (dateStr, days) => {
      const d = new Date(dateStr)
      d.setDate(d.getDate() + days)
      return d.toISOString().split('T')[0]
    }

    const stages = stageDefs.map((s, i) => {
      const urea  = parseFloat((ureaStages[i] * acres).toFixed(2))
      const tsp   = parseFloat((tspStages[i]  * acres).toFixed(2))
      const mop   = parseFloat((mopStages[i]  * acres).toFixed(2))
      return {
        ...s,
        scheduled_date: addDays(form.planting_date, s.daysAfter),
        days_after:     s.daysAfter,
        urea_kg:   urea,
        tsp_kg:    tsp,
        mop_kg:    mop,
        total_kg:  parseFloat((urea + tsp + mop).toFixed(2)),
        status:    'pending',
        rescheduled: false,
      }
    }).filter(s => s.total_kg > 0)

    setPreview(stages)

    // soil warning
    if (ureaPerAcre === 0) setSoilWarn('Soil nutrients are already high in this area. Minimal chemical fertilizer recommended.')
    else setSoilWarn('')
  }

  async function handleSave() {
    if (!form.farmer_id || !form.planting_date) {
      setError('Please select a farmer and planting date.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await api.post('/schedule', {
        farmer_id:    parseInt(form.farmer_id),
        planting_date: form.planting_date,
      })
      setSuccess(`✅ Schedule created for ${data.farmer_name}! ${data.stages?.length || 0} stages planned.`)
      if (data.soil_warning) setSoilWarn(data.soil_warning)
      setTimeout(() => navigate('/schedule'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create schedule.')
    } finally {
      setSaving(false)
    }
  }

  const selectedFarmer = farmers.find(f => String(f.id) === String(form.farmer_id))

  return (
    <div className="fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>New Crop Cycle</h1>
        <p style={{ fontSize: 13, color: C.muted }}>Select a farmer and planting date to generate a fertilizer schedule</p>
      </div>

      {error   && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}
      {success && <div style={{ marginBottom: 16 }}><Alert type="success">{success}</Alert></div>}
      {soilWarn && <div style={{ marginBottom: 16 }}><Alert type="warning">{soilWarn}</Alert></div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Left: Inputs */}
        <Card>
          <SectionTitle>📋 Cycle Details</SectionTitle>
          {loading ? <Spinner /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Sel
                label="Select Farmer *"
                value={form.farmer_id}
                onChange={e => setForm(f => ({ ...f, farmer_id: e.target.value }))}
                options={[
                  { value: '', label: 'Choose a farmer…' },
                  ...farmers.map(f => ({
                    value: String(f.id),
                    label: `${f.name} — ${f.gn_division} (${f.acres} ac)`,
                  })),
                ]}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Planting Date *
                </label>
                <input
                  type="date"
                  value={form.planting_date}
                  onChange={e => setForm(f => ({ ...f, planting_date: e.target.value }))}
                  style={{
                    padding: '9px 12px', borderRadius: 7,
                    border: `1.5px solid ${C.border}`,
                    fontSize: 14, color: C.text,
                  }}
                />
              </div>

              {/* Selected farmer info */}
              {selectedFarmer && (
                <div style={{ background: C.greenXlt, borderRadius: 9, padding: 14, border: `1px solid ${C.borderMd}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 10 }}>Farmer Details</div>
                  {[
                    ['GN Division',  selectedFarmer.gn_division],
                    ['DS Area',      selectedFarmer.ds_area],
                    ['Acres',        `${selectedFarmer.acres} acres`],
                    ['Type',         selectedFarmer.cultivation_type],
                    ['Soil pH',      selectedFarmer.soil_ph || '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: C.muted }}>{k}</span>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize', color: C.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              <Btn
                onClick={handleSave}
                loading={saving}
                disabled={!selectedFarmer || !form.planting_date || preview.length === 0}
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                {saving ? 'Creating Schedule…' : '💾 Save Crop Cycle'}
              </Btn>

              <p style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>
                Schedule will check weather forecast and reschedule stages with high rain risk automatically.
              </p>
            </div>
          )}
        </Card>

        {/* Right: Preview */}
        <Card>
          <SectionTitle>👁️ Schedule Preview</SectionTitle>
          {preview.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 13 }}>
                Select a farmer and planting date<br />to preview the schedule
              </div>
            </div>
          ) : (
            <>
              <Timeline stages={preview} />
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                <span>Urea: <strong style={{ color: C.success }}>{preview.reduce((s, x) => s + x.urea_kg, 0).toFixed(1)} kg</strong></span>
                <span>TSP: <strong style={{ color: C.info }}>{preview.reduce((s, x) => s + x.tsp_kg, 0).toFixed(1)} kg</strong></span>
                <span>MOP: <strong style={{ color: C.warning }}>{preview.reduce((s, x) => s + x.mop_kg, 0).toFixed(1)} kg</strong></span>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
