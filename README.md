# 🔥 SG FIRE Calculator

A comprehensive FIRE (Financial Independence, Retire Early) calculator for Singaporeans planning to retire abroad. Compare cost of living, visa requirements, and run rate simulations across multiple countries.

## Features

### 💰 Financial Planning
- **Cash/Investment Portfolio** - Track your current savings and monthly contributions
- **CPF Integration** - Separate tracking for OA, SA, and MA with accurate interest rates
  - OA: 2.5% base rate
  - SA/MA: 4.0% base rate
  - Extra 1% on first $60K combined (OA capped at $20K)
  - Extra 1% for 55+ on first $30K
- **Combined Portfolio View** - Toggle between cash-only or cash + withdrawable CPF OA
- **Monte Carlo Simulation** - 500 simulations with volatility modeling

### 🌏 Country Comparison (8 Destinations)
1. **Malaysia** - MM2H visa, same timezone, excellent English
2. **Taiwan** - Gold Card, great healthcare
3. **Thailand** - LTR/Retirement visa, large expat community
4. **Vietnam** - Very affordable, growing expat scene
5. **Indonesia (Bali)** - Second Home Visa, expat paradise
6. **Philippines** - SRRV (easiest retirement visa), English-speaking
7. **Portugal** - D7 visa, path to EU citizenship
8. **Japan** - Weak yen opportunity, world-class infrastructure

### 📊 For Each Country
- Monthly budget (frugal/moderate/comfortable)
- Detailed visa requirements with notes
- Lifestyle ratings (English, safety, healthcare, internet)
- Popular cities with individual budgets
- Pros & Cons analysis
- Years of runway based on your portfolio

### 📈 Visualizations
- Portfolio growth projection chart
- Monte Carlo simulation with percentile bands
- Country comparison bar chart
- Runway comparison across countries
- CPF growth projection by account type

### 🎯 Country-Specific Projections
Click any country to see:
- Burn rate simulation over 50 years
- Portfolio depletion timeline
- Comparison vs 4% safe withdrawal rate
- Lifestyle tier comparison (frugal/moderate/comfortable)
- Monthly spending breakdown

## Tech Stack

- **React 19** + TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Recharts** for visualizations
- **Lucide React** for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deploy to GitHub Pages

### Automatic Deployment
1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Enable GitHub Pages in repo settings → Pages → Source: "GitHub Actions"

### Manual Deployment
```bash
# Build for GitHub Pages
npm run build:gh-pages

# The dist/ folder contains the deployable files
```

### Custom Domain
If using a custom domain, update `vite.config.ts`:
```ts
base: '/',  // Instead of '/sg-fire-calculator/'
```

## CPF Considerations

The calculator includes CPF-specific logic:
- **At 55**: SA transfers to RA for CPF LIFE
- **Withdrawable OA**: Amount above Basic Retirement Sum ($102,900 in 2024)
- **CPF LIFE**: Estimated monthly payouts from age 65
- **For emigration**: Full withdrawal possible after renouncing citizenship/PR

## Disclaimer

This calculator is for educational purposes only. Consult a financial advisor for personalized advice. Cost of living data is approximate and may vary. Visa requirements change frequently - always verify with official sources.
