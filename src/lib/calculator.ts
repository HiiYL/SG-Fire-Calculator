export interface PortfolioInputs {
  currentSavings: number // in SGD
  monthlyContribution: number // in SGD
  yearsToRetirement: number
  expectedReturn: number // annual, e.g., 0.07 for 7%
  inflationRate: number // annual, e.g., 0.03 for 3%
  withdrawalRate: number // e.g., 0.04 for 4%
}

export interface SimulationResult {
  year: number
  age: number
  portfolioValue: number
  contribution: number
  returns: number
  withdrawal: number
  inflationAdjustedValue: number
}

export interface FIREResult {
  portfolioAtRetirement: number
  annualWithdrawal: number
  monthlyWithdrawal: number
  yearsOfRunway: number
  projections: SimulationResult[]
  successProbability: number
  fireNumber: number
}

export interface MonteCarloResult {
  percentile5: number[]
  percentile25: number[]
  percentile50: number[]
  percentile75: number[]
  percentile95: number[]
  successRate: number
  medianEndValue: number
  years: number[]
}

// Calculate portfolio growth during accumulation phase
export function calculateAccumulation(
  inputs: PortfolioInputs,
  currentAge: number
): SimulationResult[] {
  const results: SimulationResult[] = []
  let portfolioValue = inputs.currentSavings
  let cumulativeInflation = 1

  for (let year = 0; year <= inputs.yearsToRetirement; year++) {
    const age = currentAge + year
    const contribution = year === 0 ? 0 : inputs.monthlyContribution * 12
    const returns = portfolioValue * inputs.expectedReturn
    
    cumulativeInflation *= (1 + inputs.inflationRate)
    
    results.push({
      year,
      age,
      portfolioValue,
      contribution,
      returns,
      withdrawal: 0,
      inflationAdjustedValue: portfolioValue / cumulativeInflation,
    })

    portfolioValue = portfolioValue + contribution + returns
  }

  return results
}

// Calculate portfolio during retirement (drawdown phase)
export function calculateDrawdown(
  startingPortfolio: number,
  annualWithdrawal: number,
  expectedReturn: number,
  inflationRate: number,
  years: number,
  startAge: number
): SimulationResult[] {
  const results: SimulationResult[] = []
  let portfolioValue = startingPortfolio
  let currentWithdrawal = annualWithdrawal
  let cumulativeInflation = 1

  for (let year = 0; year <= years; year++) {
    const age = startAge + year
    const returns = portfolioValue * expectedReturn
    const withdrawal = year === 0 ? 0 : currentWithdrawal

    cumulativeInflation *= (1 + inflationRate)

    results.push({
      year,
      age,
      portfolioValue: Math.max(0, portfolioValue),
      contribution: 0,
      returns: portfolioValue > 0 ? returns : 0,
      withdrawal,
      inflationAdjustedValue: Math.max(0, portfolioValue) / cumulativeInflation,
    })

    portfolioValue = portfolioValue + returns - withdrawal
    currentWithdrawal *= (1 + inflationRate) // Inflation-adjusted withdrawal

    if (portfolioValue <= 0) {
      // Portfolio depleted
      for (let remaining = year + 1; remaining <= years; remaining++) {
        results.push({
          year: remaining,
          age: startAge + remaining,
          portfolioValue: 0,
          contribution: 0,
          returns: 0,
          withdrawal: 0,
          inflationAdjustedValue: 0,
        })
      }
      break
    }
  }

  return results
}

// Main FIRE calculation
export function calculateFIRE(
  inputs: PortfolioInputs,
  currentAge: number,
  monthlyExpenses: number, // in retirement destination currency (USD)
  retirementYears: number = 40
): FIREResult {
  const accumulationResults = calculateAccumulation(inputs, currentAge)
  const portfolioAtRetirement = accumulationResults[accumulationResults.length - 1].portfolioValue

  const annualExpenses = monthlyExpenses * 12
  const fireNumber = annualExpenses / inputs.withdrawalRate
  const annualWithdrawal = portfolioAtRetirement * inputs.withdrawalRate
  const monthlyWithdrawal = annualWithdrawal / 12

  const retirementAge = currentAge + inputs.yearsToRetirement
  const drawdownResults = calculateDrawdown(
    portfolioAtRetirement,
    annualWithdrawal,
    inputs.expectedReturn - 0.01, // Slightly lower returns in retirement
    inputs.inflationRate,
    retirementYears,
    retirementAge
  )

  // Calculate years until portfolio depletes
  const depletionYear = drawdownResults.findIndex(r => r.portfolioValue <= 0)
  const yearsOfRunway = depletionYear === -1 ? retirementYears : depletionYear

  // Simple success probability based on whether portfolio lasts
  const successProbability = portfolioAtRetirement >= fireNumber ? 0.95 : 
    (portfolioAtRetirement / fireNumber) * 0.8

  return {
    portfolioAtRetirement,
    annualWithdrawal,
    monthlyWithdrawal,
    yearsOfRunway,
    projections: [...accumulationResults, ...drawdownResults.slice(1)],
    successProbability: Math.min(successProbability, 0.99),
    fireNumber,
  }
}

