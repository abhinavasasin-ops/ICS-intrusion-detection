import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, AlertTriangle, ShieldCheck, ShieldAlert, Cpu, Database, Wifi,
  RefreshCw, ArrowUpRight, Upload, Radio, ChevronRight, Clock3, Zap, CheckCircle2,
} from 'lucide-react'
import {
  getOverview, getRecentPredictions, getHealth, getModelInfo,
} from '../services/api'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

interface Overview {
  total_readings: number
  normal_count: number
  suspicious_count: number
  attack_count: number
  active_alarms: number
  critical_alarms: number
  false_positive_count: number
}
interface Detection {
  id: string
  timestamp: string
  final_label: string
  ml_probability: number
  severity?: string | null
  rule_violation_count?: number
  affected_sensors?: string[]
  source?: string
  explanation?: string
}

const number = (v?: number) => (v ?? 0).toLocaleString()
const labelStyle: Record<string, string> = {
  Attack: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
  Suspicious: 'text-amber-200 bg-amber-400/10 border-amber-400/20',
  Normal: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
}
const severityStyle: Record<string, string> = {
  CRITICAL: 'text-rose-300 bg-rose-400/10',
  HIGH: 'text-orange-300 bg-orange-400/10',
  MEDIUM: 'text-amber-200 bg-amber-400/10',
  LOW: 'text-sky-300 bg-sky-400/10',
}

