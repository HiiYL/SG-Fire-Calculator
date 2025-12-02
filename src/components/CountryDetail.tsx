import type { Country } from "@/data/countries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  MapPin,
  Clock,
  Shield,
  Heart,
  Wifi,
  Globe,
  CheckCircle,
  XCircle,
  FileText,
  Sun,
  DollarSign,
  Home,
  Utensils,
  Car,
  Zap,
  Film,
  X,
} from "lucide-react"

interface CountryDetailProps {
  country: Country
  selectedBudget: "frugal" | "moderate" | "comfortable"
  portfolioValue: number
  withdrawalRate: number
  onClose: () => void
}

export function CountryDetail({
  country,
  selectedBudget,
  portfolioValue,
  withdrawalRate,
  onClose,
}: CountryDetailProps) {
  const monthlyBudget = country.costOfLiving.total[selectedBudget]
  const annualBudget = monthlyBudget * 12
  const sgdToUsd = 0.74
  const annualWithdrawal = portfolioValue * withdrawalRate * sgdToUsd
  const yearsOfRunway = annualWithdrawal / annualBudget

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }

  const costBreakdown = [
    { label: "Rent (1-bed)", value: country.costOfLiving.rent1Bed, icon: Home },
    { label: "Utilities", value: country.costOfLiving.utilities, icon: Zap },
    { label: "Groceries", value: country.costOfLiving.groceries, icon: Utensils },
    { label: "Dining Out", value: country.costOfLiving.diningOut, icon: Utensils },
    { label: "Transport", value: country.costOfLiving.transportation, icon: Car },
    { label: "Healthcare", value: country.costOfLiving.healthcare, icon: Heart },
    { label: "Entertainment", value: country.costOfLiving.entertainment, icon: Film },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{country.flag}</span>
              <div>
                <CardTitle className="text-2xl">{country.name}</CardTitle>
                <p className="text-gray-500">{country.region}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Monthly Budget</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(monthlyBudget, "USD")}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {formatCurrency(annualBudget, "USD")}/year
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Runway</span>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {yearsOfRunway >= 100 ? "∞" : Math.round(yearsOfRunway)} years
              </p>
              <p className="text-sm text-green-600 mt-1">
                Based on {(withdrawalRate * 100).toFixed(1)}% withdrawal
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Globe className="w-5 h-5" />
                <span className="font-medium">Currency</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">
                {country.currency}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                1 {country.currency} = {country.exchangeRate.toFixed(4)} SGD
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              Monthly Cost Breakdown (USD)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {costBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
                >
                  <item.icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-semibold">${item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lifestyle Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-gray-500" />
              Lifestyle
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Climate</p>
                <p className="font-medium">{country.lifestyle.climate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Languages</p>
                <p className="font-medium">{country.lifestyle.language.join(", ")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-medium">{country.lifestyle.timezone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Flight from SG</p>
                <p className="font-medium">{country.lifestyle.flightFromSG}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Internet Speed</p>
                <p className="font-medium">{country.lifestyle.internetSpeed} Mbps</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">English Friendly</p>
                <p className="text-amber-500 font-medium">
                  {getRatingStars(country.lifestyle.englishFriendly)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Safety</p>
                  <p className="text-amber-500">{getRatingStars(country.lifestyle.safety)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Healthcare</p>
                  <p className="text-amber-500">{getRatingStars(country.lifestyle.healthcare)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Internet</p>
                  <p className="font-medium">{country.lifestyle.internetSpeed} Mbps</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visa Information */}
          <div className="bg-amber-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Visa Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Visa Type</p>
                <p className="font-semibold text-amber-800">{country.visa.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maximum Stay</p>
                <p className="font-medium">{country.visa.maxStay}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requirements</p>
                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                  {country.visa.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-500">Renewability</p>
                <p className="font-medium">{country.visa.renewability}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Path to Residency</p>
                <p className="font-medium">{country.visa.pathToResidency}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Work Allowed:</span>
                <span
                  className={`px-2 py-0.5 rounded text-sm ${
                    country.visa.workAllowed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {country.visa.workAllowed ? "Yes" : "No"}
                </span>
              </div>
              {country.visa.notes && (
                <div className="bg-amber-100 rounded-lg p-3 mt-3">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> {country.visa.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              Popular Cities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {country.popularCities.map((city) => (
                <div key={city.name} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-lg">{city.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{city.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      Frugal: ${city.monthlyBudget.frugal}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Moderate: ${city.monthlyBudget.moderate}
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Comfortable: ${city.monthlyBudget.comfortable}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Pros
              </h3>
              <ul className="space-y-2">
                {country.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Cons
              </h3>
              <ul className="space-y-2">
                {country.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
