const steps = [
  {
    number: 1,
    title: 'Contratar Consultoría',
    description: 'El cliente contrata el servicio de consultoría quirúrgica integral.',
    filled: true,
  },
  {
    number: 2,
    title: 'Subir Archivos DICOM',
    description: 'El cliente sube los archivos DICOM del caso a la plataforma segura.',
    filled: false,
  },
  {
    number: 3,
    title: 'Revisión del Caso',
    description:
      'Nuestro equipo revisa el caso, realiza la impresión 3D y crea el render VR.',
    filled: true,
  },
  {
    number: 4,
    title: 'Consultoría y Acompañamiento',
    description:
      'Se agenda la consultoría o acompañamiento quirúrgico con expertos.',
    filled: false,
  },
]

export default function ServiciosHowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Cómo Funciona
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Un proceso integral para brindar consultoría quirúrgica de alta calidad.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-0">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-vp-border" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex-1 flex flex-col items-center text-center">
              <div
                className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-5 ${
                  step.filled
                    ? 'bg-clinical-blue text-white'
                    : 'bg-white border-2 border-clinical-blue text-clinical-blue'
                }`}
              >
                {step.number}
              </div>
              <h3 className="font-semibold text-vp-dark mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
