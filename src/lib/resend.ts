import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAdminNotification(data: {
  userName: string
  userEmail: string
  userId: string
  specialty: string
  institution: string
}) {
  await resend.emails.send({
    from: 'Vascular Planning <noreply@vascularplanning.com>',
    to: process.env.ADMIN_EMAIL!,
    subject: `Nueva solicitud de acceso: ${data.userName}`,
    html: `
      <h2>Nueva solicitud de acceso en Vascular Planning</h2>
      <p><strong>Nombre:</strong> ${data.userName}</p>
      <p><strong>Email:</strong> ${data.userEmail}</p>
      <p><strong>Especialidad:</strong> ${data.specialty}</p>
      <p><strong>Institución:</strong> ${data.institution}</p>
      <p><strong>userId:</strong> <code>${data.userId}</code></p>
      <hr>
      <p>Para aprobar, haz POST a:</p>
      <pre>curl -X POST https://your-domain.vercel.app/api/admin/approve \\
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "${data.userId}"}'</pre>
    `,
  })
}

export async function sendApprovalEmail(email: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vascularplanning.vercel.app'
  await resend.emails.send({
    from: 'Vascular Planning <noreply@vascularplanning.com>',
    to: email,
    subject: 'Tu acceso a Vascular Planning fue aprobado',
    html: `
      <h2>¡Bienvenido a Vascular Planning, ${name}!</h2>
      <p>Tu solicitud de acceso ha sido aprobada.</p>
      <p>Ya puedes ingresar en <a href="${appUrl}/login">${appUrl}</a></p>
    `,
  })
}
