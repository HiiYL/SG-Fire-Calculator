export interface Country {
  id: string
  name: string
  flag: string
  region: string
  currency: string
  exchangeRate: number // vs SGD
  costOfLiving: CostOfLiving
  visa: VisaInfo
  lifestyle: LifestyleInfo
  pros: string[]
  cons: string[]
  popularCities: City[]
}

export interface CostOfLiving {
  rentStudio: number // USD/month
  rent1Bed: number
  rent2Bed: number
  utilities: number
  groceries: number
  diningOut: number
  transportation: number
  healthcare: number
  entertainment: number
  total: {
    frugal: number
    moderate: number
    comfortable: number
  }
}

export interface VisaInfo {
  type: string
  maxStay: string
  requirements: string[]
  renewability: string
  pathToResidency: string
  workAllowed: boolean
  notes: string
}

export interface LifestyleInfo {
  climate: string
  language: string[]
  englishFriendly: number // 1-5
  safety: number // 1-5
  healthcare: number // 1-5
  internetSpeed: number // Mbps average
  timezone: string
  flightFromSG: string
}

export interface City {
  name: string
  description: string
  monthlyBudget: {
    frugal: number
    moderate: number
    comfortable: number
  }
}

export const countries: Country[] = [
  {
    id: 'malaysia',
    name: 'Malaysia',
    flag: '🇲🇾',
    region: 'Southeast Asia',
    currency: 'MYR',
    exchangeRate: 0.30, // 1 MYR = 0.30 SGD
    costOfLiving: {
      rentStudio: 300,
      rent1Bed: 450,
      rent2Bed: 700,
      utilities: 50,
      groceries: 200,
      diningOut: 150,
      transportation: 80,
      healthcare: 50,
      entertainment: 100,
      total: {
        frugal: 1000,
        moderate: 1500,
        comfortable: 2500,
      },
    },
    visa: {
      type: 'MM2H (Malaysia My Second Home)',
      maxStay: '5-year renewable visa',
      requirements: [
        'Fixed deposit: RM 1M (under 50) or RM 500K (50+)',
        'Offshore income: RM 40K/month or RM 500K liquid assets',
        'Health insurance required',
        'Medical checkup',
      ],
      renewability: 'Renewable every 5 years',
      pathToResidency: 'No direct path to PR, but long-term stay possible',
      workAllowed: false,
      notes: 'Program was revised in 2021 with stricter requirements. Consider Sarawak MM2H as alternative with lower requirements.',
    },
    lifestyle: {
      climate: 'Tropical, hot and humid year-round',
      language: ['Malay', 'English', 'Chinese', 'Tamil'],
      englishFriendly: 5,
      safety: 4,
      healthcare: 4,
      internetSpeed: 100,
      timezone: 'UTC+8 (same as Singapore)',
      flightFromSG: '1 hour to KL',
    },
    pros: [
      'Same timezone as Singapore',
      'Excellent English proficiency',
      'Familiar food and culture',
      'Low cost of living',
      'Great healthcare at affordable prices',
      'Easy to visit Singapore',
    ],
    cons: [
      'MM2H requirements increased significantly',
      'Hot and humid climate',
      'Traffic congestion in major cities',
      'Air quality issues (haze season)',
    ],
    popularCities: [
      {
        name: 'Penang',
        description: 'Food paradise, heritage charm, expat-friendly',
        monthlyBudget: { frugal: 1200, moderate: 1800, comfortable: 3000 },
      },
      {
        name: 'Kuala Lumpur',
        description: 'Modern city, great infrastructure, diverse culture',
        monthlyBudget: { frugal: 1400, moderate: 2000, comfortable: 3500 },
      },
      {
        name: 'Ipoh',
        description: 'Quiet town, amazing food, very affordable',
        monthlyBudget: { frugal: 900, moderate: 1400, comfortable: 2200 },
      },
      {
        name: 'Johor Bahru',
        description: 'Close to Singapore, developing rapidly',
        monthlyBudget: { frugal: 1100, moderate: 1700, comfortable: 2800 },
      },
    ],
  },
  {
    id: 'taiwan',
    name: 'Taiwan',
    flag: '🇹🇼',
    region: 'East Asia',
    currency: 'TWD',
    exchangeRate: 0.043, // 1 TWD = 0.043 SGD
    costOfLiving: {
      rentStudio: 400,
      rent1Bed: 600,
      rent2Bed: 900,
      utilities: 60,
      groceries: 250,
      diningOut: 200,
      transportation: 60,
      healthcare: 80,
      entertainment: 120,
      total: {
        frugal: 1200,
        moderate: 1800,
        comfortable: 3000,
      },
    },
    visa: {
      type: 'Entrepreneur Visa / Gold Card',
      maxStay: '1-3 years',
      requirements: [
        'Gold Card: Expertise in specific fields OR salary > TWD 160K/month',
        'Entrepreneur Visa: Business plan + TWD 600K capital',
        'Retirement visa not readily available',
      ],
      renewability: 'Gold Card renewable, Entrepreneur visa extendable',
      pathToResidency: 'APRC after 5 years of legal residence',
      workAllowed: true,
      notes: 'No traditional retirement visa. Gold Card is best option for high earners. Consider digital nomad arrangements.',
    },
    lifestyle: {
      climate: 'Subtropical, mild winters, hot summers',
      language: ['Mandarin', 'Taiwanese Hokkien'],
      englishFriendly: 3,
      safety: 5,
      healthcare: 5,
      internetSpeed: 135,
      timezone: 'UTC+8 (same as Singapore)',
      flightFromSG: '4.5 hours',
    },
    pros: [
      'Excellent healthcare (NHI system)',
      'Very safe country',
      'Great public transportation',
      'Rich culture and food scene',
      'Same timezone as Singapore',
      'Beautiful nature and mountains',
    ],
    cons: [
      'Limited retirement visa options',
      'Mandarin essential outside Taipei',
      'Earthquake and typhoon prone',
      'Summer can be very hot and humid',
    ],
    popularCities: [
      {
        name: 'Taipei',
        description: 'Capital city, most expat-friendly, excellent MRT',
        monthlyBudget: { frugal: 1500, moderate: 2200, comfortable: 3500 },
      },
      {
        name: 'Taichung',
        description: 'Pleasant climate, more affordable, growing city',
        monthlyBudget: { frugal: 1200, moderate: 1700, comfortable: 2800 },
      },
      {
        name: 'Tainan',
        description: 'Historic city, food capital, very affordable',
        monthlyBudget: { frugal: 1000, moderate: 1500, comfortable: 2500 },
      },
      {
        name: 'Kaohsiung',
        description: 'Port city, warm weather, improving rapidly',
        monthlyBudget: { frugal: 1100, moderate: 1600, comfortable: 2600 },
      },
    ],
  },
  {
    id: 'thailand',
    name: 'Thailand',
    flag: '🇹🇭',
    region: 'Southeast Asia',
    currency: 'THB',
    exchangeRate: 0.039, // 1 THB = 0.039 SGD
    costOfLiving: {
      rentStudio: 350,
      rent1Bed: 500,
      rent2Bed: 800,
      utilities: 70,
      groceries: 200,
      diningOut: 150,
      transportation: 50,
      healthcare: 60,
      entertainment: 100,
      total: {
        frugal: 1000,
        moderate: 1600,
        comfortable: 2800,
      },
    },
    visa: {
      type: 'LTR (Long-Term Resident) / Retirement Visa',
      maxStay: '10 years (LTR) / 1 year (Retirement)',
      requirements: [
        'Retirement Visa (O-A): Age 50+, THB 800K in bank OR THB 65K/month income',
        'LTR Wealthy Pensioner: $80K/year pension OR $1M assets',
        'LTR Wealthy Global Citizen: $1M assets + $80K/year income',
        'Health insurance required',
      ],
      renewability: 'Retirement visa: annual renewal. LTR: 10 years',
      pathToResidency: 'Possible after 3+ years, but difficult',
      workAllowed: false,
      notes: 'New LTR visa (2022) offers 10-year stay with tax benefits. Traditional retirement visa requires 90-day reporting.',
    },
    lifestyle: {
      climate: 'Tropical, hot year-round, monsoon season',
      language: ['Thai'],
      englishFriendly: 3,
      safety: 4,
      healthcare: 4,
      internetSpeed: 200,
      timezone: 'UTC+7 (1 hour behind Singapore)',
      flightFromSG: '2 hours to Bangkok',
    },
    pros: [
      'Very affordable cost of living',
      'Excellent private healthcare',
      'Great food and culture',
      'Large expat community',
      'Beautiful beaches and nature',
      'Good internet infrastructure',
    ],
    cons: [
      'Visa requires regular renewals/reporting',
      'Thai language barrier outside tourist areas',
      'Hot climate year-round',
      'Traffic in Bangkok',
      'Cannot own land freehold',
    ],
    popularCities: [
      {
        name: 'Chiang Mai',
        description: 'Digital nomad hub, cooler climate, mountains',
        monthlyBudget: { frugal: 900, moderate: 1400, comfortable: 2500 },
      },
      {
        name: 'Bangkok',
        description: 'Capital city, endless amenities, great healthcare',
        monthlyBudget: { frugal: 1200, moderate: 1800, comfortable: 3200 },
      },
      {
        name: 'Phuket',
        description: 'Beach lifestyle, international community',
        monthlyBudget: { frugal: 1300, moderate: 2000, comfortable: 3500 },
      },
      {
        name: 'Hua Hin',
        description: 'Quiet beach town, popular with retirees',
        monthlyBudget: { frugal: 1000, moderate: 1500, comfortable: 2600 },
      },
    ],
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    region: 'Southeast Asia',
    currency: 'VND',
    exchangeRate: 0.000054, // 1 VND = 0.000054 SGD
    costOfLiving: {
      rentStudio: 300,
      rent1Bed: 450,
      rent2Bed: 650,
      utilities: 50,
      groceries: 150,
      diningOut: 100,
      transportation: 40,
      healthcare: 40,
      entertainment: 80,
      total: {
        frugal: 800,
        moderate: 1200,
        comfortable: 2000,
      },
    },
    visa: {
      type: 'E-visa / Visa Exemption / Business Visa',
      maxStay: '90 days (e-visa), extendable',
      requirements: [
        'E-visa: Simple online application',
        'Business visa: Sponsor required',
        'No retirement visa available',
        'Visa runs common for long-term stays',
      ],
      renewability: 'Extensions possible but bureaucratic',
      pathToResidency: 'Temporary Residence Card possible with work/investment',
      workAllowed: false,
      notes: 'No dedicated retirement visa. Most retirees do visa runs or get business visa sponsorship. New 90-day e-visa helps.',
    },
    lifestyle: {
      climate: 'Varies: tropical south, subtropical north',
      language: ['Vietnamese'],
      englishFriendly: 2,
      safety: 4,
      healthcare: 3,
      internetSpeed: 90,
      timezone: 'UTC+7 (1 hour behind Singapore)',
      flightFromSG: '2 hours to HCMC',
    },
    pros: [
      'Very low cost of living',
      'Delicious and cheap food',
      'Vibrant culture',
      'Growing expat community',
      'Beautiful landscapes',
      'Fast-developing infrastructure',
    ],
    cons: [
      'No retirement visa option',
      'Language barrier significant',
      'Traffic and pollution in cities',
      'Bureaucracy can be challenging',
      'Healthcare quality varies',
    ],
    popularCities: [
      {
        name: 'Da Nang',
        description: 'Beach city, modern, great for expats',
        monthlyBudget: { frugal: 800, moderate: 1200, comfortable: 2000 },
      },
      {
        name: 'Ho Chi Minh City',
        description: 'Bustling metropolis, most international',
        monthlyBudget: { frugal: 1000, moderate: 1500, comfortable: 2500 },
      },
      {
        name: 'Hanoi',
        description: 'Capital, rich history, four seasons',
        monthlyBudget: { frugal: 900, moderate: 1400, comfortable: 2300 },
      },
      {
        name: 'Hoi An',
        description: 'Charming ancient town, beach nearby',
        monthlyBudget: { frugal: 700, moderate: 1100, comfortable: 1800 },
      },
    ],
  },
  {
    id: 'indonesia',
    name: 'Indonesia (Bali)',
    flag: '🇮🇩',
    region: 'Southeast Asia',
    currency: 'IDR',
    exchangeRate: 0.000085, // 1 IDR = 0.000085 SGD
    costOfLiving: {
      rentStudio: 400,
      rent1Bed: 600,
      rent2Bed: 900,
      utilities: 60,
      groceries: 200,
      diningOut: 150,
      transportation: 80,
      healthcare: 60,
      entertainment: 100,
      total: {
        frugal: 1100,
        moderate: 1700,
        comfortable: 2800,
      },
    },
    visa: {
      type: 'Second Home Visa / Retirement KITAS',
      maxStay: '5-10 years',
      requirements: [
        'Second Home Visa: $130K in Indonesian bank',
        'Retirement KITAS: Age 55+, $1,500/month pension proof',
        'Health insurance required',
        'Indonesian sponsor/agent needed',
      ],
      renewability: 'Second Home: 5 years, renewable. KITAS: annual',
      pathToResidency: 'KITAP (permanent) possible after years of KITAS',
      workAllowed: false,
      notes: 'New Second Home Visa (2022) is attractive but expensive. Bali is most popular but costs rising. Consider other islands.',
    },
    lifestyle: {
      climate: 'Tropical, dry and wet seasons',
      language: ['Indonesian', 'Balinese'],
      englishFriendly: 3,
      safety: 4,
      healthcare: 3,
      internetSpeed: 25,
      timezone: 'UTC+8 (Bali, same as Singapore)',
      flightFromSG: '2.5 hours to Bali',
    },
    pros: [
      'Beautiful nature and beaches',
      'Rich spiritual culture',
      'Large expat community in Bali',
      'Affordable outside tourist areas',
      'Warm and welcoming people',
      'Easy to find community',
    ],
    cons: [
      'Visa requirements can be complex',
      'Internet can be unreliable',
      'Healthcare limited outside major cities',
      'Bali getting expensive and crowded',
      'Traffic issues in popular areas',
    ],
    popularCities: [
      {
        name: 'Ubud',
        description: 'Cultural heart, rice terraces, wellness scene',
        monthlyBudget: { frugal: 1200, moderate: 1800, comfortable: 3000 },
      },
      {
        name: 'Canggu',
        description: 'Surf town, digital nomads, trendy cafes',
        monthlyBudget: { frugal: 1400, moderate: 2100, comfortable: 3500 },
      },
      {
        name: 'Sanur',
        description: 'Quiet beach town, older expat crowd',
        monthlyBudget: { frugal: 1100, moderate: 1700, comfortable: 2800 },
      },
      {
        name: 'Lombok',
        description: 'Less developed, beautiful beaches, cheaper',
        monthlyBudget: { frugal: 900, moderate: 1400, comfortable: 2300 },
      },
    ],
  },
  {
    id: 'philippines',
    name: 'Philippines',
    flag: '🇵🇭',
    region: 'Southeast Asia',
    currency: 'PHP',
    exchangeRate: 0.024, // 1 PHP = 0.024 SGD
    costOfLiving: {
      rentStudio: 300,
      rent1Bed: 450,
      rent2Bed: 650,
      utilities: 80,
      groceries: 200,
      diningOut: 120,
      transportation: 50,
      healthcare: 50,
      entertainment: 80,
      total: {
        frugal: 900,
        moderate: 1400,
        comfortable: 2400,
      },
    },
    visa: {
      type: 'SRRV (Special Resident Retiree Visa)',
      maxStay: 'Indefinite',
      requirements: [
        'SRRV Smile: Age 35+, $20K deposit (returned on cancellation)',
        'SRRV Classic: Age 35+, $10K-50K deposit depending on pension',
        'With pension: $10K deposit + $800/month pension proof',
        'Health insurance recommended',
      ],
      renewability: 'Indefinite, annual fee ~$360',
      pathToResidency: 'SRRV is already permanent residence',
      workAllowed: true,
      notes: 'One of the easiest retirement visas in Asia. Low deposit requirements. English widely spoken.',
    },
    lifestyle: {
      climate: 'Tropical, typhoon season June-November',
      language: ['Filipino', 'English'],
      englishFriendly: 5,
      safety: 3,
      healthcare: 3,
      internetSpeed: 70,
      timezone: 'UTC+8 (same as Singapore)',
      flightFromSG: '3.5 hours to Manila',
    },
    pros: [
      'Excellent English proficiency',
      'Very affordable cost of living',
      'Easy retirement visa (SRRV)',
      'Warm and friendly people',
      'Beautiful islands and beaches',
      'Same timezone as Singapore',
    ],
    cons: [
      'Typhoon and earthquake prone',
      'Infrastructure can be poor',
      'Safety concerns in some areas',
      'Traffic terrible in Manila',
      'Healthcare quality varies',
    ],
    popularCities: [
      {
        name: 'Cebu',
        description: 'Island living, good healthcare, expat community',
        monthlyBudget: { frugal: 900, moderate: 1400, comfortable: 2400 },
      },
      {
        name: 'Dumaguete',
        description: 'University town, quiet, very affordable',
        monthlyBudget: { frugal: 700, moderate: 1100, comfortable: 1800 },
      },
      {
        name: 'Davao',
        description: 'Safest city, clean, good infrastructure',
        monthlyBudget: { frugal: 800, moderate: 1200, comfortable: 2000 },
      },
      {
        name: 'Makati (Manila)',
        description: 'Modern CBD, all amenities, expensive',
        monthlyBudget: { frugal: 1200, moderate: 1800, comfortable: 3000 },
      },
    ],
  },
  {
    id: 'portugal',
    name: 'Portugal',
    flag: '🇵🇹',
    region: 'Europe',
    currency: 'EUR',
    exchangeRate: 1.45, // 1 EUR = 1.45 SGD
    costOfLiving: {
      rentStudio: 800,
      rent1Bed: 1100,
      rent2Bed: 1500,
      utilities: 120,
      groceries: 300,
      diningOut: 200,
      transportation: 50,
      healthcare: 100,
      entertainment: 150,
      total: {
        frugal: 1800,
        moderate: 2500,
        comfortable: 4000,
      },
    },
    visa: {
      type: 'D7 Passive Income Visa',
      maxStay: '2 years, renewable',
      requirements: [
        'Passive income: ~€760/month minimum (higher recommended)',
        'Proof of accommodation',
        'Health insurance',
        'Clean criminal record',
        'NHR tax regime available (10 years)',
      ],
      renewability: 'Renewable, leads to permanent residence',
      pathToResidency: 'PR after 5 years, citizenship after 5 years',
      workAllowed: true,
      notes: 'D7 visa is excellent for retirees. NHR tax regime offers 10 years of tax benefits. Golden Visa being phased out.',
    },
    lifestyle: {
      climate: 'Mediterranean, mild winters, warm summers',
      language: ['Portuguese'],
      englishFriendly: 4,
      safety: 5,
      healthcare: 4,
      internetSpeed: 120,
      timezone: 'UTC+0 (8 hours behind Singapore)',
      flightFromSG: '14 hours',
    },
    pros: [
      'Path to EU citizenship',
      'Excellent quality of life',
      'Very safe country',
      'Good healthcare system',
      'Pleasant climate',
      'English widely spoken',
    ],
    cons: [
      'Far from Singapore (8 hour time difference)',
      'Costs rising in Lisbon/Porto',
      'Bureaucracy can be slow',
      'Portuguese useful for integration',
      'Long flight from Asia',
    ],
    popularCities: [
      {
        name: 'Lisbon',
        description: 'Capital, vibrant culture, most expensive',
        monthlyBudget: { frugal: 2000, moderate: 2800, comfortable: 4500 },
      },
      {
        name: 'Porto',
        description: 'Charming city, wine region, more affordable',
        monthlyBudget: { frugal: 1700, moderate: 2400, comfortable: 3800 },
      },
      {
        name: 'Algarve',
        description: 'Beach region, expat haven, golf courses',
        monthlyBudget: { frugal: 1600, moderate: 2200, comfortable: 3500 },
      },
      {
        name: 'Madeira',
        description: 'Island paradise, great climate, digital nomads',
        monthlyBudget: { frugal: 1500, moderate: 2100, comfortable: 3300 },
      },
    ],
  },
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    region: 'East Asia',
    currency: 'JPY',
    exchangeRate: 0.0089, // 1 JPY = 0.0089 SGD
    costOfLiving: {
      rentStudio: 500,
      rent1Bed: 700,
      rent2Bed: 1000,
      utilities: 150,
      groceries: 350,
      diningOut: 250,
      transportation: 100,
      healthcare: 100,
      entertainment: 150,
      total: {
        frugal: 1500,
        moderate: 2200,
        comfortable: 3500,
      },
    },
    visa: {
      type: 'Designated Activities Visa / Investor Visa',
      maxStay: '1-5 years',
      requirements: [
        'No retirement visa exists',
        'Investor visa: ¥5M+ investment in business',
        'Designated Activities: Case by case',
        'Spouse visa if married to Japanese',
      ],
      renewability: 'Depends on visa type',
      pathToResidency: 'PR possible after 10 years (5 with points)',
      workAllowed: false,
      notes: 'Japan has no retirement visa. Most retirees use tourist visa runs (90 days) or invest in business. Yen weakness makes it attractive now.',
    },
    lifestyle: {
      climate: 'Four seasons, varies by region',
      language: ['Japanese'],
      englishFriendly: 2,
      safety: 5,
      healthcare: 5,
      internetSpeed: 150,
      timezone: 'UTC+9 (1 hour ahead of Singapore)',
      flightFromSG: '7 hours',
    },
    pros: [
      'Extremely safe country',
      'World-class healthcare',
      'Excellent public transport',
      'Rich culture and cuisine',
      'Four distinct seasons',
      'Yen currently weak (good value)',
    ],
    cons: [
      'No retirement visa option',
      'Japanese language essential',
      'Can feel isolating for foreigners',
      'Natural disasters (earthquakes, typhoons)',
      'Aging society challenges',
    ],
    popularCities: [
      {
        name: 'Fukuoka',
        description: 'Relaxed city, good food, affordable',
        monthlyBudget: { frugal: 1400, moderate: 2000, comfortable: 3200 },
      },
      {
        name: 'Osaka',
        description: 'Food capital, friendly people, central location',
        monthlyBudget: { frugal: 1500, moderate: 2200, comfortable: 3500 },
      },
      {
        name: 'Kyoto',
        description: 'Traditional culture, temples, beautiful',
        monthlyBudget: { frugal: 1600, moderate: 2300, comfortable: 3600 },
      },
      {
        name: 'Okinawa',
        description: 'Tropical islands, beach lifestyle, unique culture',
        monthlyBudget: { frugal: 1300, moderate: 1900, comfortable: 3000 },
      },
    ],
  },
]

export const getCountryById = (id: string): Country | undefined => {
  return countries.find((c) => c.id === id)
}
