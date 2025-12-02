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
  coordinates: {
    lat: number
    lng: number
  }
}

export interface LifestyleTier {
  total: number
  description: string
  breakdown: {
    housing: { amount: number; description: string }
    food: { amount: number; description: string }
    transport: { amount: number; description: string }
    healthcare: { amount: number; description: string }
    entertainment: { amount: number; description: string }
    utilities: { amount: number; description: string }
  }
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
  // Detailed lifestyle breakdowns
  lifestyles: {
    frugal: LifestyleTier
    moderate: LifestyleTier
    comfortable: LifestyleTier
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
      lifestyles: {
        frugal: {
          total: 1000,
          description: "Basic but comfortable living in smaller cities like Ipoh or Penang outskirts",
          breakdown: {
            housing: { amount: 300, description: "Studio or room rental in local area" },
            food: { amount: 250, description: "Cook at home, occasional hawker meals" },
            transport: { amount: 50, description: "Public transport, occasional Grab" },
            healthcare: { amount: 30, description: "Government clinics, basic insurance" },
            entertainment: { amount: 50, description: "Free activities, occasional movies" },
            utilities: { amount: 40, description: "Electricity, water, basic internet" },
          },
        },
        moderate: {
          total: 1500,
          description: "Comfortable expat lifestyle in KL suburbs or Penang",
          breakdown: {
            housing: { amount: 500, description: "1-bedroom condo with pool & gym" },
            food: { amount: 350, description: "Mix of cooking and restaurant dining" },
            transport: { amount: 100, description: "Grab rides, occasional car rental" },
            healthcare: { amount: 80, description: "Private clinics, health insurance" },
            entertainment: { amount: 150, description: "Dining out, activities, travel" },
            utilities: { amount: 70, description: "A/C, fast internet, streaming" },
          },
        },
        comfortable: {
          total: 2500,
          description: "Premium lifestyle in KLCC, Mont Kiara, or beachfront Penang",
          breakdown: {
            housing: { amount: 1000, description: "Luxury 2-bed condo in prime area" },
            food: { amount: 500, description: "Fine dining, imported groceries" },
            transport: { amount: 200, description: "Car lease or frequent Grab Premium" },
            healthcare: { amount: 150, description: "Premium insurance, private hospitals" },
            entertainment: { amount: 350, description: "Golf, spa, weekend trips" },
            utilities: { amount: 100, description: "Full A/C, premium internet, services" },
          },
        },
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
    coordinates: { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
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
      lifestyles: {
        frugal: {
          total: 1200,
          description: "Simple living in smaller cities like Tainan or Kaohsiung",
          breakdown: {
            housing: { amount: 350, description: "Studio in older building, local area" },
            food: { amount: 300, description: "Night markets, local eateries, cooking" },
            transport: { amount: 50, description: "MRT, buses, YouBike" },
            healthcare: { amount: 50, description: "NHI coverage (if eligible), clinics" },
            entertainment: { amount: 80, description: "Hiking, temples, local events" },
            utilities: { amount: 50, description: "Electricity, water, basic internet" },
          },
        },
        moderate: {
          total: 1800,
          description: "Comfortable life in Taipei suburbs or central Taichung",
          breakdown: {
            housing: { amount: 600, description: "Modern 1-bed apartment near MRT" },
            food: { amount: 400, description: "Mix of cooking and restaurant dining" },
            transport: { amount: 80, description: "MRT, occasional taxi, scooter rental" },
            healthcare: { amount: 100, description: "NHI + private top-up insurance" },
            entertainment: { amount: 200, description: "Cafes, movies, weekend trips" },
            utilities: { amount: 80, description: "A/C, fast internet, streaming" },
          },
        },
        comfortable: {
          total: 3000,
          description: "Premium lifestyle in Taipei Xinyi or Da'an district",
          breakdown: {
            housing: { amount: 1200, description: "Luxury apartment in prime Taipei" },
            food: { amount: 600, description: "Fine dining, Japanese imports" },
            transport: { amount: 150, description: "Taxi, car rental, HSR travel" },
            healthcare: { amount: 200, description: "Premium private healthcare" },
            entertainment: { amount: 400, description: "Golf, spas, island hopping" },
            utilities: { amount: 120, description: "Full amenities, premium services" },
          },
        },
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
    coordinates: { lat: 25.0330, lng: 121.5654 }, // Taipei
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
      lifestyles: {
        frugal: {
          total: 1000,
          description: "Simple living in Chiang Mai or smaller Thai cities",
          breakdown: {
            housing: { amount: 300, description: "Studio or fan room in local area" },
            food: { amount: 250, description: "Street food, local markets, cooking" },
            transport: { amount: 40, description: "Songthaew, motorbike rental" },
            healthcare: { amount: 40, description: "Government hospitals, basic meds" },
            entertainment: { amount: 60, description: "Temples, nature, local events" },
            utilities: { amount: 50, description: "Electricity, water, basic wifi" },
          },
        },
        moderate: {
          total: 1600,
          description: "Comfortable expat life in Chiang Mai or Bangkok suburbs",
          breakdown: {
            housing: { amount: 550, description: "1-bed condo with pool in good area" },
            food: { amount: 350, description: "Mix of Thai and Western food" },
            transport: { amount: 80, description: "BTS/MRT, Grab, scooter" },
            healthcare: { amount: 100, description: "Private hospitals, insurance" },
            entertainment: { amount: 200, description: "Cafes, massage, weekend trips" },
            utilities: { amount: 80, description: "A/C, fast internet, streaming" },
          },
        },
        comfortable: {
          total: 2800,
          description: "Premium lifestyle in Bangkok Sukhumvit or beachfront Phuket",
          breakdown: {
            housing: { amount: 1100, description: "Luxury condo in prime location" },
            food: { amount: 550, description: "Fine dining, imported goods" },
            transport: { amount: 180, description: "Taxi, car rental, domestic flights" },
            healthcare: { amount: 200, description: "Premium Bumrungrad-level care" },
            entertainment: { amount: 400, description: "Beach clubs, golf, island trips" },
            utilities: { amount: 120, description: "Full A/C, premium everything" },
          },
        },
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
    coordinates: { lat: 13.7563, lng: 100.5018 }, // Bangkok
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
      lifestyles: {
        frugal: {
          total: 800,
          description: "Budget living in Da Nang or smaller cities",
          breakdown: {
            housing: { amount: 250, description: "Local apartment or room rental" },
            food: { amount: 200, description: "Pho, banh mi, local eateries" },
            transport: { amount: 30, description: "Motorbike rental, local buses" },
            healthcare: { amount: 30, description: "Local clinics, cheap medicine" },
            entertainment: { amount: 50, description: "Beach, coffee shops, local life" },
            utilities: { amount: 40, description: "Basic electricity, wifi" },
          },
        },
        moderate: {
          total: 1200,
          description: "Comfortable expat life in HCMC District 2 or Da Nang beach",
          breakdown: {
            housing: { amount: 450, description: "Modern 1-bed in expat area" },
            food: { amount: 280, description: "Mix of local and Western food" },
            transport: { amount: 60, description: "Grab, motorbike, occasional taxi" },
            healthcare: { amount: 80, description: "International clinics, insurance" },
            entertainment: { amount: 150, description: "Cafes, beach clubs, travel" },
            utilities: { amount: 60, description: "A/C, fast internet" },
          },
        },
        comfortable: {
          total: 2000,
          description: "Premium lifestyle in HCMC Thao Dien or Hanoi West Lake",
          breakdown: {
            housing: { amount: 800, description: "Luxury serviced apartment" },
            food: { amount: 400, description: "Fine dining, imported groceries" },
            transport: { amount: 120, description: "Grab Premium, car rental" },
            healthcare: { amount: 150, description: "Premium international hospitals" },
            entertainment: { amount: 300, description: "Rooftop bars, golf, travel" },
            utilities: { amount: 100, description: "Full amenities, premium services" },
          },
        },
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
    coordinates: { lat: 16.0544, lng: 108.2022 }, // Da Nang
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
      lifestyles: {
        frugal: {
          total: 1100,
          description: "Simple living in Ubud outskirts or less touristy areas",
          breakdown: {
            housing: { amount: 350, description: "Basic room or small house rental" },
            food: { amount: 250, description: "Warungs, local markets, cooking" },
            transport: { amount: 60, description: "Scooter rental, occasional Grab" },
            healthcare: { amount: 50, description: "Local clinics, basic insurance" },
            entertainment: { amount: 80, description: "Beach, temples, yoga" },
            utilities: { amount: 50, description: "Electricity, basic wifi" },
          },
        },
        moderate: {
          total: 1700,
          description: "Comfortable digital nomad life in Canggu or Ubud center",
          breakdown: {
            housing: { amount: 600, description: "Nice villa or 1-bed with pool access" },
            food: { amount: 350, description: "Mix of warungs and cafes" },
            transport: { amount: 100, description: "Scooter, occasional car rental" },
            healthcare: { amount: 100, description: "BIMC or Siloam hospitals" },
            entertainment: { amount: 200, description: "Beach clubs, coworking, yoga" },
            utilities: { amount: 80, description: "A/C, fast internet" },
          },
        },
        comfortable: {
          total: 2800,
          description: "Premium lifestyle in Seminyak or luxury Ubud villa",
          breakdown: {
            housing: { amount: 1100, description: "Private pool villa, prime location" },
            food: { amount: 500, description: "Fine dining, imported goods" },
            transport: { amount: 180, description: "Car with driver, premium scooter" },
            healthcare: { amount: 180, description: "Premium international care" },
            entertainment: { amount: 400, description: "Beach clubs, spa, island trips" },
            utilities: { amount: 120, description: "Full A/C, premium everything" },
          },
        },
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
    coordinates: { lat: -8.4095, lng: 115.1889 }, // Bali
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
      lifestyles: {
        frugal: {
          total: 900,
          description: "Simple living in Dumaguete or provincial areas",
          breakdown: {
            housing: { amount: 250, description: "Basic apartment in local area" },
            food: { amount: 220, description: "Carinderias, markets, cooking" },
            transport: { amount: 40, description: "Jeepneys, tricycles" },
            healthcare: { amount: 40, description: "PhilHealth, local clinics" },
            entertainment: { amount: 60, description: "Beach, local festivals" },
            utilities: { amount: 60, description: "Electricity (can be pricey), wifi" },
          },
        },
        moderate: {
          total: 1400,
          description: "Comfortable life in Cebu or Davao",
          breakdown: {
            housing: { amount: 450, description: "Condo in good area with amenities" },
            food: { amount: 300, description: "Mix of local and Western food" },
            transport: { amount: 70, description: "Grab, occasional rental" },
            healthcare: { amount: 100, description: "Private hospitals, HMO" },
            entertainment: { amount: 180, description: "Malls, island hopping, dining" },
            utilities: { amount: 100, description: "A/C, internet, water" },
          },
        },
        comfortable: {
          total: 2400,
          description: "Premium lifestyle in BGC Manila or Cebu IT Park",
          breakdown: {
            housing: { amount: 900, description: "Luxury condo in prime area" },
            food: { amount: 450, description: "Fine dining, imported goods" },
            transport: { amount: 150, description: "Grab Premium, car rental" },
            healthcare: { amount: 180, description: "St. Luke's, Makati Med level" },
            entertainment: { amount: 350, description: "Golf, resorts, travel" },
            utilities: { amount: 150, description: "Full A/C, premium services" },
          },
        },
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
    coordinates: { lat: 14.5995, lng: 120.9842 }, // Manila
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
      lifestyles: {
        frugal: {
          total: 1800,
          description: "Simple living in smaller cities like Braga or Coimbra",
          breakdown: {
            housing: { amount: 600, description: "Studio or room in older building" },
            food: { amount: 350, description: "Markets, cooking, local tascas" },
            transport: { amount: 40, description: "Public transport, walking" },
            healthcare: { amount: 80, description: "SNS public healthcare" },
            entertainment: { amount: 100, description: "Beaches, hiking, local cafes" },
            utilities: { amount: 100, description: "Electricity, water, internet" },
          },
        },
        moderate: {
          total: 2500,
          description: "Comfortable life in Porto or Lisbon outskirts",
          breakdown: {
            housing: { amount: 1000, description: "1-bed apartment in good area" },
            food: { amount: 450, description: "Mix of cooking and dining out" },
            transport: { amount: 60, description: "Metro, occasional car rental" },
            healthcare: { amount: 120, description: "Private insurance + SNS" },
            entertainment: { amount: 200, description: "Cafes, wine, weekend trips" },
            utilities: { amount: 130, description: "Heating, A/C, fast internet" },
          },
        },
        comfortable: {
          total: 4000,
          description: "Premium lifestyle in central Lisbon or Porto Foz",
          breakdown: {
            housing: { amount: 1800, description: "Luxury apartment, prime location" },
            food: { amount: 650, description: "Fine dining, quality groceries" },
            transport: { amount: 150, description: "Car lease, taxi, travel" },
            healthcare: { amount: 200, description: "Premium private healthcare" },
            entertainment: { amount: 450, description: "Golf, wine tours, travel" },
            utilities: { amount: 180, description: "Full climate control, premium" },
          },
        },
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
    coordinates: { lat: 38.7223, lng: -9.1393 }, // Lisbon
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
      lifestyles: {
        frugal: {
          total: 1500,
          description: "Simple living in rural areas or smaller cities like Fukuoka",
          breakdown: {
            housing: { amount: 400, description: "Small apartment in local area" },
            food: { amount: 350, description: "Supermarket bento, cooking, ramen" },
            transport: { amount: 80, description: "Local trains, bicycle" },
            healthcare: { amount: 80, description: "National health insurance" },
            entertainment: { amount: 100, description: "Temples, nature, onsen" },
            utilities: { amount: 120, description: "Gas, electricity, internet" },
          },
        },
        moderate: {
          total: 2200,
          description: "Comfortable life in Osaka or Tokyo suburbs",
          breakdown: {
            housing: { amount: 700, description: "1K/1DK apartment near station" },
            food: { amount: 450, description: "Mix of cooking and izakayas" },
            transport: { amount: 120, description: "Train pass, occasional taxi" },
            healthcare: { amount: 120, description: "NHI + supplemental insurance" },
            entertainment: { amount: 200, description: "Cafes, cultural events, travel" },
            utilities: { amount: 150, description: "Heating/cooling, fast internet" },
          },
        },
        comfortable: {
          total: 3500,
          description: "Premium lifestyle in central Tokyo or Kyoto",
          breakdown: {
            housing: { amount: 1300, description: "Modern apartment in prime area" },
            food: { amount: 600, description: "Fine dining, quality ingredients" },
            transport: { amount: 200, description: "Green car, taxi, shinkansen" },
            healthcare: { amount: 180, description: "Premium private clinics" },
            entertainment: { amount: 450, description: "Ryokan, golf, cultural experiences" },
            utilities: { amount: 200, description: "Full amenities, premium services" },
          },
        },
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
    coordinates: { lat: 35.6762, lng: 139.6503 }, // Tokyo
  },
]

export const getCountryById = (id: string): Country | undefined => {
  return countries.find((c) => c.id === id)
}
