const COOKIE_NAME = 'boidsHighScore'
const COOKIE_MAX_AGE_DAYS = 365

export function getHighScore() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  const value = match ? parseInt(decodeURIComponent(match[1]), 10) : 0
  return Number.isFinite(value) ? value : 0
}

export function setHighScore(value) {
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; samesite=lax`
}
