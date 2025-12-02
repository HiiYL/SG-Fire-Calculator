import { useMemo } from "react"
import type { Country } from "@/data/countries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts"
import {
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react"

interface CountryProjectionProps {
  country: Country
  portfolioAtRetirement: number
  retirementAge: number
  selectedBudget: "frugal" | "moderate" | "comfortable"
  withdrawalRate: number
  expectedReturn: number
  inflationRate: number
  onClose: () => void
  onViewDetails?: () => void
  displayCurrency?: "SGD" | "USD"
}

interface YearlyData {
  age: number
  year: number
  portfolio: number
  withdrawal: number
  returns: number
  spending: number
}

export function CountryProjection({
  country,
  portfolioAtRetirement,
  retirementAge,
  selectedBudget,
  withdrawalRate,
  onViewDetails,
  expectedReturn,
  inflationRate,
  onClose,
  displayCurrency = "SGD",
}: CountryProjectionProps) {
  const sgdToUsd = 0.74
  const usdToSgd = 1 / sgdToUsd
  const monthlyBudget = country.costOfLiving.total[selectedBudget]
  const annualBudgetUSD = monthlyBudget * 12

  // Convert USD cost to display currency
  const formatCost = (usdAmount: number) => {
    const amount = displayCurrency === "USD" ? usdAmount : usdAmount * usdToSgd
    return formatCurrency(amount, displayCurrency)
  }

  // Calculate country-specific projection with actual spending
  const projection = useMemo(() => {
    const data: YearlyData[] = []
    let portfolio = portfolioAtRetirement
    let currentSpending = annualBudgetUSD / sgdToUsd // Convert to SGD
    const retirementReturn = expectedReturn - 0.01 // Slightly lower in retirement
    const years = 50

    for (let year = 0; year <= years; year++) {
      const age = retirementAge + year
      const returns = portfolio * retirementReturn
      const withdrawal = year === 0 ? 0 : currentSpending

      data.push({
        age,
        year,
        portfolio: Math.max(0, Math.round(portfolio)),
        withdrawal: Math.round(withdrawal),
        returns: Math.round(returns),
        spending: Math.round(currentSpending),
      })

      portfolio = portfolio + returns - withdrawal
      currentSpending *= 1 + inflationRate // Inflation-adjusted spending

      if (portfolio <= 0) {
        // Fill remaining years with zeros
        for (let remaining = year + 1; remaining <= years; remaining++) {
          data.push({
            age: retirementAge + remaining,
            year: remaining,
            portfolio: 0,
            withdrawal: 0,
            returns: 0,
            spending: 0,
          })
        }
        break
      }
    }

    return data
  }, [
    portfolioAtRetirement,
    annualBudgetUSD,
    retirementAge,
    expectedReturn,
    inflationRate,
  ])

  // Calculate key metrics
  const depletionYear = projection.findIndex((d) => d.portfolio <= 0)
  const yearsOfRunway = depletionYear === -1 ? 50 : depletionYear
  const depletionAge = retirementAge + yearsOfRunway
  const totalWithdrawals = projection.reduce((sum, d) => sum + d.withdrawal, 0)

  // Compare with 4% rule withdrawal
  const fourPercentWithdrawal = portfolioAtRetirement * 0.04
  const actualFirstYearSpending = annualBudgetUSD / sgdToUsd
  const spendingVs4Percent = (actualFirstYearSpending / fourPercentWithdrawal - 1) * 100

  // Determine status
  const isHealthy = yearsOfRunway >= 30
  const isWarning = yearsOfRunway >= 20 && yearsOfRunway < 30

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{country.flag}</span>
              <div>
                <CardTitle className="text-xl">
                  Retirement in {country.name}
                </CardTitle>
                <p className="text-gray-500 text-sm">
                  {selectedBudget.charAt(0).toUpperCase() + selectedBudget.slice(1)} lifestyle • {formatCost(monthlyBudget)}/month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`rounded-xl p-4 ${
              isHealthy
                ? "bg-green-50 border border-green-200"
                : isWarning
                ? "bg-amber-50 border border-amber-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {isHealthy ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className={`w-6 h-6 ${isWarning ? "text-amber-600" : "text-red-600"}`} />
              )}
              <div>
                <p className={`font-semibold ${isHealthy ? "text-green-800" : isWarning ? "text-amber-800" : "text-red-800"}`}>
                  {isHealthy
                    ? "Your portfolio can sustain this lifestyle!"
                    : isWarning
                    ? "Caution: Consider a more frugal lifestyle"
                    : "Warning: High risk of running out of money"}
                </p>
                <p className={`text-sm ${isHealthy ? "text-green-600" : isWarning ? "text-amber-600" : "text-red-600"}`}>
                  {yearsOfRunway >= 50
                    ? "Your money should last indefinitely with this spending level"
                    : `Your portfolio will last approximately ${yearsOfRunway} years (until age ${depletionAge})`}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Years of Runway</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {yearsOfRunway >= 50 ? "50+" : yearsOfRunway}
              </p>
              <p className="text-xs text-blue-600">
                Until age {depletionAge >= retirementAge + 50 ? `${retirementAge + 50}+` : depletionAge}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Annual Spending</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatCost(annualBudgetUSD)}
              </p>
              <p className="text-xs text-green-600">
                {formatCost(monthlyBudget)}/month
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">vs 4% Rule</span>
              </div>
              <p className={`text-2xl font-bold ${spendingVs4Percent > 0 ? "text-amber-600" : "text-green-600"}`}>
                {spendingVs4Percent > 0 ? "+" : ""}{spendingVs4Percent.toFixed(0)}%
              </p>
              <p className="text-xs text-purple-600">
                {spendingVs4Percent > 0 ? "Above safe withdrawal" : "Below safe withdrawal"}
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Total Withdrawals</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {formatCurrency(displayCurrency === "SGD" ? totalWithdrawals : totalWithdrawals * sgdToUsd, displayCurrency)}
              </p>
              <p className="text-xs text-amber-600">
                Over {yearsOfRunway} years
              </p>
            </div>
          </div>

          {/* Portfolio Projection Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Portfolio Projection</h3>
            <div className="h-80 bg-gray-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    label={{ value: "Age", position: "bottom", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickFormatter={(value) => {
                      const converted = displayCurrency === "SGD" ? value : value * sgdToUsd
                      return `${displayCurrency === "SGD" ? "S$" : "$"}${(converted / 1000000).toFixed(1)}M`
                    }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(displayCurrency === "SGD" ? value : value * sgdToUsd, displayCurrency),
                      name,
                    ]}
                    labelFormatter={(label) => `Age ${label}`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {depletionYear > 0 && (
                    <ReferenceLine
                      x={depletionAge}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label={{
                        value: "Depletion",
                        position: "top",
                        fontSize: 11,
                        fill: "#ef4444",
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="portfolio"
                    name="Portfolio Value"
                    stroke="#3b82f6"
                    fill="url(#portfolioGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawal"
                    name="Annual Withdrawal"
                    stroke="#ef4444"
                    fill="url(#spendingGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spending Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Monthly Spending Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Rent (1-bed)", value: country.costOfLiving.rent1Bed },
                { label: "Utilities", value: country.costOfLiving.utilities },
                { label: "Groceries", value: country.costOfLiving.groceries },
                { label: "Dining Out", value: country.costOfLiving.diningOut },
                { label: "Transport", value: country.costOfLiving.transportation },
                { label: "Healthcare", value: country.costOfLiving.healthcare },
                { label: "Entertainment", value: country.costOfLiving.entertainment },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="font-semibold">{formatCost(item.value)}</p>
                  <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(item.value / monthlyBudget) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Total</p>
                <p className="font-bold text-blue-700">{formatCost(monthlyBudget)}</p>
                <p className="text-xs text-blue-500 mt-1">
                  per month
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Comparison */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Lifestyle Comparison</h3>
            <div className="grid grid-cols-3 gap-4">
              {(["frugal", "moderate", "comfortable"] as const).map((budget) => {
                const budgetAmount = country.costOfLiving.total[budget]
                const annualAmount = budgetAmount * 12
                const annualSGD = annualAmount / sgdToUsd
                const years = (portfolioAtRetirement * (expectedReturn - 0.01)) > annualSGD
                  ? 50
                  : Math.floor(portfolioAtRetirement / annualSGD)
                const isSelected = budget === selectedBudget

                return (
                  <div
                    key={budget}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className={`font-semibold capitalize ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                      {budget}
                    </p>
                    <p className="text-2xl font-bold mt-1">{formatCost(budgetAmount)}</p>
                    <p className="text-sm text-gray-500">/month</p>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Runway</p>
                      <p className={`font-semibold ${years >= 30 ? "text-green-600" : years >= 20 ? "text-amber-600" : "text-red-600"}`}>
                        {years >= 50 ? "50+ years" : `~${years} years`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold mb-3">💡 Tips for {country.name}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Consider {country.popularCities[0]?.name} for the best balance of cost and amenities</li>
              <li>• Healthcare costs may increase with age - budget extra for medical expenses</li>
              <li>• Exchange rate fluctuations can impact your purchasing power by 10-20%</li>
              <li>• The {country.visa.type} requires: {country.visa.requirements[0]}</li>
              {spendingVs4Percent > 20 && (
                <li className="text-amber-600">• Your spending is {spendingVs4Percent.toFixed(0)}% above the 4% rule - consider reducing expenses</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