function MetricCard({ title, value, note, icon: Icon, tone, onClick }: {
  title: string; value: string; note: string; icon: typeof Activity; tone: string; onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="group min-w-0 rounded-2xl border border-white/[0.07] bg-[#101923] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-[#131f2b] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-400">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">{value}</p>
        </div>
        <span className={`rounded-xl border border-white/5 p-2.5 ${tone}`}><Icon size={19} /></span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{note}</span>
        <ArrowUpRight size={15} className="text-slate-600 transition group-hover:text-cyan-300" />
      </div>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [recent, setRecent] = useState<Detection[]>([])
  const [health, setHealth] = useState<any>(null)
  const [model, setModel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true)
    try {
      const [ov, rec, h, m] = await Promise.all([
        getOverview(), getRecentPredictions(40), getHealth(), getModelInfo(),
      ])
      setOverview(ov)
      setRecent(rec)
      setHealth(h)
      setModel(m)
      setError('')
    } catch {
      setError('Could not reach every service. Check that the backend is running.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const timer = window.setInterval(() => refresh(true), 15000)
    return () => window.clearInterval(timer)
  }, [refresh])

  const trend = useMemo(() => {
    const sorted = [...recent].reverse()
    return sorted.map((r, i) => ({
      index: i + 1,
      probability: Math.round((Number(r.ml_probability) || 0) * 1000) / 10,
      label: r.final_label,
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))
  }, [recent])

  const systems = [
    { label: 'API service', ok: health?.status === 'ok', detail: health?.status === 'ok' ? 'Responding normally' : 'Connection unavailable', icon: Wifi },
    { label: 'Detection model', ok: !!health?.model_loaded, detail: health?.model_loaded ? model?.model_type || 'Model loaded' : 'Model unavailable', icon: Cpu },
    { label: 'Fusion engine', ok: !!model?.fusion_logic, detail: model?.fusion_logic ? `${model.fusion_logic} decision strategy` : 'Status not confirmed', icon: Zap },
    { label: 'API data layer', ok: health?.status === 'ok', detail: health?.status === 'ok' ? 'Backend health check passed' : 'Health check unavailable', icon: Database },
  ]

  if (loading) return <div className="flex min-h-full items-center justify-center bg-[#0a1119] text-sm text-slate-400"><RefreshCw className="mr-2 animate-spin" size={16} /> Preparing security overview…</div>

  const total = overview?.total_readings ?? 0
  const threats = (overview?.attack_count ?? 0) + (overview?.suspicious_count ?? 0)
  const threatRate = total ? (threats / total) * 100 : 0
  const perf = model?.validated_performance

  return (
    <div className="min-h-full bg-[#0a1119] text-slate-100">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 xl:p-8">
        <header className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" /> Security operations centre
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Security overview</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Monitor industrial process telemetry, investigate anomalies, and track detection activity from one workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/live')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]"><Radio size={16} /> Live monitor</button>
            <button onClick={() => navigate('/live')} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"><Upload size={16} /> Analyse traffic <ChevronRight size={15} /></button>
            <button aria-label="Refresh dashboard" onClick={() => refresh(true)} className="rounded-xl border border-white/10 p-2.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"><RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} /></button>
          </div>
        </header>

        {error && <div className="flex items-center gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100"><AlertTriangle size={17} />{error}</div>}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Traffic records analysed" value={number(overview?.total_readings)} note="Unique analysed records" icon={Activity} tone="bg-cyan-300/10 text-cyan-200" onClick={() => navigate('/live')} />
          <MetricCard title="Confirmed attack labels" value={number(overview?.attack_count)} note="Model + rule fusion output" icon={ShieldAlert} tone="bg-rose-400/10 text-rose-300" onClick={() => navigate('/alarms')} />
          <MetricCard title="Suspicious activity" value={number(overview?.suspicious_count)} note={`${threatRate.toFixed(1)}% flagged across all records`} icon={AlertTriangle} tone="bg-amber-300/10 text-amber-200" onClick={() => navigate('/analytics')} />
          <MetricCard title="Open alarms" value={number(overview?.active_alarms)} note={`${number(overview?.critical_alarms)} critical unresolved`} icon={ShieldCheck} tone="bg-violet-300/10 text-violet-200" onClick={() => navigate('/alarms')} />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
          <div className="rounded-2xl border border-white/[0.07] bg-[#101923] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="font-semibold text-slate-100">Detection signal</h2><p className="mt-1 text-xs text-slate-500">Recent model attack probability · newest records at right</p></div>
              <span className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-xs text-cyan-200">Auto-refresh · 15s</span>
            </div>
            <div className="mt-5 h-[250px]">
              {trend.length ? <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="probFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.28} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="#243140" strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={28} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ background: '#111d29', border: '1px solid #2a3a4b', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Attack probability']} labelFormatter={v => `Observed ${v}`} />
                  <Area type="monotone" dataKey="probability" stroke="#22d3ee" strokeWidth={2} fill="url(#probFill)" activeDot={{ r: 4, fill: '#67e8f9', stroke: '#0a1119', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer> : <div className="flex h-full flex-col items-center justify-center text-center"><Activity className="mb-3 text-slate-600" size={28} /><p className="text-sm text-slate-300">No detection history yet</p><p className="mt-1 text-xs text-slate-500">Analyse a CSV or start the simulator to populate the signal.</p><button onClick={() => navigate('/live')} className="mt-4 text-xs font-semibold text-cyan-200 hover:text-cyan-100">Open live monitor →</button></div>}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-300" /> Random Forest probability</span>
              <span>{recent.length} latest records loaded</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#101923] p-4 sm:p-5">
            <div className="flex items-start justify-between"><div><h2 className="font-semibold">Platform health</h2><p className="mt-1 text-xs text-slate-500">Service readiness snapshot</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${health?.status === 'ok' && model?.model_loaded ? 'bg-emerald-300/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>{health?.status === 'ok' && model?.model_loaded ? 'Operational' : 'Degraded'}</span></div>
            <div className="mt-5 space-y-1">
              {systems.map(({ label, ok, detail, icon: Icon }) => <div key={label} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-white/[0.025]">
                <span className={`rounded-lg p-2 ${ok ? 'bg-emerald-300/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}><Icon size={16} /></span>
                <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">{label}</p><p className="mt-0.5 truncate text-xs text-slate-500">{detail}</p></div>
                <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-300' : 'bg-amber-300'}`} />
              </div>)}
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0b131d] p-3">
              <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Active detection rules</span><span className="font-semibold text-slate-100">{number(model?.active_rules?.length)}</span></div>
              <div className="mt-3 flex items-center justify-between text-xs"><span className="text-slate-400">Fusion strategy</span><span className="rounded-md bg-cyan-300/10 px-2 py-1 font-mono text-cyan-200">{model?.fusion_logic || '—'}</span></div>
              <div className="mt-3 flex items-center justify-between text-xs"><span className="text-slate-400">Decision threshold</span><span className="font-mono text-slate-200">{typeof model?.decision_threshold === 'number' ? `${(model.decision_threshold * 100).toFixed(0)}%` : '—'}</span></div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101923]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5"><div><h2 className="font-semibold">Recent detections</h2><p className="mt-1 text-xs text-slate-500">Latest prediction events from your account</p></div><button onClick={() => navigate('/live')} className="text-xs font-semibold text-cyan-200 hover:text-cyan-100">View all <ChevronRight size={13} className="ml-1 inline" /></button></div>
            {recent.length ? <div className="divide-y divide-white/[0.05]">
              {recent.slice(0, 6).map((r) => <button key={r.id} onClick={() => navigate('/live')} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.025] sm:px-5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${r.final_label === 'Attack' ? 'bg-rose-400/10 text-rose-300' : r.final_label === 'Suspicious' ? 'bg-amber-300/10 text-amber-200' : 'bg-emerald-300/10 text-emerald-200'}`}>{r.final_label === 'Attack' ? <ShieldAlert size={17} /> : r.final_label === 'Suspicious' ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}</span>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-slate-200">{r.final_label || 'Unknown'}</span>{r.severity && <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold tracking-wide ${severityStyle[r.severity] || 'bg-white/5 text-slate-300'}`}>{r.severity}</span>}</div><p className="mt-1 truncate text-xs text-slate-500">{(r.affected_sensors || []).slice(0, 3).join(', ') || r.explanation || r.source || 'No additional evidence recorded'}</p></div>
                <div className="shrink-0 text-right"><p className={`text-xs font-semibold ${labelStyle[r.final_label]?.split(' ')[0] || 'text-slate-300'}`}>{(Number(r.ml_probability || 0) * 100).toFixed(1)}%</p><p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-600"><Clock3 size={10} />{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
              </button>)}
            </div> : <div className="p-8 text-center"><Activity className="mx-auto mb-3 text-slate-600" size={24} /><p className="text-sm text-slate-300">Your event feed is waiting</p><p className="mt-1 text-xs text-slate-500">Run a sample or upload your first dataset.</p></div>}
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#101923] p-4 sm:p-5">
            <div className="flex items-center gap-2"><div className="rounded-lg bg-violet-300/10 p-2 text-violet-200"><Zap size={17} /></div><div><h2 className="font-semibold">Detection summary</h2><p className="mt-0.5 text-xs text-slate-500">Current stored records</p></div></div>
            <div className="mt-5 space-y-4">
              {[
                { name: 'Normal', count: overview?.normal_count ?? 0, color: '#34d399' },
                { name: 'Suspicious', count: overview?.suspicious_count ?? 0, color: '#fbbf24' },
                { name: 'Attack', count: overview?.attack_count ?? 0, color: '#fb7185' },
              ].map(item => {
                const pct = total ? item.count / total * 100 : 0
                return <div key={item.name}><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-300">{item.name}</span><span className="font-mono text-slate-400">{number(item.count)} <span className="text-slate-600">({pct.toFixed(1)}%)</span></span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.color }} /></div></div>
              })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0b131d] p-3"><p className="text-xs text-slate-500">False positives</p><p className="mt-1 text-xl font-semibold text-slate-100">{number(overview?.false_positive_count)}</p></div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0b131d] p-3"><p className="text-xs text-slate-500">Clean records</p><p className="mt-1 text-xl font-semibold text-emerald-200">{number(overview?.normal_count)}</p></div>
            </div>
            {perf && <p className="mt-4 text-[11px] leading-relaxed text-slate-600">Model evaluation values are available in Model Info. Evaluation metrics should be interpreted against their validation dataset, not as live operational accuracy.</p>}
          </div>
        </section>
        <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-4 text-[11px] text-slate-600 sm:flex-row"><span>ICS Threat Intelligence Workspace · Industrial telemetry analysis</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Dashboard refreshes every 15 seconds</span></footer>
      </div>
    </div>
  )
}
