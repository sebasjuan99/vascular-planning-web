'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'

const COURSES = [
  {
    id: 1, type: 'evar', title: 'Planificación EVAR: Anatomía y Medidas',
    instructor: 'Dr. Carlos Mejía', duration: '45 min',
    date: 'Feb 2025', isNew: false, progress: 65,
    color: 'from-[#0058bc] to-blue-400',
  },
  {
    id: 2, type: 'fevar', title: 'FEVAR: Casos Complejos con Fenestraciones',
    instructor: 'Dr. Andrés Vargas', duration: '1h 20min',
    date: 'Mar 2026', isNew: true, progress: 0,
    color: 'from-slate-800 to-slate-600',
  },
  {
    id: 3, type: 'evar', title: 'Selección de Endoprótesis: Guía Práctica',
    instructor: 'Dr. Carlos Mejía', duration: '35 min',
    date: 'Ene 2025', isNew: false, progress: 0,
    color: 'from-slate-500 to-slate-400',
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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cursos y Actualizaciones</h1>
        <p className="text-sm text-slate-500 mt-1">Formación en cirugía endovascular</p>
      </div>

      <div className="flex gap-2 mb-8">
        {(['todos', 'evar', 'fevar', 'nuevos'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors capitalize
              ${filter === f
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}>
            {f === 'todos' ? 'Todos' : f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-apple overflow-hidden flex">
            <div className={`w-20 bg-gradient-to-b ${course.color} flex items-center justify-center flex-shrink-0`}>
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h3 className="font-bold text-sm text-slate-900 leading-tight">{course.title}</h3>
                {course.isNew && (
                  <span className="bg-[#0058bc]/10 text-[#0058bc] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex-shrink-0">
                    NUEVO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {course.duration} · {course.instructor} · {course.date}
              </p>
              {course.progress > 0 && (
                <div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0058bc] rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{course.progress}% completado</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
