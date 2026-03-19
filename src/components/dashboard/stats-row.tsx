interface StatsRowProps {
  total: number
  evar: number
  fevar: number
}
export default function StatsRow({ total, evar, fevar }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: 'Total casos', value: total, color: 'text-vp-dark' },
        { label: 'EVAR', value: evar, color: 'text-vp-blue' },
        { label: 'FEVAR', value: fevar, color: 'text-vp-red' },
      ].map((s) => (
        <div key={s.label} className="bg-white border border-vp-border rounded-lg p-4">
          <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          <div className="text-xs text-vp-muted uppercase tracking-wide mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
