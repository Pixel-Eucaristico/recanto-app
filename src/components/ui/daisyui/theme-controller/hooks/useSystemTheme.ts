'use client'

import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

export function useSystemTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    let media: MediaQueryList | null = null
    let handler: ((e: MediaQueryListEvent) => void) | null = null

    async function detectTheme() {
      if (typeof window !== 'undefined') {
        if ('__TAURI__' in window) {
          try {
            const win = await getCurrentWindow()
            const tauriTheme = await win.theme()
            setTheme(tauriTheme === 'dark' ? 'dark' : 'light')
          } catch (err) {
            console.error('Erro ao detectar tema via Tauri:', err)
          }
        } else if ('matchMedia' in window) {
          media = window.matchMedia('(prefers-color-scheme: dark)')
          setTheme(media.matches ? 'dark' : 'light')

          handler = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light')
          }

          media.addEventListener('change', handler)
        }
      }
    }

    detectTheme()

    return () => {
      if (media && handler) {
        media.removeEventListener('change', handler)
      }
    }
  }, [])

  return theme
}
