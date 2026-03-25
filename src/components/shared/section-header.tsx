interface SectionHeaderProps {
  overline?: string
  title: string
  subtitle?: string
  centered?: boolean
}

export default function SectionHeader({
  overline,
  title,
  subtitle,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {overline && (
        <p className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em] text-clinical-blue mb-3">
          {overline}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
