import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Radio, Bell, BarChart3, Cpu, MessageSquare,
  LogOut, ChevronDown, CircleHelp, Search, Command, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', group: 'WORKSPACE' },
  { to: '/live', icon: Radio, label: 'Live monitor', group: 'WORKSPACE' },
  { to: '/alarms', icon: Bell, label: 'Alarm centre', group: 'WORKSPACE' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', group: 'INTELLIGENCE' },
  { to: '/model', icon: Cpu, label: 'Model & rules', group: 'INTELLIGENCE' },
  { to: '/chat', icon: MessageSquare, label: 'AI assistant', group: 'INTELLIGENCE' },
]

const PAGE_COPY: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Overview', subtitle: 'Security operations at a glance' },
  '/live': { title: 'Live monitor', subtitle: 'Streaming telemetry and detection events' },
  '/alarms': { title: 'Alarm centre', subtitle: 'Triage, acknowledge and resolve alerts' },
  '/analytics': { title: 'Analytics', subtitle: 'Detection trends and model performance' },
  '/model': { title: 'Model & rules', subtitle: 'Detection engine configuration and evidence' },
  '/chat': { title: 'AI assistant', subtitle: 'Ask questions about detections and system context' },
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const page = PAGE_COPY[location.pathname] || PAGE_COPY['/dashboard']
  const handleLogout = () => { logout(); navigate('/login') }

  const sidebar = (
    <>
      <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.07] px-5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200">
          <Shield size={21} />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d151f] bg-emerald-300" />
        </div>
        <div className="min-w-0"><p className="text-sm font-bold tracking-wide text-white">SENTINEL<span className="text-cyan-300">/ICS</span></p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">Industrial defence</p></div>
        <button className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
      </div>

      <div className="px-4 pt-5">
        <div className="mb-3 flex items-center justify-between px-2"><span className="text-[9px] font-bold tracking-[0.18em] text-slate-600">ENVIRONMENT</span><span className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.06] px-1.5 py-0.5 text-[9px] font-semibold text-emerald-200">LOCAL</span></div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/70 text-xs font-bold text-slate-200">OT</div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-200">ICS Operations</p><p className="mt-0.5 truncate text-[10px] text-slate-500">Process network · SWaT</p></div>
          <ChevronDown size={14} className="text-slate-600" />
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {['WORKSPACE', 'INTELLIGENCE'].map(group => <div key={group}>
          <p className="mb-2 px-3 text-[9px] font-bold tracking-[0.18em] text-slate-600">{group}</p>
          <div className="space-y-1">{NAV.filter(item => item.group === group).map(({ to, icon: Icon, label }) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium transition-all ${isActive ? 'bg-cyan-300/[0.09] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.12)]' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'}`}>
            {({ isActive }) => <><span className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${isActive ? 'bg-cyan-300/10 text-cyan-200' : 'text-slate-500 group-hover:text-slate-300'}`}><Icon size={16} /></span><span className="flex-1">{label}</span>{isActive && <span className="absolute bottom-2.5 left-0 top-2.5 w-0.5 rounded-full bg-cyan-300" />}</>}
          </NavLink>)}</div>
        </div>)}
      </nav>

      <div className="mx-4 mb-4 rounded-xl border border-cyan-300/10 bg-gradient-to-br from-cyan-300/[0.07] to-transparent p-3.5">
        <div className="flex items-center gap-2 text-cyan-200"><CircleHelp size={15} /><span className="text-[11px] font-semibold">Detection pipeline</span></div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Random Forest predictions are combined with process-aware rules before a final alert is raised.</p>
        <button onClick={() => { navigate('/model'); setMobileOpen(false) }} className="mt-3 text-[10px] font-semibold text-cyan-200 hover:text-white">Explore engine ↗</button>
      </div>

      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white">{(user?.username || 'U').slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-200">{user?.username || 'Operator'}</p><p className="mt-0.5 truncate text-[9px] uppercase tracking-wider text-slate-500">{(user?.role || 'OPERATOR').replace(/_/g, ' ')}</p></div>
          <button onClick={handleLogout} title="Sign out" className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"><LogOut size={15} /></button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1119] text-slate-100">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0d151f] md:flex">{sidebar}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Close menu overlay" className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[280px] flex-col border-r border-white/10 bg-[#0d151f] shadow-2xl">{sidebar}</aside></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-10 flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0d151f]/95 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 md:hidden" aria-label="Open navigation"><Menu size={19} /></button>
            <div className="min-w-0"><div className="flex items-center gap-2 text-[10px] text-slate-500"><span>WORKSPACE</span><span>/</span><span className="truncate text-slate-300">{page.title.toUpperCase()}</span></div><h2 className="mt-1 truncate text-sm font-semibold text-slate-100 sm:text-base">{page.subtitle}</h2></div>
          </div>
          <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-500 lg:flex"><Search size={13} /><span>ICS workspace</span><Command size={12} /></div>
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-300/10 bg-emerald-300/[0.04] px-3 py-2 sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /><span className="text-[10px] font-medium text-emerald-200">SECURE WORKSPACE</span></div>
            <div className="h-8 w-px bg-white/[0.08]" />
            <div className="text-right"><p className="text-[10px] font-semibold text-slate-300">{new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</p><p className="mt-0.5 text-[9px] text-slate-600">Local session</p></div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto"><Outlet /></main>
      </div>
    </div>
  )
}
