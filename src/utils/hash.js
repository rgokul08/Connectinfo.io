/**
 * SHA-256 helper used to avoid storing demo passwords in plain text.
 * NOTE: this is a frontend-only demo authentication — it is convenience
 * hashing, NOT production-grade security (no salt, no server).
 */
export async function sha256Hex(text) {
  try {
    if (window.crypto?.subtle) {
      const data = new TextEncoder().encode(text)
      const digest = await window.crypto.subtle.digest('SHA-256', data)
      return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    /* fall through to simple hash */
  }
  // Very small non-crypto fallback (demo only)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16)
}
