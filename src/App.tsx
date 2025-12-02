import { useState, useMemo, lazy, Suspense, useCallback } from "react"
import "./App.css"
import { countries } from "@/data/countries"
import type { Country } from "@/data/countries"
import { calculateFIRE, runMonteCarloSimulation } from "@/lib/calculator"
import type { CPFBalances } from "@/lib/cpf"
import { projectCPF } from "@/lib/cpf"
import { formatCurrency } from "@/lib/utils"
import { usePersistedState } from "@/hooks/usePersistedState"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { CountryCard } from "@/components/CountryCard"
import { CountryDetail } from "@/components/CountryDetail"
import { CountryProjection } from "@/components/CountryProjection"
import { CPFSection } from "@/components/CPFSection"

// Lazy load the globe component (large dependency)
const GlobeVisualization = lazy(() => import("@/components/GlobeVisualization").then(m => ({ default: m.GlobeVisualization })))
import {
  PortfolioChart,
  MonteCarloChart,
  CountryComparisonChart,
  RunwayChart,
} from "@/components/Charts"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calculator,
  TrendingUp,
  Globe,
  PiggyBank,
  Target,
  BarChart3,
  Wallet,
  Calendar,
  Info,
  ChevronRight,
  Landmark,
  Share2,
  RotateCcw,
  Check,
  Keyboard,
  AlertTriangle,
} from "lucide-react"

