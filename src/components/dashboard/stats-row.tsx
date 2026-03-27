interface StatsRowProps {
  total: number
  evar: number
  fevar: number
}
export default function StatsRow({ total, evar, fevar }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Total casos', value: total, color: 'text-slate-900' },
        { label: 'EVAR', value: evar, color: 'text-[#0058bc]' },
        { label: 'FEVAR', value: fevar, color: 'text-blue-600' },
      ].map((s) => (
        <div key={s.label} className="bg-white rounded-xl shadow-apple p-5">
          <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mt-1 font-medium">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
