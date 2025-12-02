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

// Historical S&P 500 annual returns (1928-2023) - total return including dividends
// Source: NYU Stern, Damodaran dataset
const HISTORICAL_RETURNS: number[] = [
  0.4381,  // 1928
  -0.0830, // 1929
  -0.2512, // 1930
  -0.4384, // 1931
  -0.0864, // 1932
  0.4998,  // 1933
  -0.0119, // 1934
  0.4674,  // 1935
  0.3194,  // 1936
  -0.3534, // 1937
  0.2928,  // 1938
  -0.0110, // 1939
  -0.1067, // 1940
  -0.1277, // 1941
  0.1917,  // 1942
  0.2506,  // 1943
  0.1903,  // 1944
  0.3582,  // 1945
  -0.0843, // 1946
  0.0520,  // 1947
  0.0570,  // 1948
  0.1830,  // 1949
  0.3081,  // 1950
  0.2368,  // 1951
  0.1815,  // 1952
  -0.0121, // 1953
  0.5256,  // 1954
  0.3260,  // 1955
  0.0744,  // 1956
  -0.1046, // 1957
  0.4372,  // 1958
  0.1206,  // 1959
  0.0034,  // 1960
  0.2664,  // 1961
  -0.0881, // 1962
  0.2261,  // 1963
  0.1642,  // 1964
  0.1240,  // 1965
  -0.0997, // 1966
  0.2380,  // 1967
  0.1081,  // 1968
  -0.0824, // 1969
  0.0356,  // 1970
  0.1422,  // 1971
  0.1876,  // 1972
  -0.1431, // 1973
  -0.2590, // 1974
  0.3700,  // 1975
  0.2383,  // 1976
  -0.0698, // 1977
  0.0651,  // 1978
  0.1852,  // 1979
  0.3174,  // 1980
  -0.0470, // 1981
  0.2042,  // 1982
  0.2234,  // 1983
  0.0615,  // 1984
  0.3124,  // 1985
  0.1849,  // 1986
  0.0581,  // 1987
  0.1654,  // 1988
  0.3148,  // 1989
  -0.0306, // 1990
  0.3023,  // 1991
  0.0749,  // 1992
  0.0997,  // 1993
  0.0133,  // 1994
  0.3720,  // 1995
  0.2268,  // 1996
  0.3310,  // 1997
  0.2834,  // 1998
  0.2089,  // 1999
  -0.0903, // 2000
  -0.1185, // 2001
  -0.2197, // 2002
  0.2836,  // 2003
  0.1074,  // 2004
  0.0483,  // 2005
  0.1561,  // 2006
  0.0548,  // 2007
  -0.3655, // 2008
  0.2594,  // 2009
  0.1482,  // 2010
  0.0210,  // 2011
  0.1589,  // 2012
  0.3215,  // 2013
  0.1352,  // 2014
  0.0138,  // 2015
  0.1177,  // 2016
  0.2161,  // 2017
  -0.0423, // 2018
  0.3121,  // 2019
  0.1840,  // 2020
  0.2847,  // 2021
  -0.1811, // 2022
  0.2606,  // 2023
]

// Historical inflation rates (1928-2023)
const HISTORICAL_INFLATION: number[] = [
  -0.0116, // 1928
  0.0058,  // 1929
  -0.0640, // 1930
  -0.0932, // 1931
  -0.1027, // 1932
  0.0076,  // 1933
  0.0199,  // 1934
  0.0299,  // 1935
  0.0121,  // 1936
  0.0241,  // 1937
  -0.0178, // 1938
  0.0000,  // 1939
  0.0096,  // 1940
  0.0993,  // 1941
  0.0929,  // 1942
  0.0316,  // 1943
  0.0211,  // 1944
  0.0225,  // 1945
  0.1802,  // 1946
  0.0888,  // 1947
  0.0271,  // 1948
  -0.0180, // 1949
  0.0579,  // 1950
  0.0587,  // 1951
  0.0088,  // 1952
  0.0062,  // 1953
  -0.0074, // 1954
  0.0037,  // 1955
  0.0286,  // 1956
  0.0302,  // 1957
  0.0176,  // 1958
  0.0150,  // 1959
  0.0148,  // 1960
  0.0067,  // 1961
  0.0122,  // 1962
  0.0165,  // 1963
  0.0097,  // 1964
  0.0192,  // 1965
  0.0335,  // 1966
  0.0304,  // 1967
  0.0472,  // 1968
  0.0611,  // 1969
  0.0549,  // 1970
  0.0336,  // 1971
  0.0341,  // 1972
  0.0880,  // 1973
  0.1220,  // 1974
  0.0701,  // 1975
  0.0481,  // 1976
  0.0677,  // 1977
  0.0903,  // 1978
  0.1331,  // 1979
  0.1240,  // 1980
  0.0894,  // 1981
  0.0387,  // 1982
  0.0380,  // 1983
  0.0395,  // 1984
  0.0377,  // 1985
  0.0113,  // 1986
  0.0441,  // 1987
  0.0442,  // 1988
  0.0465,  // 1989
  0.0612,  // 1990
  0.0306,  // 1991
  0.0290,  // 1992
  0.0275,  // 1993
  0.0267,  // 1994
  0.0254,  // 1995
  0.0332,  // 1996
  0.0170,  // 1997
  0.0161,  // 1998
  0.0268,  // 1999
  0.0339,  // 2000
  0.0155,  // 2001
  0.0238,  // 2002
  0.0188,  // 2003
  0.0326,  // 2004
  0.0342,  // 2005
  0.0254,  // 2006
  0.0408,  // 2007
  0.0009,  // 2008
  0.0272,  // 2009
  0.0150,  // 2010
  0.0296,  // 2011
  0.0174,  // 2012
  0.0150,  // 2013
  0.0076,  // 2014
  0.0073,  // 2015
  0.0207,  // 2016
  0.0211,  // 2017
  0.0191,  // 2018
  0.0231,  // 2019
  0.0123,  // 2020
  0.0700,  // 2021
  0.0650,  // 2022
  0.0340,  // 2023
]

