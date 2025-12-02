import { useState, useMemo, lazy, Suspense } from "react"
import "./App.css"
import { countries } from "@/data/countries"
import type { Country } from "@/data/countries"
import { calculateFIRE, runMonteCarloSimulation } from "@/lib/calculator"
import type { CPFBalances } from "@/lib/cpf"
import { projectCPF } from "@/lib/cpf"
import { formatCurrency } from "@/lib/utils"
import { usePersistedState } from "@/hooks/usePersistedState"
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
} from "lucide-react"

function App() {
  // Persisted state (localStorage + URL sharing)
  const { state, updateField, copyShareableUrl, resetToDefaults } = usePersistedState()
  const [copied, setCopied] = useState(false)

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

  const cpfBalances: CPFBalances = {
    OA: state.cpfOA,
    SA: state.cpfSA,
    MA: state.cpfMA,
    total: state.cpfOA + state.cpfSA + state.cpfMA,
  }

  // UI-only state (not persisted)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [focusedCountry, setFocusedCountry] = useState<Country | null>(null)

  // Handle share button
  const handleShare = async () => {
    const success = await copyShareableUrl()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
  const runwayData = useMemo(() => {
    const sgdToUsd = 0.74
    const portfolioToUse = includeCPF ? combinedPortfolio : fireResult.portfolioAtRetirement
    const annualWithdrawal = portfolioToUse * withdrawalRate * sgdToUsd

    return countries.map((c) => {
      const annualBudget = c.costOfLiving.total[selectedBudget] * 12
      const years = annualWithdrawal / annualBudget
      return {
        country: c.name,
        years: Math.min(years, 100),
        flag: c.flag,
      }
    })
  }, [combinedPortfolio, fireResult.portfolioAtRetirement, withdrawalRate, selectedBudget, includeCPF])

  const retirementAge = currentAge + yearsToRetirement

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
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
            {/* Currency Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">Display:</span>
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
                  {displayCurrency === "SGD" ? "4% SWR" : "4% SWR"}
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
                      const annualWithdrawal =
                        portfolioToUse *
                        withdrawalRate *
                        sgdToUsd
                      const annualBudget =
                        c.costOfLiving.total[selectedBudget] * 12
                      const years = annualWithdrawal / annualBudget

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
    </div>
  )
}

export default App
