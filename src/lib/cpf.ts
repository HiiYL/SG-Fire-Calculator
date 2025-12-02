// CPF Interest Rates (as of 2024)
export const CPF_RATES = {
  OA: 0.025, // 2.5% for Ordinary Account
  SA: 0.04, // 4.0% for Special Account
  MA: 0.04, // 4.0% for Medisave Account
  RA: 0.04, // 4.0% for Retirement Account (after 55)
  // Extra 1% on first $60K combined, extra 2% on first $30K for 55+
  EXTRA_FIRST_60K: 0.01,
  EXTRA_55_PLUS_FIRST_30K: 0.01,
}

// CPF Contribution Rates (Employee + Employer) for age ≤55
export const CPF_CONTRIBUTION_RATES = {
  // Age 55 and below
  UNDER_55: {
    total: 0.37, // 37% total (20% employee + 17% employer)
    employee: 0.20,
    employer: 0.17,
    allocation: {
      OA: 0.6217, // 23% of 37%
      SA: 0.1622, // 6% of 37%
      MA: 0.2162, // 8% of 37%
    },
  },
  // Age 55-60
  AGE_55_60: {
    total: 0.295,
    employee: 0.15,
    employer: 0.145,
    allocation: {
      OA: 0.4068,
      SA: 0.2373,
      MA: 0.3559,
    },
  },
  // Age 60-65
  AGE_60_65: {
    total: 0.205,
    employee: 0.095,
    employer: 0.11,
    allocation: {
      OA: 0.1463,
      SA: 0.3902,
      MA: 0.4634,
    },
  },
  // Age 65-70
  AGE_65_70: {
    total: 0.155,
    employee: 0.075,
    employer: 0.08,
    allocation: {
      OA: 0.0645,
      SA: 0.4516,
      MA: 0.4839,
    },
  },
}

// CPF Limits
export const CPF_LIMITS = {
  OA_WAGE_CEILING: 6800, // Monthly ordinary wage ceiling
  ANNUAL_LIMIT: 37740, // Annual CPF contribution limit
  BHS_2024: 68500, // Basic Healthcare Sum 2024
  FRS_2024: 205800, // Full Retirement Sum 2024
  BRS_2024: 102900, // Basic Retirement Sum 2024
  ERS_2024: 308700, // Enhanced Retirement Sum 2024
}

export interface CPFBalances {
  OA: number
  SA: number
  MA: number
  total: number
}

export interface CPFProjection {
  age: number
  year: number
  OA: number
  SA: number
  MA: number
  RA: number
  total: number
  contributions: number
  interest: number
}

// Calculate CPF contribution based on age and salary
export function calculateCPFContribution(
  monthlySalary: number,
  age: number
): { OA: number; SA: number; MA: number; total: number } {
  const cappedSalary = Math.min(monthlySalary, CPF_LIMITS.OA_WAGE_CEILING)

  let rates: (typeof CPF_CONTRIBUTION_RATES)["UNDER_55"]
  if (age <= 55) {
    rates = CPF_CONTRIBUTION_RATES.UNDER_55
  } else if (age <= 60) {
    rates = CPF_CONTRIBUTION_RATES.AGE_55_60
  } else if (age <= 65) {
    rates = CPF_CONTRIBUTION_RATES.AGE_60_65
  } else {
    rates = CPF_CONTRIBUTION_RATES.AGE_65_70
  }

  const totalContribution = cappedSalary * rates.total

  return {
    OA: totalContribution * rates.allocation.OA,
    SA: totalContribution * rates.allocation.SA,
    MA: totalContribution * rates.allocation.MA,
    total: totalContribution,
  }
}

