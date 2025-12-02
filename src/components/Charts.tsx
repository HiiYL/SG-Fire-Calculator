import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
} from "recharts"
import type { MonteCarloResult, SimulationResult } from "@/lib/calculator"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PortfolioChartProps {
  projections: SimulationResult[]
  retirementAge: number
}

export function PortfolioChart({ projections, retirementAge }: PortfolioChartProps) {
  const data = projections.map((p) => ({
    age: p.age,
    portfolio: Math.round(p.portfolioValue),
    inflationAdjusted: Math.round(p.inflationAdjustedValue),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Portfolio Projection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="inflationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value, "SGD")}
                labelFormatter={(label) => `Age ${label}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <ReferenceLine
                x={retirementAge}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: "Retirement", position: "top", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="portfolio"
                name="Nominal Value"
                stroke="#3b82f6"
                fill="url(#portfolioGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="inflationAdjusted"
                name="Inflation Adjusted"
                stroke="#10b981"
                fill="url(#inflationGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface MonteCarloChartProps {
  result: MonteCarloResult
  retirementAge: number
}

export function MonteCarloChart({ result, retirementAge }: MonteCarloChartProps) {
  const data = result.years.map((year, i) => ({
    age: year,
    p5: Math.round(result.percentile5[i]),
    p25: Math.round(result.percentile25[i]),
    p50: Math.round(result.percentile50[i]),
    p75: Math.round(result.percentile75[i]),
    p95: Math.round(result.percentile95[i]),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Monte Carlo Simulation</span>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              result.successRate >= 0.9
                ? "bg-green-100 text-green-700"
                : result.successRate >= 0.75
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {(result.successRate * 100).toFixed(0)}% Success Rate
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value, "SGD")}
                labelFormatter={(label) => `Age ${label}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <ReferenceLine
                x={retirementAge}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: "Retirement", position: "top", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="p95"
                name="95th Percentile"
                stroke="#22c55e"
                fill="none"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey="p75"
                name="75th Percentile"
                stroke="#3b82f6"
                fill="none"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="p50"
                name="Median"
                stroke="#8b5cf6"
                fill="url(#rangeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="p25"
                name="25th Percentile"
                stroke="#f59e0b"
                fill="none"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="p5"
                name="5th Percentile"
                stroke="#ef4444"
                fill="none"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Based on 1,000 simulations with 15% annual volatility
        </p>
      </CardContent>
    </Card>
  )
}

interface CountryComparisonChartProps {
  data: {
    country: string
    frugal: number
    moderate: number
    comfortable: number
  }[]
}

export function CountryComparisonChart({ data }: CountryComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monthly Budget Comparison (USD)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                type="category"
                dataKey="country"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                width={100}
              />
              <Tooltip
                formatter={(value: number) => `$${value}/month`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="frugal" name="Frugal" fill="#22c55e" radius={[0, 4, 4, 0]} />
              <Bar dataKey="moderate" name="Moderate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="comfortable" name="Comfortable" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface RunwayChartProps {
  data: {
    country: string
    years: number
    flag: string
  }[]
  targetYears: number
}

export function RunwayChart({ data, targetYears }: RunwayChartProps) {
  const sortedData = [...data].sort((a, b) => b.years - a.years)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Years of Runway by Country</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                domain={[0, Math.max(50, ...sortedData.map((d) => d.years))]}
              />
              <YAxis
                type="category"
                dataKey="country"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                width={120}
                tickFormatter={(value, index) => `${sortedData[index]?.flag || ""} ${value}`}
              />
              <Tooltip
                formatter={(value: number) =>
                  value >= 100 ? "∞ years" : `${Math.round(value)} years`
                }
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <ReferenceLine
                x={targetYears}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: `${targetYears}yr target`, position: "top", fontSize: 10 }}
              />
              <Bar
                dataKey="years"
                name="Years"
                radius={[0, 4, 4, 0]}
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
