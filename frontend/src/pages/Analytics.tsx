import { useState, useEffect } from 'react'
import { getOverview, getAlarmStats, getRecentPredictions, getModelInfo } from '../services/api'
import { Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7']

export default function Analytics() {
  const [overview, setOverview] = useState<any>(null)
  const [alarmStats, setAlarmStats] = useState<any>(null)
  const [recent, setRecent] = useState<any[]>([])
  const [model, setModel] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    Promise.all([getOverview(), getAlarmStats(), getRecentPredictions(200), getModelInfo()]).then(([ov, as_, re, mi]) => {
      setOverview(ov); setAlarmStats(as_); setRecent([...re].reverse()); setModel(mi)
    })
  }, [])

  const exportReport = () => {
    setExporting(true)
    const columns = ['timestamp', 'final_label', 'severity', 'ml_probability', 'rule_violation_count', 'source', 'affected_sensors', 'explanation']
    const escape = (value: unknown) => {
      const raw = Array.isArray(value) ? value.join('; ') : String(value ?? '')
      return `"${raw.replace(/"/g, '""')}"`
    }
    const csv = [columns.join(','), ...recent.map(row => columns.map(key => escape(row[key])).join(','))].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ics-detection-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  if (!overview) return <div className="p-6 text-gray-400">Loading analytics…</div>

  const detectionData = [
    { name: 'Normal', value: overview.normal_count, fill: '#22c55e' },
    { name: 'Suspicious', value: overview.suspicious_count, fill: '#eab308' },
    { name: 'Attack', value: overview.attack_count, fill: '#ef4444' },
  ]

  const alarmSevData = alarmStats ? Object.entries(alarmStats.by_severity || {}).map(([k, v]) => ({ name: k, value: v })) : []
  const timeData = recent.map((r, i) => ({ i, prob: +(r.ml_probability * 100).toFixed(1), label: r.final_label }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-white">Analytics</h1><p className="mt-1 text-sm text-gray-500">Explore detection outcomes, alarm patterns, and model evaluation.</p></div>
        <button onClick={exportReport} disabled={exporting || recent.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"><Download size={15} /> Export report CSV</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Detection distribution */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Detection Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={detectionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                {detectionData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 border-t border-gray-800 pt-3">
            {detectionData.map(item => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </div>
                <p className="text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alarm severity */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Alarms by Severity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={alarmSevData}>
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
              <Bar dataKey="value" fill="#f97316" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ML probability over time */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 col-span-2">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">ML Attack Probability — Recent 50 Readings</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="i" stroke="#9ca3af" tick={{ fontSize: 10 }} label={{ value: 'Reading #', position: 'insideBottom', fill: '#9ca3af', fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" tick={{ fontSize: 10 }} label={{ value: '%', position: 'insideLeft', fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }} formatter={(v: number) => [`${v}%`, 'Attack Prob']} />
              <Line type="monotone" dataKey="prob" stroke="#06b6d4" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500">Dashed line at 70% = decision threshold (fusion_config)</div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div><h2 className="text-sm font-semibold text-gray-300">Model evaluation snapshot</h2><p className="mt-1 text-xs text-gray-500">Validation metrics reported by the backend configuration</p></div>
          <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-gray-400">{model?.model_type || 'Model metrics'}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          {[
            ['Precision', model?.validated_performance?.precision],
            ['Recall', model?.validated_performance?.recall],
            ['F1 score', model?.validated_performance?.f1],
            ['False-positive rate', model?.validated_performance?.fpr],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-lg border border-white/[0.05] bg-gray-950/50 p-3 text-center">
              <p className="text-2xl font-bold text-cyan-300">{typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : '—'}</p>
              <p className="mt-1 text-xs text-gray-500">{k}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-600">These are configured validation results, not a measurement of the current uploaded file. Evaluate against a separate labelled test set before making production-accuracy claims.</p>
      </div>
    </div>
  )
}
