import nodemailer from 'nodemailer'

export async function sendMail(opts: {
  to: string
  subject: string
  text: string
  replyTo?: { email: string, name?: string }
}): Promise<void> {
  const config = useRuntimeConfig()
  const user = String(process.env.SMTP_USER || config.smtpUser || 'annuaire.tsa@gmail.com')
  const pass = String(process.env.SMTP_PASS || config.smtpPass || '')
  const from = String(process.env.SMTP_FROM || config.smtpFrom || user)
  const fromName = String(process.env.SMTP_FROM_NAME || config.smtpFromName || 'Annuaire TSA')
  const host = String(process.env.SMTP_HOST || config.smtpHost || 'smtp.gmail.com')
  const port = Number(process.env.SMTP_PORT || config.smtpPort || 587)

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass }
  })

  await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    replyTo: opts.replyTo
      ? (opts.replyTo.name ? `"${opts.replyTo.name}" <${opts.replyTo.email}>` : opts.replyTo.email)
      : undefined
  })
}