// Calculate interest with extra interest on first $60K
export function calculateCPFInterest(
  balances: CPFBalances,
  age: number
): { OA: number; SA: number; MA: number; total: number } {
  // Base interest
  let oaInterest = balances.OA * CPF_RATES.OA
  let saInterest = balances.SA * CPF_RATES.SA
  let maInterest = balances.MA * CPF_RATES.MA

  // Extra 1% on first $60K (OA capped at $20K for extra interest)
  const oaForExtra = Math.min(balances.OA, 20000)
  const remainingFor60K = 60000 - oaForExtra
  const samaForExtra = Math.min(balances.SA + balances.MA, remainingFor60K)

  // Allocate extra interest proportionally to SA and MA
  const saRatio =
    balances.SA + balances.MA > 0
      ? balances.SA / (balances.SA + balances.MA)
      : 0.5
  const saExtra = samaForExtra * saRatio
  const maExtra = samaForExtra * (1 - saRatio)

  oaInterest += oaForExtra * CPF_RATES.EXTRA_FIRST_60K
  saInterest += saExtra * CPF_RATES.EXTRA_FIRST_60K
  maInterest += maExtra * CPF_RATES.EXTRA_FIRST_60K

  // Extra 1% on first $30K for age 55+
  if (age >= 55) {
    const oaFor30K = Math.min(balances.OA, 30000)
    const remainingFor30K = 30000 - oaFor30K
    const samaFor30K = Math.min(balances.SA + balances.MA, remainingFor30K)

    const saExtra30K = samaFor30K * saRatio
    const maExtra30K = samaFor30K * (1 - saRatio)

    oaInterest += oaFor30K * CPF_RATES.EXTRA_55_PLUS_FIRST_30K
    saInterest += saExtra30K * CPF_RATES.EXTRA_55_PLUS_FIRST_30K
    maInterest += maExtra30K * CPF_RATES.EXTRA_55_PLUS_FIRST_30K
  }

  return {
    OA: oaInterest,
    SA: saInterest,
    MA: maInterest,
    total: oaInterest + saInterest + maInterest,
  }
}

// Project CPF growth over time
export function projectCPF(
  currentBalances: CPFBalances,
  monthlySalary: number,
  currentAge: number,
  yearsToProject: number,
  stopContributionsAtAge: number = 55 // When you stop working
): CPFProjection[] {
  const projections: CPFProjection[] = []

  let OA = currentBalances.OA
  let SA = currentBalances.SA
  let MA = currentBalances.MA
  let RA = 0

  for (let year = 0; year <= yearsToProject; year++) {
    const age = currentAge + year

    // Calculate annual contributions (if still working)
    let annualContributions = { OA: 0, SA: 0, MA: 0, total: 0 }
    if (age < stopContributionsAtAge) {
      const monthlyContrib = calculateCPFContribution(monthlySalary, age)
      annualContributions = {
        OA: monthlyContrib.OA * 12,
        SA: monthlyContrib.SA * 12,
        MA: monthlyContrib.MA * 12,
        total: monthlyContrib.total * 12,
      }
    }

    // At age 55, SA transfers to RA (simplified)
    if (age === 55 && year > 0) {
      RA = SA
      SA = 0
    }

    // Calculate interest
    const balances: CPFBalances = { OA, SA, MA, total: OA + SA + MA }
    const interest = calculateCPFInterest(balances, age)

    // Record projection before adding this year's growth
    projections.push({
      age,
      year,
      OA: Math.round(OA),
      SA: Math.round(SA),
      MA: Math.round(MA),
      RA: Math.round(RA),
      total: Math.round(OA + SA + MA + RA),
      contributions: Math.round(annualContributions.total),
      interest: Math.round(interest.total),
    })

    // Add contributions and interest for next year
    OA += annualContributions.OA + interest.OA
    SA += annualContributions.SA + interest.SA
    MA += annualContributions.MA + interest.MA
    if (age >= 55) {
      RA += RA * CPF_RATES.RA // RA earns 4%
    }
  }

  return projections
}

// Calculate effective interest rate for combined CPF
export function getEffectiveCPFRate(balances: CPFBalances, age: number): number {
  const interest = calculateCPFInterest(balances, age)
  return balances.total > 0 ? interest.total / balances.total : 0.04
}

// Estimate CPF LIFE monthly payout (simplified)
export function estimateCPFLifePayout(raBalance: number): {
  standard: number
  basic: number
  escalating: number
} {
  // Rough estimates based on CPF LIFE calculator
  // These are approximations - actual payouts depend on many factors
  const standardRate = 0.0055 // ~$550 per $100K
  const basicRate = 0.0048
  const escalatingRate = 0.0045

  return {
    standard: Math.round(raBalance * standardRate),
    basic: Math.round(raBalance * basicRate),
    escalating: Math.round(raBalance * escalatingRate),
  }
}
