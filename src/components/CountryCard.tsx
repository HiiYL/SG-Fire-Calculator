import type { Country } from "@/data/countries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  MapPin,
  Clock,
  Plane,
  Shield,
  Heart,
  Wifi,
  Globe,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react"

interface CountryCardProps {
  country: Country
  selectedBudget: "frugal" | "moderate" | "comfortable"
  portfolioValue: number
  withdrawalRate: number
  onSelect: () => void
  isSelected: boolean
  displayCurrency?: "SGD" | "USD"
}

export function CountryCard({
  country,
  selectedBudget,
  portfolioValue,
  withdrawalRate,
  onSelect,
  isSelected,
  displayCurrency = "SGD",
}: CountryCardProps) {
  const monthlyBudget = country.costOfLiving.total[selectedBudget]
  const annualBudget = monthlyBudget * 12
  const sgdToUsd = 0.74
  const usdToSgd = 1 / sgdToUsd
  const annualWithdrawal = portfolioValue * withdrawalRate * sgdToUsd
  const yearsOfRunway = annualWithdrawal / annualBudget
  const canAfford = yearsOfRunway >= 25

  // Convert USD cost to display currency
  const formatCost = (usdAmount: number) => {
    const amount = displayCurrency === "USD" ? usdAmount : usdAmount * usdToSgd
    return formatCurrency(amount, displayCurrency)
  }

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{country.flag}</span>
            <div>
              <CardTitle className="text-xl">{country.name}</CardTitle>
              <p className="text-sm text-gray-500">{country.region}</p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              canAfford
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {yearsOfRunway >= 100
              ? "∞ years"
              : `${Math.round(yearsOfRunway)} years`}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Monthly Budget */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Monthly Budget</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCost(monthlyBudget)}
            </span>
          </div>
          <div className="flex gap-2 text-xs">
            <span
              className={`px-2 py-1 rounded ${
                selectedBudget === "frugal"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Frugal: {formatCost(country.costOfLiving.total.frugal)}
            </span>
            <span
              className={`px-2 py-1 rounded ${
                selectedBudget === "moderate"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Mod: {formatCost(country.costOfLiving.total.moderate)}
            </span>
            <span
              className={`px-2 py-1 rounded ${
                selectedBudget === "comfortable"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Comf: {formatCost(country.costOfLiving.total.comfortable)}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{country.lifestyle.timezone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-gray-400" />
            <span>{country.lifestyle.flightFromSG}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-amber-500">
              {getRatingStars(country.lifestyle.englishFriendly)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-amber-500">
              {getRatingStars(country.lifestyle.safety)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="text-amber-500">
              {getRatingStars(country.lifestyle.healthcare)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-gray-400" />
            <span>{country.lifestyle.internetSpeed} Mbps</span>
          </div>
        </div>

        {/* Visa Info */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">{country.visa.type}</span>
          </div>
          <p className="text-xs text-gray-500">{country.visa.maxStay}</p>
          {country.visa.workAllowed && (
            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              Work Allowed
            </span>
          )}
        </div>

        {/* Popular Cities */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">Popular Cities</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {country.popularCities.slice(0, 3).map((city) => (
              <span
                key={city.name}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {city.name}
              </span>
            ))}
          </div>
        </div>

        {/* Pros & Cons Preview */}
        <div className="border-t pt-3 grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center gap-1 text-green-600 text-xs font-medium mb-1">
              <CheckCircle className="w-3 h-3" />
              Pros
            </div>
            <ul className="text-xs text-gray-600 space-y-0.5">
              {country.pros.slice(0, 2).map((pro, i) => (
                <li key={i} className="truncate">
                  • {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1 text-red-600 text-xs font-medium mb-1">
              <XCircle className="w-3 h-3" />
              Cons
            </div>
            <ul className="text-xs text-gray-600 space-y-0.5">
              {country.cons.slice(0, 2).map((con, i) => (
                <li key={i} className="truncate">
                  • {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
