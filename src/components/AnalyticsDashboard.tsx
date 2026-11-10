import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"

// ── Types ─────────────────────────────────────────────────────────────────────

interface RealtimeData {
  activeUsers: number
  activeUsers5m: number
  byCountry: { country: string; activeUsers: number }[]
  byCity: { city: string; activeUsers: number }[]
  byPage: { page: string; activeUsers: number }[]
  byDevice: { device: string; activeUsers: number }[]
}

interface DateRow {
  date: string
  activeUsers: number
  newUsers: number
  totalUsers: number
  sessions: number
  pageViews: number
  avgSessionDuration: number
  engagedSessions: number
}

interface GeoRow {
  country: string
  city: string
  users: number
  sessions: number
}

interface TechRow {
  device: string
  browser: string
  os: string
  users: number
}

interface PageRow {
  path: string
  title: string
  views: number
  users: number
}

interface SourceRow {
  source: string
  medium: string
  sessions: number
  users: number
}

interface HistoricalData {
  byDate: DateRow[]
  byGeo: GeoRow[]
  byTech: TechRow[]
  byPage: PageRow[]
  bySource: SourceRow[]
  summary: {
    activeUsers: number
    newUsers: number
    totalUsers: number
    sessions: number
    pageViews: number
    avgSessionDuration: number
    engagedSessions: number
  } | null
}

// ── Country name → ISO 3166-1 numeric code (for world-atlas) ─────────────────

