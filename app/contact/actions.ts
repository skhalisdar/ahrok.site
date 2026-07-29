'use server'

import { Resend } from 'resend'

const CONTACT_TO = 'hello@ahrok.site'
const CONTACT_FROM = 'Ahrok Website <noreply@ahrok.site>'

export type ContactState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  // Honeypot — ignore submissions that fill the hidden field.
  const honeypot = String(formData.get('website') ?? '').trim()
  if (honeypot) {
    return { status: 'success', message: "Thanks — your message has been sent." }
  }

  if (!name || !email || !message) {
    return {
      status: 'error',
      message: 'Please fill in your name, email, and a message.',
    }
  }

  if (!isValidEmail(email)) {
    return {
      status: 'error',
      message: 'Please enter a valid email address so we can reply.',
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[v0] RESEND_API_KEY is not set')
    return {
      status: 'error',
      message:
        'Email delivery is not configured yet. Please email hello@ahrok.site directly.',
    }
  }

  const resend = new Resend(apiKey)

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeCompany = company ? escapeHtml(company) : '—'
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

  try {
    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '—'}\n\n${message}`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6;">
          <h2 style="margin: 0 0 16px;">New contact form message</h2>
          <p style="margin: 0;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 0;"><strong>Email:</strong> ${safeEmail}</p>
          <p style="margin: 0 0 16px;"><strong>Company:</strong> ${safeCompany}</p>
          <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    })

    if (error) {
      console.log('[v0] Resend error:', error)
      return {
        status: 'error',
        message:
          'Something went wrong sending your message. Please email hello@ahrok.site directly.',
      }
    }

    return {
      status: 'success',
      message: "Thanks for reaching out — we'll get back to you soon.",
    }
  } catch (err) {
    console.log('[v0] Unexpected error sending contact email:', err)
    return {
      status: 'error',
      message:
        'Something went wrong sending your message. Please email hello@ahrok.site directly.',
    }
  }
}
