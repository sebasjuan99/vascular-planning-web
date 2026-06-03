// Single source of truth for course catalog used across:
// - Public /cursos page (cursos-catalog.tsx)
// - Dashboard /dashboard/cursos page
// - Admin panel /admin (course assignment toggles)
// - Payment API routes
//
// When adding/editing a course, change it here only.

export type CourseCategory = 'Aorta' | 'Periférico'

export interface Course {
  id: string                 // Stable identifier used in DB and admin panel
  slug: string               // URL-friendly (same as id for now)
  title: string
  shortTitle: string         // For column headers in admin
  description: string
  category: CourseCategory
  image?: string
  video?: string
  gradient: string
  price: number              // In CLP, no decimals
  currency: 'CLP'
  contentReady: boolean      // Toggle to true when actual content is launched
}

export const COURSE_PRICE_CLP = 897_000

export const COURSES: Course[] = [
  {
    id: 'curso-evar',
    slug: 'curso-evar',
    title: 'EVAR - Cirugía de Aorta',
    shortTitle: 'EVAR',
    description:
      'Reparación Endovascular de Aneurisma Aórtico. Planificación y simulación del abordaje endovascular estándar.',
    category: 'Aorta',
    image: '/images/curso-evar.webp',
    gradient: 'from-blue-600 to-blue-800',
    price: COURSE_PRICE_CLP,
    currency: 'CLP',
    contentReady: false,
  },
  {
    id: 'curso-fevar',
    slug: 'curso-fevar',
    title: 'FEVAR - Cirugía de Aorta',
    shortTitle: 'FEVAR',
    description:
      'Reparación Endovascular Fenestrada. Técnicas avanzadas para anatomías complejas con dispositivos fenestrados y ramificados.',
    category: 'Aorta',
    image: '/images/curso-fevar.webp',
    gradient: 'from-purple-600 to-purple-800',
    price: COURSE_PRICE_CLP,
    currency: 'CLP',
    contentReady: false,
  },
  {
    id: 'curso-tevar',
    slug: 'curso-tevar',
    title: 'TEVAR - Cirugía de Aorta',
    shortTitle: 'TEVAR',
    description:
      'Reparación Endovascular Torácica. Abordaje endovascular de patología aórtica torácica con planificación avanzada.',
    category: 'Aorta',
    image: '/images/curso-tevar.webp',
    gradient: 'from-indigo-600 to-indigo-800',
    price: COURSE_PRICE_CLP,
    currency: 'CLP',
    contentReady: false,
  },
  {
    id: 'curso-angiografia',
    slug: 'curso-angiografia',
    title: 'Angiografía Básica',
    shortTitle: 'Angiografía',
    description:
      'Fundamentos de la angiografía diagnóstica y terapéutica en el territorio vascular periférico.',
    category: 'Periférico',
    image: '/images/curso-periferico.jpg',
    gradient: 'from-green-600 to-green-800',
    price: COURSE_PRICE_CLP,
    currency: 'CLP',
    contentReady: false,
  },
  {
    id: 'curso-ultrasonido',
    slug: 'curso-ultrasonido',
    title: 'Uso de Ultrasonido en Cirugía Vascular (VR)',
    shortTitle: 'Ultrasonido VR',
    description:
      'Entrenamiento en realidad virtual para el uso de ultrasonido doppler en evaluación y diagnóstico vascular.',
    category: 'Periférico',
    video: '/videos/curso-ultrasonido.mp4',
    gradient: 'from-teal-600 to-teal-800',
    price: COURSE_PRICE_CLP,
    currency: 'CLP',
    contentReady: false,
  },
  {
    id: 'curso-accesos',
    slug: 'curso-accesos',
    title: 'Accesos Vasculares Guiados con Ultrasonido (VR)',
    shortTitle: 'Accesos VR',
    description:
      'Simulación en realidad virtual de accesos vasculares guiados por ecografía para procedimientos seguros.',
    category: 'Periférico',
    video: '/videos/curso-accesos.mp4',
    gradient: 'from-emerald-600 to-emerald-800',
    price: COURSE_PRICE_CLP,
    currency: 'CLP',
    contentReady: false,
  },
]

export function getCourse(id: string): Course | null {
  return COURSES.find((c) => c.id === id) ?? null
}

export function getCoursesByCategory(category: CourseCategory): Course[] {
  return COURSES.filter((c) => c.category === category)
}

// Format CLP with thousand separators (dot), no decimals
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}
