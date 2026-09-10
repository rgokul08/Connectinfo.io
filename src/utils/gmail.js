/**
 * Build a Gmail "compose" URL addressed to a specific recipient.
 * Opens Gmail (web) in a new tab, pre-filled To: the contact's email.
 */
export function gmailComposeUrl(to, subject = '') {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to })
  if (subject) params.set('su', subject)
  return `https://mail.google.com/mail/?${params.toString()}`
}

/** Shared anchor props so every Gmail link opens safely in a new tab. */
export const GMAIL_LINK_PROPS = { target: '_blank', rel: 'noreferrer noopener' }