function App() {
  // Persisted state (localStorage + URL sharing)
  const { state, updateField, copyShareableUrl, resetToDefaults } = usePersistedState()
  const [copied, setCopied] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Derived state from persisted state
  const currentAge = state.currentAge
  const currentSavings = state.currentSavings
  const monthlyContribution = state.monthlyContribution
  const yearsToRetirement = state.yearsToRetirement
  const expectedReturn = state.expectedReturn
  const inflationRate = state.inflationRate
  const withdrawalRate = state.withdrawalRate
  const selectedBudget = state.selectedBudget
  const monthlySalary = state.monthlySalary
  const includeCPF = state.includeCPF
  const displayCurrency = state.displayCurrency || "SGD"

  // Currency conversion rates
  const SGD_TO_USD = 0.74
  const USD_TO_SGD = 1 / SGD_TO_USD

  // Convert SGD to display currency
  const fromSGD = (amount: number): number => {
    return displayCurrency === "SGD" ? amount : amount * SGD_TO_USD
  }

  // Convert USD to display currency
  const fromUSD = (amount: number): number => {
    return displayCurrency === "USD" ? amount : amount * USD_TO_SGD
  }

  // Format with display currency
  const formatDisplay = (amount: number, fromCurrency: "SGD" | "USD" = "SGD"): string => {
    const converted = fromCurrency === "SGD" ? fromSGD(amount) : fromUSD(amount)
    return formatCurrency(converted, displayCurrency)
  }

  const cpfBalances: CPFBalances = useMemo(() => ({
    OA: state.cpfOA,
    SA: state.cpfSA,
    MA: state.cpfMA,
    total: state.cpfOA + state.cpfSA + state.cpfMA,
  }), [state.cpfOA, state.cpfSA, state.cpfMA])

  // UI-only state (not persisted)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [focusedCountry, setFocusedCountry] = useState<Country | null>(null)

  // Handle share button
  const handleShare = useCallback(async () => {
    const success = await copyShareableUrl()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [copyShareableUrl])

  // Toggle currency
  const toggleCurrency = useCallback(() => {
    updateField("displayCurrency", displayCurrency === "SGD" ? "USD" : "SGD")
  }, [displayCurrency, updateField])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onShare: handleShare,
    onReset: resetToDefaults,
    onToggleCurrency: toggleCurrency,
    onEscape: () => {
      setFocusedCountry(null)
      setSelectedCountry(null)
      setShowShortcuts(false)
    },
  })

  // CPF projection
  const cpfProjection = useMemo(() => {
    const retirementAge = currentAge + yearsToRetirement
    return projectCPF(cpfBalances, monthlySalary, currentAge, 40, retirementAge)
  }, [cpfBalances, monthlySalary, currentAge, yearsToRetirement])

  // CPF at retirement - if renouncing PR, ALL CPF is withdrawable
  const cpfAtRetirement = useMemo(() => {
    const atRetirement = cpfProjection.find(
      (p) => p.age === currentAge + yearsToRetirement
    )
    return {
      OA: atRetirement?.OA || 0,
      SA: atRetirement?.SA || 0,
      MA: atRetirement?.MA || 0,
      RA: atRetirement?.RA || 0,
      total: atRetirement?.total || 0,
      // If renouncing PR/citizenship, ALL CPF is withdrawable
      withdrawable: atRetirement?.total || 0,
    }
  }, [cpfProjection, currentAge, yearsToRetirement])

  // Calculate FIRE projections (cash/investments only)
  const fireResult = useMemo(() => {
    const monthlyExpenses = 2000 // Default moderate budget in USD
    return calculateFIRE(
      {
        currentSavings,
        monthlyContribution,
        yearsToRetirement,
        expectedReturn,
        inflationRate,
        withdrawalRate,
      },
      currentAge,
      monthlyExpenses,
      40
    )
  }, [
    currentSavings,
    monthlyContribution,
    yearsToRetirement,
    expectedReturn,
    inflationRate,
    withdrawalRate,
    currentAge,
  ])

  // Combined portfolio (cash + withdrawable CPF OA)
  const combinedPortfolio = useMemo(() => {
    if (includeCPF) {
      return fireResult.portfolioAtRetirement + cpfAtRetirement.withdrawable
    }
    return fireResult.portfolioAtRetirement
  }, [fireResult.portfolioAtRetirement, cpfAtRetirement.withdrawable, includeCPF])

  // Monte Carlo simulation
  const monteCarloResult = useMemo(() => {
    return runMonteCarloSimulation(
      {
        currentSavings,
        monthlyContribution,
        yearsToRetirement,
        expectedReturn,
        inflationRate,
        withdrawalRate,
      },
      currentAge,
      2000,
      500,
      40
    )
  }, [
    currentSavings,
    monthlyContribution,
    yearsToRetirement,
    expectedReturn,
    inflationRate,
    withdrawalRate,
    currentAge,
  ])

  // FIRE number calculation - how much you need based on selected budget and country average
  const fireNumber = useMemo(() => {
    // Average cost across all countries for selected budget
    const avgMonthlyCost = countries.reduce((sum, c) => sum + c.costOfLiving.total[selectedBudget], 0) / countries.length
    const annualExpenses = avgMonthlyCost * 12
    const sgdToUsd = 0.74
    // FIRE number = annual expenses / withdrawal rate, converted to SGD
    return (annualExpenses / withdrawalRate) / sgdToUsd
  }, [selectedBudget, withdrawalRate])

  // Progress towards FIRE
  const fireProgress = useMemo(() => {
    const currentTotal = includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement
    return Math.min((currentTotal / fireNumber) * 100, 100)
  }, [combinedPortfolio, fireResult.portfolioAtRetirement, fireNumber, includeCPF])

  // Country comparison data
  const countryComparisonData = useMemo(() => {
    return countries.map((c) => ({
      country: c.name,
      frugal: c.costOfLiving.total.frugal,
      moderate: c.costOfLiving.total.moderate,
      comfortable: c.costOfLiving.total.comfortable,
    }))
  }, [])

  // Runway data - uses combined portfolio (cash + CPF)
  // This calculates how many years your portfolio will last at each country's cost of living
  const runwayData = useMemo(() => {
    const sgdToUsd = 0.74
    const portfolioToUse = includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement
    const portfolioInUSD = portfolioToUse * sgdToUsd

    return countries.map((c) => {
      const annualBudget = c.costOfLiving.total[selectedBudget] * 12
      // Simple runway: total portfolio / annual spending
      // This doesn't account for investment returns, but gives a baseline
      const years = portfolioInUSD / annualBudget
      return {
        country: c.name,
        years: Math.min(years, 100),
        flag: c.flag,
      }
    })
  }, [combinedPortfolio, fireResult.portfolioAtRetirement, selectedBudget, includeCPF])

  const retirementAge = currentAge + yearsToRetirement

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 transition-colors">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  SG FIRE Calculator
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Plan your retirement abroad from Singapore
                </p>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Keyboard shortcuts button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard className="w-5 h-5 text-gray-500" />
              </button>

              {/* Currency Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => updateField("displayCurrency", "SGD")}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    displayCurrency === "SGD"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  SGD
                </button>
                <button
                  onClick={() => updateField("displayCurrency", "USD")}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    displayCurrency === "USD"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Toggle dark mode</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-800">D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toggle currency</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-800">C</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Share link</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-800">⌘/Ctrl + S</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reset to defaults</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-800">⌘/Ctrl + Shift + R</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Close modal</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-800">Esc</kbd>
              </div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Input Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-blue-600" />
                Your Financial Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Slider
                  label="Current Age"
                  value={currentAge}
                  onChange={(v) => updateField("currentAge", v)}
                  min={20}
                  max={65}
                  formatValue={(v) => `${v} years`}
                />
                <Slider
                  label="Current Savings (SGD)"
                  value={currentSavings}
                  onChange={(v) => updateField("currentSavings", v)}
                  min={50000}
                  max={5000000}
                  step={50000}
                  formatValue={(v) => formatCurrency(v, "SGD")}
                />
                <Slider
                  label="Monthly Contribution"
                  value={monthlyContribution}
                  onChange={(v) => updateField("monthlyContribution", v)}
                  min={0}
                  max={20000}
                  step={500}
                  formatValue={(v) => formatCurrency(v, "SGD")}
                />
                <Slider
                  label="Years to Retirement"
                  value={yearsToRetirement}
                  onChange={(v) => updateField("yearsToRetirement", v)}
                  min={1}
                  max={30}
                  formatValue={(v) => `${v} years`}
                />
                <Slider
                  label="Expected Return"
                  value={expectedReturn}
                  onChange={(v) => updateField("expectedReturn", v)}
                  min={0.03}
                  max={0.12}
                  step={0.005}
                  formatValue={(v) => `${(v * 100).toFixed(1)}%`}
                />
                <Slider
                  label="Inflation Rate"
                  value={inflationRate}
                  onChange={(v) => updateField("inflationRate", v)}
                  min={0.01}
                  max={0.06}
                  step={0.005}
                  formatValue={(v) => `${(v * 100).toFixed(1)}%`}
                />
                <Slider
                  label="Withdrawal Rate"
                  value={withdrawalRate}
                  onChange={(v) => updateField("withdrawalRate", v)}
                  min={0.025}
                  max={0.06}
                  step={0.0025}
                  formatValue={(v) => `${(v * 100).toFixed(2)}%`}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Lifestyle Budget
                  </label>
                  <div className="flex gap-2">
                    {(["frugal", "moderate", "comfortable"] as const).map(
                      (budget) => (
                        <button
                          key={budget}
                          onClick={() => updateField("selectedBudget", budget)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            selectedBudget === budget
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {budget.charAt(0).toUpperCase() + budget.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-500">Quick presets:</span>
                  <button
                    onClick={() => {
                      updateField("currentSavings", 100000)
                      updateField("monthlyContribution", 3000)
                      updateField("yearsToRetirement", 15)
                      updateField("expectedReturn", 0.07)
                      updateField("withdrawalRate", 0.04)
                      updateField("selectedBudget", "frugal")
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                  >
                    🚀 Aggressive Saver
                  </button>
                  <button
                    onClick={() => {
                      updateField("currentSavings", 300000)
                      updateField("monthlyContribution", 2000)
                      updateField("yearsToRetirement", 10)
                      updateField("expectedReturn", 0.06)
                      updateField("withdrawalRate", 0.04)
                      updateField("selectedBudget", "moderate")
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    ⚖️ Balanced
                  </button>
                  <button
                    onClick={() => {
                      updateField("currentSavings", 500000)
                      updateField("monthlyContribution", 1000)
                      updateField("yearsToRetirement", 5)
                      updateField("expectedReturn", 0.05)
                      updateField("withdrawalRate", 0.035)
                      updateField("selectedBudget", "comfortable")
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    🏖️ Near Retirement
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CPF Section */}
        <section className="mb-8">
          <CPFSection
            currentAge={currentAge}
            retirementAge={retirementAge}
            cpfBalances={cpfBalances}
            onBalancesChange={(balances) => {
              updateField("cpfOA", balances.OA)
              updateField("cpfSA", balances.SA)
              updateField("cpfMA", balances.MA)
            }}
            monthlySalary={monthlySalary}
            onSalaryChange={(v) => updateField("monthlySalary", v)}
          />
        </section>

        {/* Warnings */}
        {(withdrawalRate > 0.045 || expectedReturn > 0.09 || yearsToRetirement < 5) && (
          <section className="mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-800">Consider reviewing your assumptions</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {withdrawalRate > 0.045 && (
                      <li>• Withdrawal rate above 4.5% increases risk of running out of money</li>
                    )}
                    {expectedReturn > 0.09 && (
                      <li>• Expected return above 9% may be optimistic for long-term planning</li>
                    )}
                    {yearsToRetirement < 5 && (
                      <li>• Short time horizon limits compound growth potential</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Summary Stats */}
        <section className="mb-8">
          {/* Include CPF Toggle + Share/Reset buttons */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Summary</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCPF}
                  onChange={(e) => updateField("includeCPF", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Include CPF</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share"}
                </button>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Cash/Investments</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatDisplay(fireResult.portfolioAtRetirement, "SGD")}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  At age {retirementAge}
                </p>
              </CardContent>
            </Card>

            {includeCPF && (
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                    <Landmark className="w-4 h-4" />
                    <span className="text-sm">CPF (Full Withdrawal)</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatDisplay(cpfAtRetirement.withdrawable, "SGD")}
                  </p>
                  <p className="text-sm opacity-80 mt-1">
                    On renouncing PR
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Monthly Withdrawal</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatDisplay((includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement) * withdrawalRate / 12, "SGD")}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {(withdrawalRate * 100).toFixed(1)}% SWR
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {(monteCarloResult.successRate * 100).toFixed(0)}%
                </p>
                <p className="text-sm opacity-80 mt-1">Monte Carlo sim</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Total Portfolio</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatDisplay(includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement, "SGD")}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {includeCPF ? "Cash + CPF" : "Cash only"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FIRE Progress Bar */}
          <div className="mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">FIRE Progress</span>
                  <span className="text-sm text-gray-500">
                    Target: {formatDisplay(fireNumber, "SGD")} ({selectedBudget} lifestyle)
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      fireProgress >= 100 ? 'bg-green-500' : fireProgress >= 75 ? 'bg-blue-500' : fireProgress >= 50 ? 'bg-amber-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${fireProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-medium ${fireProgress >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                    {fireProgress.toFixed(0)}% of FIRE goal
                  </span>
                  {fireProgress >= 100 ? (
                    <span className="text-sm text-green-600 font-medium">🎉 You've reached FIRE!</span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {formatDisplay(fireNumber - (includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement), "SGD")} to go
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What Can You Afford Section */}
        <section className="mb-8">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">
                💡 What Your Portfolio Can Buy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const portfolioToUse = includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement
                  const monthlyUSD = (portfolioToUse * withdrawalRate / 12) * 0.74
                  const affordableCountries = countries.filter(
                    (c) => c.costOfLiving.total[selectedBudget] <= monthlyUSD
                  )
                  const bestValue = [...countries].sort(
                    (a, b) =>
                      a.costOfLiving.total[selectedBudget] -
                      b.costOfLiving.total[selectedBudget]
                  )[0]
                  const mostExpensive = [...countries].sort(
                    (a, b) =>
                      b.costOfLiving.total[selectedBudget] -
                      a.costOfLiving.total[selectedBudget]
                  )[0]

                  return (
                    <>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">
                          Countries You Can Afford
                        </p>
                        <p className="text-3xl font-bold text-indigo-600">
                          {affordableCountries.length} / {countries.length}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          With {selectedBudget} lifestyle
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Best Value</p>
                        <p className="text-xl font-bold text-green-600">
                          {bestValue.flag} {bestValue.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDisplay(bestValue.costOfLiving.total[selectedBudget], "USD")}/month
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">
                          Premium Option
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                          {mostExpensive.flag} {mostExpensive.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDisplay(mostExpensive.costOfLiving.total[selectedBudget], "USD")}/month
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Charts Section */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioChart
            projections={fireResult.projections}
            retirementAge={retirementAge}
          />
          <MonteCarloChart
            result={monteCarloResult}
            retirementAge={retirementAge}
          />
        </section>

        {/* Country Comparison Charts */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CountryComparisonChart data={countryComparisonData} />
          <RunwayChart data={runwayData} targetYears={25} />
        </section>

        {/* Globe Visualization */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Global Retirement Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={
                <div className="w-full h-[500px] bg-slate-900 rounded-xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading globe...</p>
                  </div>
                </div>
              }>
                <GlobeVisualization
                  countries={countries}
                  selectedBudget={selectedBudget}
                  portfolioValue={includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement}
                  withdrawalRate={withdrawalRate}
                  onCountryClick={setFocusedCountry}
                  focusedCountry={focusedCountry}
                />
              </Suspense>
            </CardContent>
          </Card>
        </section>

        {/* Countries Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Retirement Destinations
                </h2>
                <p className="text-sm text-gray-500">
                  Click a country to see detailed burn rate projections
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>Click for projections</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {countries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                selectedBudget={selectedBudget}
                portfolioValue={includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement}
                withdrawalRate={withdrawalRate}
                onSelect={() => setFocusedCountry(country)}
                isSelected={focusedCountry?.id === country.id}
                displayCurrency={displayCurrency}
              />
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Quick Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Country</th>
                      <th className="text-right py-3 px-2">Frugal</th>
                      <th className="text-right py-3 px-2">Moderate</th>
                      <th className="text-right py-3 px-2">Comfortable</th>
                      <th className="text-center py-3 px-2">English</th>
                      <th className="text-center py-3 px-2">Safety</th>
                      <th className="text-center py-3 px-2">Healthcare</th>
                      <th className="text-left py-3 px-2">Visa Type</th>
                      <th className="text-right py-3 px-2">Runway</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((c) => {
                      const sgdToUsd = 0.74
                      const portfolioToUse = includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement
                      const portfolioInUSD = portfolioToUse * sgdToUsd
                      const annualBudget =
                        c.costOfLiving.total[selectedBudget] * 12
                      const years = portfolioInUSD / annualBudget

                      return (
                        <tr
                          key={c.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setFocusedCountry(c)}
                        >
                          <td className="py-3 px-2">
                            <span className="mr-2">{c.flag}</span>
                            {c.name}
                          </td>
                          <td className="text-right py-3 px-2">
                            {formatDisplay(c.costOfLiving.total.frugal, "USD")}
                          </td>
                          <td className="text-right py-3 px-2">
                            {formatDisplay(c.costOfLiving.total.moderate, "USD")}
                          </td>
                          <td className="text-right py-3 px-2">
                            {formatDisplay(c.costOfLiving.total.comfortable, "USD")}
                          </td>
                          <td className="text-center py-3 px-2 text-amber-500">
                            {"★".repeat(c.lifestyle.englishFriendly)}
                          </td>
                          <td className="text-center py-3 px-2 text-amber-500">
                            {"★".repeat(c.lifestyle.safety)}
                          </td>
                          <td className="text-center py-3 px-2 text-amber-500">
                            {"★".repeat(c.lifestyle.healthcare)}
                          </td>
                          <td className="py-3 px-2 text-xs max-w-[150px] truncate">
                            {c.visa.type}
                          </td>
                          <td className="text-right py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                years >= 30
                                  ? "bg-green-100 text-green-700"
                                  : years >= 20
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {years >= 100 ? "∞" : Math.round(years)}y
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-8">
          <p>
            This calculator is for educational purposes only. Consult a
            financial advisor for personalized advice.
          </p>
          <p className="mt-2">
            Cost of living data is approximate and may vary. Visa requirements
            change frequently.
          </p>
        </footer>
      </main>

      {/* Country Projection Modal - Shows burn rate chart */}
      {focusedCountry && (
        <CountryProjection
          country={focusedCountry}
          portfolioAtRetirement={includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement}
          retirementAge={retirementAge}
          selectedBudget={selectedBudget}
          withdrawalRate={withdrawalRate}
          expectedReturn={expectedReturn}
          inflationRate={inflationRate}
          onClose={() => setFocusedCountry(null)}
          onViewDetails={() => {
            setSelectedCountry(focusedCountry)
            setFocusedCountry(null)
          }}
          displayCurrency={displayCurrency}
        />
      )}

      {/* Country Detail Modal - Shows detailed info */}
      {selectedCountry && (
        <CountryDetail
          country={selectedCountry}
          selectedBudget={selectedBudget}
          portfolioValue={includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement}
          withdrawalRate={withdrawalRate}
          onClose={() => setSelectedCountry(null)}
          displayCurrency={displayCurrency}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              <strong>Disclaimer:</strong> This calculator is for educational purposes only. 
              Actual returns, costs, and visa requirements may vary. Consult a financial advisor before making decisions.
            </p>
            <p>
              Cost of living data is approximate and based on 2024 estimates. Exchange rates fluctuate.
            </p>
            <p className="text-gray-400 mt-4">
              Built with ❤️ for Singaporeans planning their FIRE journey abroad
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
