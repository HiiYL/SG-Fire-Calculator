import { useEffect } from 'react'

interface ShortcutHandlers {
  onShare?: () => void
  onReset?: () => void
  onToggleDarkMode?: () => void
  onToggleCurrency?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Cmd/Ctrl + S = Share
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handlers.onShare?.()
      }

      // Cmd/Ctrl + R = Reset (prevent browser refresh)
      if ((e.metaKey || e.ctrlKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault()
        handlers.onReset?.()
      }

      // D = Toggle dark mode
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
        handlers.onToggleDarkMode?.()
      }

      // C = Toggle currency
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        handlers.onToggleCurrency?.()
      }

      // Escape = Close modals
      if (e.key === 'Escape') {
        handlers.onEscape?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
