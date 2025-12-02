import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "sg-fire-calculator-state"

export interface PersistedState {
  currentAge: number
  currentSavings: number
  monthlyContribution: number
  yearsToRetirement: number
  expectedReturn: number
  inflationRate: number
  withdrawalRate: number
  selectedBudget: "frugal" | "moderate" | "comfortable"
  cpfOA: number
  cpfSA: number
  cpfMA: number
  monthlySalary: number
  includeCPF: boolean
}

const defaultState: PersistedState = {
  currentAge: 35,
  currentSavings: 500000,
  monthlyContribution: 5000,
  yearsToRetirement: 10,
  expectedReturn: 0.07,
  inflationRate: 0.03,
  withdrawalRate: 0.04,
  selectedBudget: "moderate",
  cpfOA: 100000,
  cpfSA: 80000,
  cpfMA: 40000,
  monthlySalary: 8000,
  includeCPF: true,
}

// Encode state to URL-safe base64
function encodeState(state: PersistedState): string {
  const json = JSON.stringify(state)
  return btoa(json)
}

// Decode state from URL-safe base64
function decodeState(encoded: string): PersistedState | null {
  try {
    const json = atob(encoded)
    const parsed = JSON.parse(json)
    // Validate that all required fields exist
    const requiredKeys = Object.keys(defaultState)
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        return null
      }
    }
    return parsed as PersistedState
  } catch {
    return null
  }
}

// Load state from URL params or localStorage
function loadInitialState(): PersistedState {
  // First check URL params
  const urlParams = new URLSearchParams(window.location.search)
  const sharedState = urlParams.get("s")
  if (sharedState) {
    const decoded = decodeState(sharedState)
    if (decoded) {
      // Clear URL params after loading
      window.history.replaceState({}, "", window.location.pathname)
      return decoded
    }
  }

  // Then check localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultState, ...parsed }
    }
  } catch {
    // Ignore localStorage errors
  }

  return defaultState
}

// Save state to localStorage
function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore localStorage errors (e.g., quota exceeded)
  }
}

export function usePersistedState() {
  const [state, setState] = useState<PersistedState>(loadInitialState)

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state)
  }, [state])

  // Generate shareable URL
  const generateShareableUrl = useCallback((): string => {
    const encoded = encodeState(state)
    const url = new URL(window.location.href)
    url.search = `?s=${encoded}`
    return url.toString()
  }, [state])

  // Copy shareable URL to clipboard
  const copyShareableUrl = useCallback(async (): Promise<boolean> => {
    try {
      const url = generateShareableUrl()
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }, [generateShareableUrl])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setState(defaultState)
  }, [])

  // Update individual fields
  const updateField = useCallback(<K extends keyof PersistedState>(
    field: K,
    value: PersistedState[K]
  ) => {
    setState((prev) => ({ ...prev, [field]: value }))
  }, [])

  return {
    state,
    updateField,
    generateShareableUrl,
    copyShareableUrl,
    resetToDefaults,
  }
}
