import { useRef, useEffect, useMemo, useCallback } from "react"
import Globe from "react-globe.gl"
import type { Country } from "@/data/countries"

interface GlobeVisualizationProps {
  countries: Country[]
  selectedBudget: "frugal" | "moderate" | "comfortable"
  portfolioValue: number
  withdrawalRate: number
  onCountryClick: (country: Country) => void
  focusedCountry: Country | null
}

// Singapore coordinates for initial view
const SINGAPORE = { lat: 1.3521, lng: 103.8198 }

// Color scale: red (not affordable) -> yellow (borderline) -> green (affordable)
function getColorForScore(score: number): string {
  if (score < 0.4) {
    // Red to orange
    const r = 239
    const g = Math.round(68 + (score / 0.4) * 100)
    const b = 68
    return `rgb(${r}, ${g}, ${b})`
  } else if (score < 0.7) {
    // Orange to yellow
    const r = 239
    const g = Math.round(168 + ((score - 0.4) / 0.3) * 87)
    const b = 68
    return `rgb(${r}, ${g}, ${b})`
  } else {
    // Yellow to green
    const r = Math.round(239 - ((score - 0.7) / 0.3) * 205)
    const g = Math.round(255 - ((score - 0.7) / 0.3) * 50)
    const b = Math.round(68 + ((score - 0.7) / 0.3) * 60)
    return `rgb(${r}, ${g}, ${b})`
  }
}

export function GlobeVisualization({
  countries,
  selectedBudget,
  portfolioValue,
  withdrawalRate,
  onCountryClick,
  focusedCountry,
}: GlobeVisualizationProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)

  // Calculate feasibility score for each country (0-1)
  const countryData = useMemo(() => {
    const sgdToUsd = 0.74
    const portfolioInUSD = portfolioValue * sgdToUsd
    void withdrawalRate // Kept for interface compatibility

    return countries.map((country) => {
      const countryCost = country.costOfLiving.total[selectedBudget]
      const annualCost = countryCost * 12
      
      // Calculate years of runway: total portfolio / annual spending
      const yearsRunway = portfolioInUSD / annualCost
      
      // Score based on years of runway (25+ years = fully affordable)
      // 0 years = 0, 25+ years = 1
      const score = Math.min(yearsRunway / 25, 1)
      
      return {
        ...country,
        score,
        yearsRunway,
        affordable: yearsRunway >= 25,
        color: getColorForScore(score),
        size: score * 0.8 + 0.3, // Size based on affordability
      }
    })
  }, [countries, selectedBudget, portfolioValue, withdrawalRate])

  // Initial view centered on Singapore
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: SINGAPORE.lat, lng: SINGAPORE.lng, altitude: 2.5 }, 0)
    }
  }, [])

  // Focus on country when selected
  useEffect(() => {
    if (globeRef.current && focusedCountry) {
      globeRef.current.pointOfView(
        { 
          lat: focusedCountry.coordinates.lat, 
          lng: focusedCountry.coordinates.lng, 
          altitude: 1.5 
        }, 
        1000
      )
    }
  }, [focusedCountry])

  const handlePointClick = useCallback((point: object) => {
    const p = point as { id?: string }
    if (p.id) {
      const country = countries.find(c => c.id === p.id)
      if (country) {
        onCountryClick(country)
      }
    }
  }, [countries, onCountryClick])

  // Points data for the globe
  const pointsData = useMemo(() => {
    return countryData.map((c) => ({
      id: c.id,
      lat: c.coordinates.lat,
      lng: c.coordinates.lng,
      size: c.size,
      color: c.color,
      label: `${c.flag} ${c.name}`,
      yearsRunway: c.yearsRunway,
      affordable: c.affordable,
    }))
  }, [countryData])

  // Arcs from Singapore to each country
  const arcsData = useMemo(() => {
    return countryData.map((c) => ({
      startLat: SINGAPORE.lat,
      startLng: SINGAPORE.lng,
      endLat: c.coordinates.lat,
      endLng: c.coordinates.lng,
      color: c.color,
      stroke: c.affordable ? 1.5 : 0.5,
    }))
  }, [countryData])

  return (
    <div className="relative w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Points (countries)
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointLabel={(obj: object) => {
          const d = obj as { label: string; yearsRunway: number; affordable: boolean }
          return `
          <div class="bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg text-sm">
            <div class="font-bold text-gray-900">${d.label}</div>
            <div class="text-gray-600">
              ${d.yearsRunway >= 100 ? '∞' : Math.round(d.yearsRunway)} years runway
            </div>
            <div class="${d.affordable ? 'text-green-600' : 'text-red-600'} font-medium">
              ${d.affordable ? '✓ Affordable' : '✗ Over budget'}
            </div>
          </div>
        `}}
        onPointClick={handlePointClick}
        
        // Arcs from Singapore
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke="stroke"
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcAltitudeAutoScale={0.3}
        
        // Atmosphere
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
        
        // Settings
        enablePointerInteraction={true}
        width={undefined}
        height={500}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
        <div className="text-xs font-medium text-gray-700 mb-2">Affordability</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">High</span>
          </div>
        </div>
      </div>

      {/* Singapore marker label */}
      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
        🇸🇬 Starting from Singapore
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg">
        <div className="text-xs text-gray-600">
          🖱️ Drag to rotate • Scroll to zoom • Click markers for details
        </div>
      </div>
    </div>
  )
}
