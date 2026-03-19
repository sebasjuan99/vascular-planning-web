import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendAdminNotification(data: {
  userName: string
  userEmail: string
  userId: string
  specialty: string
  institution: string
}) {
  const userName = escapeHtml(data.userName)
  const userEmail = escapeHtml(data.userEmail)
  const userId = escapeHtml(data.userId)
  const specialty = escapeHtml(data.specialty)
  const institution = escapeHtml(data.institution)

  const { error } = await resend.emails.send({
    from: 'Vascular Planning <noreply@vascularplanning.com>',
    to: process.env.ADMIN_EMAIL!,
    subject: `Nueva solicitud de acceso: ${userName}`,
    html: `
      <h2>Nueva solicitud de acceso en Vascular Planning</h2>
      <p><strong>Nombre:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Especialidad:</strong> ${specialty}</p>
      <p><strong>Institución:</strong> ${institution}</p>
      <p><strong>userId:</strong> <code>${userId}</code></p>
      <hr>
      <p>Para aprobar, haz POST a:</p>
      <pre>curl -X POST https://your-domain.vercel.app/api/admin/approve \\
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "${userId}"}'</pre>
    `,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}

export async function sendApprovalEmail(email: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vascularplanning.vercel.app'
  const safeName = escapeHtml(name)

  const { error } = await resend.emails.send({
    from: 'Vascular Planning <noreply@vascularplanning.com>',
    to: email,
    subject: 'Tu acceso a Vascular Planning fue aprobado',
    html: `
      <h2>¡Bienvenido a Vascular Planning, ${safeName}!</h2>
      <p>Tu solicitud de acceso ha sido aprobada.</p>
      <p>Ya puedes ingresar en <a href="${appUrl}/login">${appUrl}</a></p>
    `,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
