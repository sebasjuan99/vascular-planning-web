'use client'
import { useState } from 'react'

const COURSES = [
  {
    id: 1, type: 'evar', title: 'Planificación EVAR: Anatomía y Medidas',
    instructor: 'Dr. Carlos Mejía', duration: '45 min',
    date: 'Feb 2025', isNew: false, progress: 65,
    color: 'from-vp-blue to-vp-red',
  },
  {
    id: 2, type: 'fevar', title: 'FEVAR: Casos Complejos con Fenestraciones',
    instructor: 'Dr. Andrés Vargas', duration: '1h 20min',
    date: 'Mar 2026', isNew: true, progress: 0,
    color: 'from-vp-dark to-vp-blue',
  },
  {
    id: 3, type: 'evar', title: 'Selección de Endoprótesis: Guía Práctica',
    instructor: 'Dr. Carlos Mejía', duration: '35 min',
    date: 'Ene 2025', isNew: false, progress: 0,
    color: 'from-gray-500 to-gray-700',
  },
]

type Filter = 'todos' | 'evar' | 'fevar' | 'nuevos'

export default function CursosPage() {
  const [filter, setFilter] = useState<Filter>('todos')

  const filtered = COURSES.filter(c => {
    if (filter === 'evar') return c.type === 'evar'
    if (filter === 'fevar') return c.type === 'fevar'
    if (filter === 'nuevos') return c.isNew
    return true
  })

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-vp-dark">Cursos y Actualizaciones</h1>
        <p className="text-xs text-vp-muted mt-1">Formación en cirugía endovascular</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['todos', 'evar', 'fevar', 'nuevos'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize
              ${filter === f
                ? 'bg-vp-dark text-white'
                : 'border border-vp-border text-vp-muted hover:text-vp-dark'}`}>
            {f === 'todos' ? 'Todos' : f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(course => (
          <div key={course.id} className="bg-white border border-vp-border rounded-lg overflow-hidden flex">
            <div className={`w-16 bg-gradient-to-b ${course.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-lg">▶</span>
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-vp-dark leading-tight">{course.title}</h3>
                {course.isNew && (
                  <span className="bg-red-50 text-vp-red text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    NUEVO
                  </span>
                )}
              </div>
              <p className="text-xs text-vp-muted mb-2">
                {course.duration} · {course.instructor} · {course.date}
              </p>
              {course.progress > 0 && (
                <div>
                  <div className="bg-vp-border rounded-full h-1.5 w-full">
                    <div className="bg-vp-red h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <p className="text-xs text-vp-muted mt-1">{course.progress}% completado</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