export interface HistoricalSequence {
  startYear: number
  endYear: number
  finalValue: number
  lowestValue: number
  lowestYear: number
  survived: boolean
  yearsDepleted: number | null
  realReturns: number[] // inflation-adjusted returns for this sequence
}

export interface HistoricalBacktestResult {
  sequences: HistoricalSequence[]
  successRate: number
  worstSequence: HistoricalSequence
  bestSequence: HistoricalSequence
  medianFinalValue: number
  averageFinalValue: number
  percentSurvived30Years: number
}

// Run historical backtesting using actual market data
export function runHistoricalBacktest(
  inputs: PortfolioInputs,
  currentAge: number,
  retirementYears: number = 30
): HistoricalBacktestResult {
  const sequences: HistoricalSequence[] = []
  const totalYearsNeeded = inputs.yearsToRetirement + retirementYears
  
  // Test every possible starting year that has enough data
  const maxStartYear = HISTORICAL_RETURNS.length - totalYearsNeeded
  
  for (let startIdx = 0; startIdx < maxStartYear; startIdx++) {
    const startYear = 1928 + startIdx
    let portfolio = inputs.currentSavings
    let lowestValue = portfolio
    let lowestYear = startYear
    let yearsDepleted: number | null = null
    const realReturns: number[] = []
    
    // Accumulation phase
    for (let year = 0; year < inputs.yearsToRetirement; year++) {
      const returnIdx = startIdx + year
      const nominalReturn = HISTORICAL_RETURNS[returnIdx]
      const inflation = HISTORICAL_INFLATION[returnIdx]
      const realReturn = (1 + nominalReturn) / (1 + inflation) - 1
      realReturns.push(realReturn)
      
      portfolio = portfolio * (1 + nominalReturn) + inputs.monthlyContribution * 12
      
      if (portfolio < lowestValue) {
        lowestValue = portfolio
        lowestYear = startYear + year
      }
    }
    
    // Retirement phase - use actual withdrawal rate from portfolio at retirement
    let withdrawal = portfolio * inputs.withdrawalRate
    
    for (let year = 0; year < retirementYears; year++) {
      const returnIdx = startIdx + inputs.yearsToRetirement + year
      if (returnIdx >= HISTORICAL_RETURNS.length) break
      
      const nominalReturn = HISTORICAL_RETURNS[returnIdx]
      const inflation = HISTORICAL_INFLATION[returnIdx]
      const realReturn = (1 + nominalReturn) / (1 + inflation) - 1
      realReturns.push(realReturn)
      
      portfolio = portfolio * (1 + nominalReturn) - withdrawal
      withdrawal *= (1 + inflation) // Inflation-adjusted withdrawal
      
      if (portfolio < lowestValue && portfolio > 0) {
        lowestValue = portfolio
        lowestYear = startYear + inputs.yearsToRetirement + year
      }
      
      if (portfolio <= 0 && yearsDepleted === null) {
        yearsDepleted = year
        portfolio = 0
      }
    }
    
    sequences.push({
      startYear,
      endYear: startYear + totalYearsNeeded - 1,
      finalValue: Math.max(0, portfolio),
      lowestValue: Math.max(0, lowestValue),
      lowestYear,
      survived: portfolio > 0,
      yearsDepleted,
      realReturns,
    })
  }
  
  const survivedSequences = sequences.filter(s => s.survived)
  const successRate = survivedSequences.length / sequences.length
  
  const sortedByFinal = [...sequences].sort((a, b) => a.finalValue - b.finalValue)
  const worstSequence = sortedByFinal[0]
  const bestSequence = sortedByFinal[sortedByFinal.length - 1]
  
  const finalValues = sequences.map(s => s.finalValue).sort((a, b) => a - b)
  const medianFinalValue = finalValues[Math.floor(finalValues.length / 2)]
  const averageFinalValue = finalValues.reduce((a, b) => a + b, 0) / finalValues.length
  
  return {
    sequences,
    successRate,
    worstSequence,
    bestSequence,
    medianFinalValue,
    averageFinalValue,
    percentSurvived30Years: successRate,
  }
}

// Get notable historical periods for display
export function getNotableHistoricalPeriods(): { name: string; startYear: number; description: string }[] {
  return [
    { name: "Great Depression", startYear: 1929, description: "Worst market crash in history" },
    { name: "Post-WWII Boom", startYear: 1945, description: "Strong economic growth period" },
    { name: "Stagflation Era", startYear: 1966, description: "High inflation, poor returns" },
    { name: "1970s Oil Crisis", startYear: 1973, description: "Severe bear market + inflation" },
    { name: "1980s Bull Run", startYear: 1982, description: "Start of major bull market" },
    { name: "Dot-com Bubble", startYear: 2000, description: "Tech crash + lost decade" },
    { name: "Global Financial Crisis", startYear: 2007, description: "Housing crash, bank failures" },
  ]
}
