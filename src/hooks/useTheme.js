import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return { theme, toggle }
}
