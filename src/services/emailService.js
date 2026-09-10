/**
 * EmailJS integration.
 *
 * Setup (see .env.example):
 *   1. Create a free account at https://www.emailjs.com/
 *   2. Add an Email Service → note the Service ID
 *   3. Add an Email Template with variables: {{to_email}}, {{to_name}},
 *      {{subject}}, {{message}}, {{from_name}}, {{reply_to}}
 *   4. Copy your Public Key from Account → General
 *   5. Create a `.env` file with VITE_EMAILJS_SERVICE_ID / _TEMPLATE_ID / _PUBLIC_KEY
 *
 * Never hardcode keys in the source.
 */
import emailjs from '@emailjs/browser'

const SERVICE_ID = 'service_6ul61yd'
const TEMPLATE_ID = 'template_g85vu9o'
const PUBLIC_KEY = '0oBwtkvUnOKSPiyzB'

export function isEmailConfigured() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)
}

/**
 * Send an email through EmailJS.
 * @returns {Promise<void>} rejects with a friendly Error on failure
 */
export async function sendEmail({ toEmail, toName, subject, message, fromName, replyTo }) {
  if (!isEmailConfigured()) {
    throw new Error(
      'EmailJS is not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY to your .env file, then restart the dev server.'
    )
  }
  const params = {
    to_email: toEmail,
    to_name: toName || toEmail,
    subject,
    message,
    from_name: fromName || 'Connectinfo user',
    reply_to: replyTo || '',
  }
  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY })
    if (res.status !== 200) throw new Error(res.text || 'EmailJS responded with an error.')
  } catch (err) {
    const text =
      err?.text ||
      'Unable to send email. Please check your EmailJS configuration and internet connection, then try again.'
    throw new Error(text)
  }
}
