export default function StatsBar() {
  const stats = [
    { label: 'Reparación Endovascular', value: 'EVAR' },
    { label: 'EVAR Fenestrada', value: 'FEVAR' },
    { label: 'Exportable', value: 'PDF' },
  ]
  return (
    <div className="border-y border-vp-border bg-vp-surface py-5">
      <div className="max-w-4xl mx-auto flex justify-center gap-16">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className={`text-xl font-black ${s.value === 'PDF' ? 'text-vp-red' : 'text-vp-dark'}`}>
              {s.value}
            </div>
            <div className="text-xs text-vp-muted uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
