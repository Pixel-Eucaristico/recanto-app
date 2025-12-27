'use client'

import { useState, useEffect } from 'react'

export function useSystemTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    let media: MediaQueryList | null = null
    let handler: ((e: MediaQueryListEvent) => void) | null = null

    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      media = window.matchMedia('(prefers-color-scheme: dark)')
      setTheme(media.matches ? 'dark' : 'light')

      handler = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light')
      }

      media.addEventListener('change', handler)
    }

    return () => {
      if (media && handler) {
        media.removeEventListener('change', handler)
      }
    }
  }, [])

  return theme
}
