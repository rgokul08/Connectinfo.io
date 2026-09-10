import { createContext, useContext, useEffect } from 'react'

/**
 * Connectinfo always uses LIGHT mode.
 * (Dark / system themes were intentionally removed per product decision.)
 * The provider is kept so existing imports keep working, but it simply
 * enforces a light document and exposes a static value.
 */
const ThemeContext = createContext({ theme: 'light', changeTheme: () => {} })
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
    localStorage.setItem('ci_theme', 'light')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'light', changeTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}
