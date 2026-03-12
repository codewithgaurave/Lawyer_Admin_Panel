import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    if (isDark) {
      document.documentElement.style.setProperty('--bg-primary', '#0f172a')
      document.documentElement.style.setProperty('--bg-secondary', '#1e293b')
      document.documentElement.style.setProperty('--text-primary', '#f1f5f9')
      document.documentElement.style.setProperty('--text-secondary', '#94a3b8')
      document.documentElement.style.setProperty('--accent-blue', '#3b82f6')
      document.documentElement.style.setProperty('--accent-orange', '#f97316')
      document.documentElement.style.setProperty('--accent-red', '#ef4444')
      document.documentElement.style.setProperty('--accent-yellow', '#eab308')
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff')
      document.documentElement.style.setProperty('--bg-secondary', '#f8fafc')
      document.documentElement.style.setProperty('--text-primary', '#1e293b')
      document.documentElement.style.setProperty('--text-secondary', '#64748b')
      document.documentElement.style.setProperty('--accent-blue', '#2563eb')
      document.documentElement.style.setProperty('--accent-orange', '#ea580c')
      document.documentElement.style.setProperty('--accent-red', '#dc2626')
      document.documentElement.style.setProperty('--accent-yellow', '#ca8a04')
    }
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  )
}