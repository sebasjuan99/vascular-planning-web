import Image from 'next/image'

const doctors = [
  {
    name: 'Dr. Manuel Espíndola',
    photo: '/fotos-doctores/dr-espindola.png',
    title: 'Cirujano Vascular y Endovascular',
    credentials: [
      'Ex Presidente Sociedad Chilena de Cirugía Vascular',
      'Jefe Departamento de Cirugía Vascular, Clínica Las Condes',
    ],
  },
  {
    name: 'Dr. Jeison David Peñuela A.',
    photo: '/fotos-doctores/dr-jeison-penuela.png',
    title: 'Cirujano Vascular y Endovascular',
    credentials: [
      'Miembro Sociedad Chilena de Cirugía Vascular',
      'Jefe Departamento de Cirugía Vascular, Hospital San Juan de Santiago de Chile',
    ],
  },
  {
    name: 'Dr. Diego Ardiles',
    photo: '/fotos-doctores/dr-diego-ardiles.png',
    title: 'Cirujano Vascular y Endovascular',
    credentials: [
      'Miembro Sociedad Chilena de Cirugía Vascular',
      'Equipo Cirugía Vascular, Clínica Las Condes',
    ],
  },
  {
    name: 'Dr. Sebastián Alba Ospina',
    photo: '/fotos-doctores/dr-sebastian-alba.png',
    title: 'Médico, MBA',
    credentials: [
      'Magíster en Estrategia',
      'MSc Simulación Médica',
    ],
  },
]

export default function EquipoAsesor() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0058bc] mb-4">
            Expertos
          </h2>
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Equipo Asesor
          </p>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Nuestro equipo de especialistas en cirugía vascular y tecnología médica lidera cada planificación.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doc) => (
            <div
              key={doc.name}
              className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-[3/4] relative bg-slate-200">
                <Image
                  src={doc.photo}
                  alt={doc.name}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{doc.name}</h3>
                <p className="text-sm font-semibold text-[#0058bc] mb-3">{doc.title}</p>
                <ul className="space-y-1">
                  {doc.credentials.map((cred, i) => (
                    <li key={i} className="text-xs text-slate-500 leading-relaxed">
                      {cred}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