// Monte Carlo simulation for more realistic projections
export function runMonteCarloSimulation(
  inputs: PortfolioInputs,
  currentAge: number,
  monthlyExpenses: number,
  simulations: number = 1000,
  retirementYears: number = 40
): MonteCarloResult {
  const allResults: number[][] = []
  const volatility = 0.15 // Standard deviation of returns
  let successCount = 0

  for (let sim = 0; sim < simulations; sim++) {
    const yearlyValues: number[] = []
    let portfolio = inputs.currentSavings

    // Accumulation phase
    for (let year = 0; year < inputs.yearsToRetirement; year++) {
      const randomReturn = inputs.expectedReturn + (Math.random() - 0.5) * 2 * volatility
      portfolio = portfolio * (1 + randomReturn) + inputs.monthlyContribution * 12
      yearlyValues.push(portfolio)
    }

    // Retirement phase
    let withdrawal = portfolio * inputs.withdrawalRate
    for (let year = 0; year < retirementYears; year++) {
      const randomReturn = (inputs.expectedReturn - 0.01) + (Math.random() - 0.5) * 2 * volatility
      portfolio = portfolio * (1 + randomReturn) - withdrawal
      withdrawal *= (1 + inputs.inflationRate)
      yearlyValues.push(Math.max(0, portfolio))
    }

    allResults.push(yearlyValues)
    if (yearlyValues[yearlyValues.length - 1] > 0) {
      successCount++
    }
  }

  // Calculate percentiles
  const totalYears = inputs.yearsToRetirement + retirementYears
  const percentile5: number[] = []
  const percentile25: number[] = []
  const percentile50: number[] = []
  const percentile75: number[] = []
  const percentile95: number[] = []
  const years: number[] = []

  for (let year = 0; year < totalYears; year++) {
    const valuesAtYear = allResults.map(r => r[year]).sort((a, b) => a - b)
    years.push(currentAge + year + 1)
    percentile5.push(valuesAtYear[Math.floor(simulations * 0.05)])
    percentile25.push(valuesAtYear[Math.floor(simulations * 0.25)])
    percentile50.push(valuesAtYear[Math.floor(simulations * 0.50)])
    percentile75.push(valuesAtYear[Math.floor(simulations * 0.75)])
    percentile95.push(valuesAtYear[Math.floor(simulations * 0.95)])
  }

  const endValues = allResults.map(r => r[r.length - 1]).sort((a, b) => a - b)

  return {
    percentile5,
    percentile25,
    percentile50,
    percentile75,
    percentile95,
    successRate: successCount / simulations,
    medianEndValue: endValues[Math.floor(simulations * 0.5)],
    years,
  }
}

// Calculate how much monthly budget you can afford in different countries
export function calculateAffordableBudget(
  portfolioValue: number,
  withdrawalRate: number
): { monthly: number; annual: number } {
  const annualWithdrawalSGD = portfolioValue * withdrawalRate
  const monthlyWithdrawalSGD = annualWithdrawalSGD / 12
  
  // Convert to USD (assuming costs are in USD)
  const sgdToUsd = 0.74 // Approximate
  const monthlyUSD = monthlyWithdrawalSGD * sgdToUsd

  return {
    monthly: monthlyUSD,
    annual: monthlyUSD * 12,
  }
}

// Calculate FIRE number for a specific monthly expense
export function calculateFIRENumber(
  monthlyExpenses: number, // in USD
  withdrawalRate: number
): number {
  const annualExpenses = monthlyExpenses * 12
  const sgdToUsd = 0.74
  return (annualExpenses / withdrawalRate) / sgdToUsd // Return in SGD
}
