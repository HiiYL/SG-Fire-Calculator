import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { formatCurrency } from "@/lib/utils"
import {
  projectCPF,
  CPF_RATES,
  CPF_LIMITS,
  estimateCPFLifePayout,
  getEffectiveCPFRate,
} from "@/lib/cpf"
import type { CPFBalances } from "@/lib/cpf"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"
import { Landmark, Info, TrendingUp, Wallet, ChevronDown, ChevronUp } from "lucide-react"

interface CPFSectionProps {
  currentAge: number
  retirementAge: number
  cpfBalances: CPFBalances
  onBalancesChange: (balances: CPFBalances) => void
  monthlySalary: number
  onSalaryChange: (salary: number) => void
  defaultExpanded?: boolean
}

export function CPFSection({
  currentAge,
  retirementAge,
  cpfBalances,
  onBalancesChange,
  monthlySalary,
  onSalaryChange,
  defaultExpanded = false,
}: CPFSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  // Project CPF growth
  const cpfProjection = useMemo(() => {
    return projectCPF(
      cpfBalances,
      monthlySalary,
      currentAge,
      Math.max(30, 65 - currentAge), // Project until at least 65
      retirementAge
    )
  }, [cpfBalances, monthlySalary, currentAge, retirementAge])

  // Get values at key ages
  const atRetirement = cpfProjection.find((p) => p.age === retirementAge)
  const at55 = cpfProjection.find((p) => p.age === 55)
  const at65 = cpfProjection.find((p) => p.age === 65)

  // Estimate CPF LIFE payout
  const cpfLifePayout = useMemo(() => {
    const raAt65 = at65?.RA || at65?.SA || 0
    return estimateCPFLifePayout(raAt65)
  }, [at65])

  // Effective interest rate
  const effectiveRate = getEffectiveCPFRate(cpfBalances, currentAge)

  // Chart data
  const chartData = cpfProjection.map((p) => ({
    age: p.age,
    OA: p.OA,
    SA: p.SA,
    MA: p.MA,
    RA: p.RA,
    total: p.total,
  }))

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            <span>CPF Balances</span>
            <span className="text-sm font-normal text-gray-500">
              ({formatCurrency(cpfBalances.total, "SGD")} → {formatCurrency(atRetirement?.total || 0, "SGD")} at retirement)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-gray-400">
              {isExpanded ? "Click to collapse" : "Click to expand"}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
      <CardContent className="space-y-6">
        {/* CPF Input Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Slider
            label="CPF OA Balance"
            value={cpfBalances.OA}
            onChange={(v) =>
              onBalancesChange({ ...cpfBalances, OA: v, total: v + cpfBalances.SA + cpfBalances.MA })
            }
            min={0}
            max={500000}
            step={5000}
            formatValue={(v) => formatCurrency(v, "SGD")}
          />
          <Slider
            label="CPF SA Balance"
            value={cpfBalances.SA}
            onChange={(v) =>
              onBalancesChange({ ...cpfBalances, SA: v, total: cpfBalances.OA + v + cpfBalances.MA })
            }
            min={0}
            max={500000}
            step={5000}
            formatValue={(v) => formatCurrency(v, "SGD")}
          />
          <Slider
            label="CPF MA Balance"
            value={cpfBalances.MA}
            onChange={(v) =>
              onBalancesChange({ ...cpfBalances, MA: v, total: cpfBalances.OA + cpfBalances.SA + v })
            }
            min={0}
            max={100000}
            step={2000}
            formatValue={(v) => formatCurrency(v, "SGD")}
          />
          <Slider
            label="Monthly Salary"
            value={monthlySalary}
            onChange={onSalaryChange}
            min={0}
            max={20000}
            step={500}
            formatValue={(v) => formatCurrency(v, "SGD")}
          />
        </div>

        {/* Interest Rate Info */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">CPF Interest Rates</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-blue-700">
                <div>
                  <span className="text-blue-500">OA:</span> {(CPF_RATES.OA * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="text-blue-500">SA:</span> {(CPF_RATES.SA * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="text-blue-500">MA:</span> {(CPF_RATES.MA * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="text-blue-500">Effective:</span>{" "}
                  <span className="font-semibold">{(effectiveRate * 100).toFixed(2)}%</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                +1% extra on first $60K combined (OA capped at $20K) • +1% extra for 55+ on first $30K
              </p>
            </div>
          </div>
        </div>

        {/* Key Milestones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium">Current Total</span>
            </div>
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(cpfBalances.total, "SGD")}
            </p>
            <p className="text-xs text-green-600 mt-1">
              OA: {formatCurrency(cpfBalances.OA, "SGD")}
            </p>
          </div>

          {atRetirement && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">At Retirement ({retirementAge})</span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(atRetirement.total, "SGD")}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                OA: {formatCurrency(atRetirement.OA, "SGD")}
              </p>
            </div>
          )}

          {at55 && currentAge < 55 && (
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Landmark className="w-4 h-4" />
                <span className="text-xs font-medium">At Age 55</span>
              </div>
              <p className="text-xl font-bold text-purple-700">
                {formatCurrency(at55.total, "SGD")}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                SA→RA: {formatCurrency(at55.SA, "SGD")}
              </p>
            </div>
          )}

          {at65 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-medium">CPF LIFE (est.)</span>
              </div>
              <p className="text-xl font-bold text-amber-700">
                {formatCurrency(cpfLifePayout.standard, "SGD")}/mo
              </p>
              <p className="text-xs text-amber-600 mt-1">
                From age 65 onwards
              </p>
            </div>
          )}
        </div>

        {/* CPF Projection Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">CPF Growth Projection</h4>
          <div className="h-64 bg-gray-50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="oaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="saGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="maGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="age"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, "SGD"),
                    name,
                  ]}
                  labelFormatter={(label) => `Age ${label}`}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <ReferenceLine
                  x={55}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{ value: "55", position: "top", fontSize: 10 }}
                />
                <ReferenceLine
                  x={retirementAge}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "Retire", position: "top", fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="OA"
                  name="OA"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#oaGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="SA"
                  name="SA/RA"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="url(#saGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="MA"
                  name="MA"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#maGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPF Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-medium text-amber-800 mb-2">💡 CPF & FIRE Abroad</p>
          <ul className="space-y-1 text-xs text-amber-700">
            <li>• <strong>Full withdrawal:</strong> All CPF (OA + SA + MA) can be withdrawn when renouncing PR/citizenship</li>
            <li>• <strong>Processing time:</strong> Typically 2-3 weeks after renunciation is approved</li>
            <li>• <strong>Tax implications:</strong> CPF withdrawals are not taxable in Singapore</li>
            <li>• <strong>No return:</strong> Once withdrawn, you cannot contribute to CPF again unless you regain PR</li>
            <li>• <strong>Healthcare:</strong> Consider private health insurance as you'll lose Medisave coverage</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-xs text-amber-600">
              <strong>Alternative:</strong> If keeping SG ties, you can withdraw OA above FRS ({formatCurrency(CPF_LIMITS.FRS_2024, "SGD")}) at 55 
              and receive CPF LIFE payouts from 65 while living abroad.
            </p>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  )
}
