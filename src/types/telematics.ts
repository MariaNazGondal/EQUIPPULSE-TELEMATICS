export type SupportedCurrency = 'DKK' | 'EUR' | 'USD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  label: string;
  format: (amount: number) => string;
}

export interface RawTelematicsRow {
  id?: string;
  assetId?: string;
  assetName?: string;
  equipmentType?: string;
  telematicsImei?: string;
  serialNumber?: string;
  planTier?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  billingCycle?: string;
  monthlyRate?: string | number;
  addons?: string;
  addonFee?: string | number;
  status?: string;
  slaUptimePercent?: string | number;
  customerName?: string;
  siteLocation?: string;
  currency?: string;
  [key: string]: any;
}

export interface DataCorrection {
  id: string;
  rowNumber: number;
  assetId: string;
  field: string;
  originalValue: any;
  correctedValue: any;
  reason: string;
  ruleApplied: string;
  excelFormulaTip?: string;
  confidence: 'High' | 'Medium' | 'Low';
  applied: boolean;
}

export interface CleaningAuditSummary {
  totalRowsProcessed: number;
  validRows: number;
  correctionsCount: number;
  invertedDatesFixed: number;
  duplicatesQuarantined: number;
  ratesRectified: number;
  tierNamesStandardized: number;
  detectedCurrency: SupportedCurrency;
  customerName?: string;
  fileName?: string;
  summaryHighlights: string[];
  invertedDateItems?: {
    assetId: string;
    assetName: string;
    originalStart: string;
    originalEnd: string;
    swappedStart: string;
    swappedEnd: string;
  }[];
  duplicateItems?: {
    assetId: string;
    imei: string;
    rowNum: number;
    duplicateOfRowNum: number;
  }[];
}

export interface CleanedTelematicsRecord {
  id: string;
  rowNumber: number;
  assetId: string;
  assetName: string;
  equipmentType: string;
  telematicsImei: string;
  serialNumber: string;
  planTier: 'Pulse Go (Asset Tracking)' | 'Pulse Machine (CAN Diagnostics)' | 'Pulse Insight (Fleet Intelligence)' | 'Custom Fleet Telematics';
  contractStartDate: string; // ISO YYYY-MM-DD
  contractEndDate: string;   // ISO YYYY-MM-DD
  billingCycle: 'Monthly' | 'Annual';
  baseMonthlyRate: number;
  addons: string[];
  addonMonthlyFee: number;
  status: 'Active' | 'Suspended' | 'Decommissioned';
  slaUptimePercent: number;
  customerName: string;
  siteLocation: string;
  isDuplicate?: boolean;
  currency: SupportedCurrency;
}

export interface ContractAssessment {
  recordId: string;
  assetId: string;
  assetName: string;
  willRenew: boolean;
  renewalType: 'Auto-Renewed' | 'Notice Submitted - Expiring' | 'Extended by SLA' | 'Decommissioned - Non-Renewing';
  willCharge: boolean;
  chargeReason: string;
  daysRemaining: number;
  slaBreach: boolean;
  slaCreditPercent: number;
  slaCreditAmount: number;
  effectiveMonthlyRate: number;
  billingPeriodDays: number;
  periodTotal: number;
}

export interface LedgerItem {
  id: string;
  assetId: string;
  assetName: string;
  equipmentType: string;
  telematicsImei: string;
  planTier: string;
  status: 'Active' | 'Suspended' | 'Decommissioned';
  billingCycle: 'Monthly' | 'Annual';
  baseRate: number;
  addonsFee: number;
  grossAmount: number;
  slaCreditAmount: number;
  volumeDiscountAmount: number;
  netTaxableAmount: number;
  taxAmount: number;
  finalAmountDue: number;
  willCharge: boolean;
  willRenew: boolean;
  chargeStatusBadge: 'Chargeable' | 'Waived ($0)' | 'Credited / Discounted' | 'Suspension Rate';
  auditHash: string;
}

export interface DualCheckParityResult {
  rowSumTotal: number;
  categorySumTotal: number;
  difference: number;
  isParityVerified: boolean;
  checksumHash: string;
  timestamp: string;
  rowCount: number;
}

export interface TermsAndConditionsConfig {
  autoRenewalWindowDays: number;
  minimumCommitmentMonths: number;
  suspensionMonthlyRate: number;
  decommissionCutoffDays: number;
  taxRatePercent: number;
  fleetVolumeDiscountPercent: number;
  fleetVolumeThreshold: number;
  slaTiers: {
    minUptime: number;
    maxUptime: number;
    creditPercent: number;
    description: string;
  }[];
  referenceLinks: {
    title: string;
    url: string;
    description: string;
  }[];
}

export interface InvoiceMetadata {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerTaxId: string;
  projectSite: string;
  paymentTerms: string;
  notes: string;
}
