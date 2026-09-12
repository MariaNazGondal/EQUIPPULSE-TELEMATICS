import { TermsAndConditionsConfig } from '../types/telematics';

export const DEFAULT_TERMS_AND_CONDITIONS: TermsAndConditionsConfig = {
  autoRenewalWindowDays: 30, // 30-day prior written notice required to prevent auto-renewal
  minimumCommitmentMonths: 12, // Standard 12-month minimum telematics subscription
  suspensionMonthlyRate: 3.50, // Reduced standby data fee for seasonal or suspended machinery (or ~25 kr. / €3.20)
  decommissionCutoffDays: 15, // Units decommissioned > 15 days into cycle billed pro-rata or waived
  taxRatePercent: 8.25, // Standard sales/VAT tax rate
  fleetVolumeDiscountPercent: 5.0, // 5% discount for fleets with >= 10 active telematics units
  fleetVolumeThreshold: 10,
  slaTiers: [
    {
      minUptime: 99.9,
      maxUptime: 100,
      creditPercent: 0,
      description: 'SLA Target Met (>= 99.9% Telemetry Ingestion Uptime) - Full standard subscription rate applies'
    },
    {
      minUptime: 99.0,
      maxUptime: 99.899,
      creditPercent: 10,
      description: 'Tier 1 SLA Breach (99.0% - 99.89% uptime) - 10% Service Credit on subscription'
    },
    {
      minUptime: 95.0,
      maxUptime: 98.999,
      creditPercent: 25,
      description: 'Tier 2 SLA Breach (95.0% - 98.99% uptime) - 25% Service Credit on subscription'
    },
    {
      minUptime: 0,
      maxUptime: 94.999,
      creditPercent: 50,
      description: 'Critical SLA Outage (< 95.0% uptime) - 50% Emergency Service Credit on subscription'
    }
  ],
  referenceLinks: [
    {
      title: 'Standard Telematics Subscription Terms & Pricing',
      url: 'https://equippulse-telematics.com/terms/pricing',
      description: 'Standard hardware modem tiers, connectivity data plans, Bluetooth BLE tags, and API packages.'
    },
    {
      title: 'Telematics Master Service Level Agreement (SLA)',
      url: 'https://equippulse-telematics.com/terms/sla',
      description: 'Core availability commitments (99.9% cloud uptime guarantee), outage credit remedies, and maintenance windows.'
    }
  ]
};

export const STANDARD_TIER_RATES = {
  'Pulse Go (Asset Tracking)': {
    name: 'Pulse Go (Asset Tracking)',
    monthlyUSD: 7.50,
    monthlyEUR: 7.00,
    monthlyDKK: 52.00,
    annualUSD: 85.00,
    annualEUR: 80.00,
    annualDKK: 590.00,
    features: ['GPS location tracking', 'Daily utilization logs', 'Battery & motion alerts', 'Anti-theft geo-fencing']
  },
  'Pulse Machine (CAN Diagnostics)': {
    name: 'Pulse Machine (CAN Diagnostics)',
    monthlyUSD: 16.00,
    monthlyEUR: 15.00,
    monthlyDKK: 110.00,
    annualUSD: 180.00,
    annualEUR: 170.00,
    annualDKK: 1250.00,
    features: ['CAN-bus engine telemetry', 'True operating hours', 'Service & maintenance alerts', 'ISO 15143-3 (AEMP 2.0)']
  },
  'Pulse Insight (Fleet Intelligence)': {
    name: 'Pulse Insight (Fleet Intelligence)',
    monthlyUSD: 24.00,
    monthlyEUR: 22.50,
    monthlyDKK: 165.00,
    annualUSD: 270.00,
    annualEUR: 255.00,
    annualDKK: 1880.00,
    features: ['Machine health foresight', 'Operator safety & access control', 'Full REST API feeds', 'Emissions & idle analytics']
  },
  'Custom Fleet Telematics': {
    name: 'Custom Fleet Telematics',
    monthlyUSD: 19.50,
    monthlyEUR: 18.00,
    monthlyDKK: 135.00,
    annualUSD: 220.00,
    annualEUR: 205.00,
    annualDKK: 1500.00,
    features: ['Tailored OEM telematics bundle', 'Hybrid machine connectivity', 'Multi-site synchronization']
  }
};