const COUNTRY_ISO: Record<string, string> = {
  'Afghanistan': '4', 'Albania': '8', 'Algeria': '12', 'Andorra': '20', 'Angola': '24',
  'Antarctica': '10', 'Antigua and Barbuda': '28', 'Argentina': '32', 'Armenia': '51',
  'Aruba': '533', 'Australia': '36', 'Austria': '40', 'Azerbaijan': '31', 'Bahamas': '44',
  'Bahrain': '48', 'Bangladesh': '50', 'Barbados': '52', 'Belarus': '112', 'Belgium': '56',
  'Belize': '84', 'Benin': '204', 'Bermuda': '60', 'Bhutan': '64', 'Bolivia': '68',
  'Bosnia and Herzegovina': '70', 'Botswana': '72', 'Brazil': '76', 'Brunei': '96',
  'Bulgaria': '100', 'Burkina Faso': '854', 'Burundi': '108', 'Cambodia': '116',
  'Cameroon': '120', 'Canada': '124', 'Cape Verde': '132', 'Cayman Islands': '136',
  'Central African Republic': '140', 'Chad': '148', 'Chile': '152', 'China': '156',
  'Colombia': '170', 'Comoros': '174', 'Congo': '178', 'Cook Islands': '184',
  'Costa Rica': '188', 'Croatia': '191', 'Cuba': '192', 'Cyprus': '196', 'Czech Republic': '203',
  'Czechia': '203', 'Denmark': '208', 'Djibouti': '262', 'Dominica': '212',
  'Dominican Republic': '214', 'Ecuador': '218', 'Egypt': '818', 'El Salvador': '222',
  'Equatorial Guinea': '226', 'Eritrea': '232', 'Estonia': '233', 'Ethiopia': '231',
  'Fiji': '242', 'Finland': '246', 'France': '250', 'Gabon': '266', 'Gambia': '270',
  'Georgia': '268', 'Germany': '276', 'Ghana': '288', 'Greece': '300', 'Grenada': '308',
  'Guatemala': '320', 'Guinea': '324', 'Guinea-Bissau': '624', 'Guyana': '328',
  'Haiti': '332', 'Honduras': '340', 'Hong Kong': '344', 'Hungary': '348', 'Iceland': '352',
  'India': '356', 'Indonesia': '360', 'Iran': '364', 'Iraq': '368', 'Ireland': '372',
  'Israel': '376', 'Italy': '380', 'Jamaica': '388', 'Japan': '392', 'Jordan': '400',
  'Kazakhstan': '398', 'Kenya': '404', 'Kiribati': '296', 'Kuwait': '414', 'Kyrgyzstan': '417',
  'Laos': '418', 'Latvia': '428', 'Lebanon': '422', 'Lesotho': '426', 'Liberia': '430',
  'Libya': '434', 'Liechtenstein': '438', 'Lithuania': '440', 'Luxembourg': '442',
  'Macao': '446', 'Macedonia': '807', 'Madagascar': '450', 'Malawi': '454', 'Malaysia': '458',
  'Maldives': '462', 'Mali': '466', 'Malta': '470', 'Marshall Islands': '584', 'Mauritania': '478',
  'Mauritius': '480', 'Mexico': '484', 'Micronesia': '583', 'Moldova': '498', 'Monaco': '492',
  'Mongolia': '496', 'Montenegro': '499', 'Morocco': '504', 'Mozambique': '508', 'Myanmar': '104',
  'Namibia': '516', 'Nauru': '520', 'Nepal': '524', 'Netherlands': '528', 'New Zealand': '554',
  'Nicaragua': '558', 'Niger': '562', 'Nigeria': '566', 'Norway': '578', 'Oman': '512',
  'Pakistan': '586', 'Palau': '585', 'Palestine': '275', 'Panama': '591', 'Papua New Guinea': '598',
  'Paraguay': '600', 'Peru': '604', 'Philippines': '608', 'Poland': '616', 'Portugal': '620',
  'Puerto Rico': '630', 'Qatar': '634', 'Romania': '642', 'Russia': '643', 'Rwanda': '646',
  'Saint Kitts and Nevis': '659', 'Saint Lucia': '662', 'Saint Vincent and the Grenadines': '670',
  'Samoa': '882', 'San Marino': '674', 'Sao Tome and Principe': '678', 'Saudi Arabia': '682',
  'Senegal': '686', 'Serbia': '688', 'Seychelles': '690', 'Sierra Leone': '694', 'Singapore': '702',
  'Slovakia': '703', 'Slovenia': '705', 'Solomon Islands': '90', 'Somalia': '706',
  'South Africa': '710', 'South Korea': '410', 'South Sudan': '728', 'Spain': '724',
  'Sri Lanka': '144', 'Sudan': '729', 'Suriname': '740', 'Swaziland': '748', 'Sweden': '752',
  'Switzerland': '756', 'Syria': '760', 'Taiwan': '158', 'Tajikistan': '762', 'Tanzania': '834',
  'Thailand': '764', 'Timor-Leste': '626', 'Togo': '768', 'Tonga': '776', 'Trinidad and Tobago': '780',
  'Tunisia': '788', 'Turkey': '792', 'Turkmenistan': '795', 'Tuvalu': '798', 'Uganda': '800',
  'Ukraine': '804', 'United Arab Emirates': '784', 'United Kingdom': '826', 'United States': '840',
  'Uruguay': '858', 'Uzbekistan': '860', 'Vanuatu': '548', 'Vatican City': '336', 'Venezuela': '862',
  'Vietnam': '704', 'Western Sahara': '732', 'Yemen': '887', 'Zambia': '894', 'Zimbabwe': '716',
  "Côte d'Ivoire": '384', 'Ivory Coast': '384', 'Democratic Republic of the Congo': '180',
  'Palestinian Territories': '275', 'USA': '840', 'UK': '826', 'UAE': '784'
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n?: number) => n?.toLocaleString() ?? '—'
const pct = (n?: number) => n != null ? `${(n * 100).toFixed(1)}%` : '—'
const fmtDur = (s?: number) => {
  if (s == null) return '—'
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${mins}m ${secs}s`
}
const fmtDate = (s: string) => s.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3')
const CHART_THEME = {
  grid: '#1e293b',
  tooltip: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 },
  tick: { fontSize: 11, fill: '#64748b' },
}

const RANGES = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '6M', value: '180d' },
  { label: '1Y', value: '365d' },
]

// ── World Map (D3 + Zoom + Pan) ───────────────────────────────────────────────

function WorldMap({ data }: { data: { country: string; activeUsers: number }[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; country: string; users: number } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!svgRef.current) return
    let cancelled = false

    const draw = async () => {
      try {
        const topojson = await import('https://esm.sh/topojson-client@3')
        const world: any = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        if (cancelled) return

        const W = 900, H = 460
        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()
        svg.attr('viewBox', `0 0 ${W} ${H}`)

        const g = svg.append('g')

        const projection = d3.geoNaturalEarth1().scale(153).translate([W / 2, H / 2])
        const path = d3.geoPath().projection(projection)
        const features: any[] = topojson.feature(world, world.objects.countries).features

        const byId: Record<string, number> = {}
        data.forEach(d => {
          const id = COUNTRY_ISO[d.country]
          if (id) byId[id] = d.activeUsers
        })

        const maxVal = Math.max(...Object.values(byId), 1)
        const colorScale = d3.scaleSequential()
          .domain([0, maxVal])
          .interpolator(d3.interpolate('#1a3a5c', '#5B9BD5'))

        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            g.attr('transform', event.transform)
          })

        svg.call(zoom)

        g.selectAll<SVGPathElement, any>('path')
          .data(features)
          .join('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => byId[String(d.id)] ? colorScale(byId[String(d.id)]) : '#1e293b')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 0.4)
          .style('cursor', 'pointer')
          .on('mousemove', (event: MouseEvent, d: any) => {
            const name = Object.entries(COUNTRY_ISO).find(([, id]) => id === String(d.id))?.[0] ?? null
            const users = byId[String(d.id)] ?? 0
            const rect = svgRef.current!.getBoundingClientRect()
            setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, country: name ?? 'Unknown', users })
          })
          .on('mouseleave', () => setTooltip(null))

        setLoaded(true)
      } catch (e) {
        console.error('WorldMap error:', e)
      }
    }

    draw()
    return () => { cancelled = true }
  }, [data])

  return (
    <div className="relative w-full bg-slate-950 rounded-xl overflow-hidden border border-border min-h-[400px]">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 backdrop-blur px-2 py-1 rounded">Interactive Map</p>
        <p className="text-[9px] text-slate-600">Scroll to zoom • Drag to pan</p>
      </div>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Loading map…
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full" />
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-popover border border-border rounded-md px-2.5 py-1.5 text-xs shadow-xl z-20"
          style={{ left: tooltip.x + 14, top: tooltip.y, transform: 'translateY(-50%)' }}
        >
          <p className="font-semibold">{tooltip.country}</p>
          <p className="text-muted-foreground">{tooltip.users.toLocaleString()} users</p>
        </div>
      )}
      {loaded && data.length > 0 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/50 backdrop-blur px-3 py-1.5 rounded-full">
          <span>0</span>
          <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #1a3a5c, #5B9BD5)' }} />
          <span>{fmt(Math.max(...data.map(d => d.activeUsers)))}</span>
        </div>
      )}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 font-bold">{label}</p>
      <p className="text-3xl font-black text-glacier tracking-tighter">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1 font-medium">{sub}</p>}
    </div>
  )
}

// ── Data List ─────────────────────────────────────────────────────────────

function DataList({ rows, labelKey, valueKey, suffix = '', loading }: {
  rows: any[],
  labelKey: string,
  valueKey: string,
  suffix?: string,
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-6 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground p-4 text-center">No data</p>
  }
  const max = rows[0][valueKey] || 1
  return (
    <div className="divide-y divide-border/50">
      {rows.slice(0, 10).map((row, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/10 transition-colors">
          <span className="text-[10px] text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate font-medium">{row[labelKey]}</p>
            <div className="h-1 bg-muted/30 rounded-full mt-1.5">
              <div
                className="h-1 bg-glacier/60 rounded-full transition-all duration-500"
                style={{ width: `${(row[valueKey] / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-glacier flex-shrink-0 tabular-nums">
            {fmt(row[valueKey])}{suffix}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [range, setRange] = useState('30d')
  const [historical, setHistorical] = useState<HistoricalData | null>(null)
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [histLoading, setHistLoading] = useState(true)
  const [rtLoading, setRtLoading] = useState(true)
  const [histError, setHistError] = useState<string | null>(null)
  const [rtError, setRtError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Zoom state for Recharts
  const [zoomRange, setZoomRange] = useState({ left: 'dataMin', right: 'dataMax' })

  // Historical data
  useEffect(() => {
    setHistLoading(true)
    setHistError(null)
    fetch(`/api/analytics?type=historical&range=${range}`)
      .then(r => r.json())
      .then(json => { if (json.error) throw new Error(json.error); setHistorical(json) })
      .catch(e => setHistError(e.message))
      .finally(() => setHistLoading(false))
  }, [range])

  // Realtime data
  const fetchRealtime = useCallback(() => {
    fetch('/api/analytics?type=realtime')
      .then(r => r.json())
      .then(json => { if (json.error) throw new Error(json.error); setRealtime(json); setLastUpdated(new Date()) })
      .catch(e => setRtError(e.message))
      .finally(() => setRtLoading(false))
  }, [])

  useEffect(() => {
    fetchRealtime()
    const id = setInterval(fetchRealtime, 60000)
    return () => clearInterval(id)
  }, [fetchRealtime])

  const chartData = historical?.byDate.map(row => ({
    ...row,
    label: fmtDate(row.date),
    activeUsersFmt: fmt(row.activeUsers),
    sessionsFmt: fmt(row.sessions),
    pageViewsFmt: fmt(row.pageViews),
  })) ?? []

  const rangeLabel = RANGES.find(r => r.value === range)?.label ?? ''
  const tickInterval = Math.max(1, Math.ceil(chartData.length / 8))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Realtime Core Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Realtime Stat Card */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black">Realtime Activity (5m)</p>
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
          </div>
          {rtLoading ? (
            <div className="h-9 w-16 bg-blue-500/10 animate-pulse rounded mt-1" />
          ) : (
            <div className="space-y-1">
              <p className="text-4xl font-black text-glacier tracking-tighter">{fmt(realtime?.activeUsers5m ?? 0)}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">{fmt(realtime?.activeUsers ?? 0)} in last 30m</span>
              </div>
            </div>
          )}
        </div>

        {/* Global Stats */}
        {histLoading ? (
          <>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </>
        ) : historical?.summary ? (
          <>
            <StatCard label="Total Users" value={fmt(historical.summary.totalUsers)} sub={`${fmt(historical.summary.newUsers)} new users`} />
            <StatCard label="Total Page Views" value={fmt(historical.summary.pageViews)} sub={`${(historical.summary.pageViews / historical.summary.sessions || 0).toFixed(1)} views/session`} />
            <StatCard label="Avg. Engagement" value={fmtDur(historical.summary.avgSessionDuration)} sub={`${fmt(historical.summary.engagedSessions)} engaged sessions`} />
          </>
        ) : null}
      </div>

      {/* ── Realtime Map + Insights ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Global Live Activity (30m Window)</h3>
              {lastUpdated && (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded-full border border-border/50">
                  Synced {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <WorldMap data={realtime?.byCountry ?? []} />
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Active Pages</h3>
            <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden h-[240px] flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DataList rows={realtime?.byPage ?? []} labelKey="page" valueKey="activeUsers" loading={rtLoading} />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Live Markets (Cities)</h3>
            <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden h-[300px] flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DataList rows={realtime?.byCity ?? []} labelKey="city" valueKey="activeUsers" loading={rtLoading} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Live Traffic (Device)</h3>
            <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden h-[240px] flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DataList rows={realtime?.byDevice ?? []} labelKey="device" valueKey="activeUsers" loading={rtLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Historical Insights Section ───────────────────────────────────── */}
      <div className="pt-8 border-t border-border space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Performance Deep Dive</h2>
            <p className="text-xs text-muted-foreground font-medium">Analyzing data for the last {rangeLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-xl border border-border/50">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r.value
                  ? 'bg-glacier text-white shadow-lg shadow-glacier/20'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {histError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive flex items-center gap-3">
            <span className="font-bold whitespace-nowrap">API Error:</span> {histError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Main Traffic Chart - Zoomable */}
          <div className="rounded-xl border border-border bg-card/30 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Traffic Velocity</h3>
                <p className="text-xs text-muted-foreground">User growth and session trends</p>
              </div>
              <Badge variant="outline" className="text-[10px] py-0 font-black opacity-70 uppercase tracking-tighter">Growth Matrix</Badge>
            </div>
            {histLoading ? (
              <div className="h-72 bg-muted/20 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={CHART_THEME.tick}
                    tickLine={false}
                    axisLine={false}
                    interval={tickInterval}
                    domain={[zoomRange.left, zoomRange.right]}
                  />
                  <YAxis tick={CHART_THEME.tick} tickLine={false} axisLine={false} />
                  <RTooltip
                    contentStyle={{ ...CHART_THEME.tooltip, padding: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  <Line name="Active Users" type="monotone" dataKey="activeUsers" stroke="#5B9BD5" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Line name="New Users" type="monotone" dataKey="newUsers" stroke="#c084fc" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line name="Sessions" type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Line name="Page Views" type="monotone" dataKey="pageViews" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distributed Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Global Distribution — Users</h3>
            <WorldMap data={historical?.byGeo.map(g => ({ country: g.country, activeUsers: g.users })) ?? []} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Top Markets</h3>
              <div className="rounded-xl border border-border bg-card/30 overflow-hidden h-[380px] flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <DataList rows={historical?.byGeo ?? []} labelKey="city" valueKey="users" loading={histLoading} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Top Channels</h3>
              <div className="rounded-xl border border-border bg-card/30 overflow-hidden h-[380px] flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <DataList rows={historical?.bySource ?? []} labelKey="source" valueKey="users" loading={histLoading} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content & Tech */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Page Performance</h3>
            <div className="rounded-xl border border-border bg-card/30 overflow-hidden h-[400px] flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DataList rows={historical?.byPage ?? []} labelKey="title" valueKey="views" loading={histLoading} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Browser / OS Metrics</h3>
            <div className="rounded-xl border border-border bg-card/30 overflow-hidden h-[400px] flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DataList rows={historical?.byTech ?? []} labelKey="browser" valueKey="users" loading={histLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
