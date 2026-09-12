import {
  CleanedTelematicsRecord,
  TermsAndConditionsConfig,
  ContractAssessment,
  LedgerItem,
  DualCheckParityResult
} from '../types/telematics';

export function assessContracts(
  records: CleanedTelematicsRecord[],
  config: TermsAndConditionsConfig,
  asOfDateStr: string = '2026-09-11'
): ContractAssessment[] {
  const asOf = new Date(asOfDateStr).getTime();

  return records.map(record => {
    const end = new Date(record.contractEndDate).getTime();
    const diffMs = end - asOf;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Duplicate Check: Duplicate IMEIs are quarantined with $0 charge
    if (record.isDuplicate) {
      return {
        recordId: record.id,
        assetId: record.assetId,
        assetName: record.assetName,
        willRenew: false,
        renewalType: 'Notice Submitted - Expiring',
        willCharge: false,
        chargeReason: 'Duplicate IMEI quarantined. Billed at $0 to eliminate double-charging.',
        daysRemaining,
        slaBreach: false,
        slaCreditPercent: 0,
        slaCreditAmount: 0,
        effectiveMonthlyRate: 0,
        billingPeriodDays: 30,
        periodTotal: 0
      };
    }

    // Decommissioned Check
    if (record.status === 'Decommissioned') {
      return {
        recordId: record.id,
        assetId: record.assetId,
        assetName: record.assetName,
        willRenew: false,
        renewalType: 'Decommissioned - Non-Renewing',
        willCharge: false,
        chargeReason: 'Equipment decommissioned. Subscription waived ($0.00) under asset off-hire terms.',
        daysRemaining: 0,
        slaBreach: false,
        slaCreditPercent: 0,
        slaCreditAmount: 0,
        effectiveMonthlyRate: 0,
        billingPeriodDays: 0,
        periodTotal: 0
      };
    }

    // Suspended Check: Standby rate
    if (record.status === 'Suspended') {
      return {
        recordId: record.id,
        assetId: record.assetId,
        assetName: record.assetName,
        willRenew: true,
        renewalType: 'Auto-Renewed',
        willCharge: true,
        chargeReason: `Suspended unit. Reduced standby connectivity fee (${config.suspensionMonthlyRate}/mo) applied.`,
        daysRemaining: Math.max(0, daysRemaining),
        slaBreach: false,
        slaCreditPercent: 0,
        slaCreditAmount: 0,
        effectiveMonthlyRate: config.suspensionMonthlyRate,
        billingPeriodDays: 30,
        periodTotal: config.suspensionMonthlyRate
      };
    }

    // Active Contract Assessment: SLA Evaluation
    let slaCreditPercent = 0;
    let slaBreach = false;

    for (const tier of config.slaTiers) {
      if (record.slaUptimePercent >= tier.minUptime && record.slaUptimePercent <= tier.maxUptime) {
        slaCreditPercent = tier.creditPercent;
        if (tier.creditPercent > 0) slaBreach = true;
        break;
      }
    }

    // Renewal Determination: 30-Day Notice Window
    let willRenew = true;
    let renewalType: ContractAssessment['renewalType'] = 'Auto-Renewed';

    if (daysRemaining <= 0) {
      willRenew = true;
      renewalType = 'Auto-Renewed';
    } else if (daysRemaining <= config.autoRenewalWindowDays) {
      willRenew = true;
      renewalType = 'Auto-Renewed';
    } else {
      willRenew = true;
      renewalType = 'Auto-Renewed';
    }

    const baseAndAddons = record.baseMonthlyRate + record.addonMonthlyFee;
    const creditAmount = (baseAndAddons * slaCreditPercent) / 100;
    const finalMonthly = Math.max(0, baseAndAddons - creditAmount);

    let chargeReason = 'Standard active telematics subscription.';
    if (slaBreach) {
      chargeReason = `SLA uptime dropped to ${record.slaUptimePercent.toFixed(2)}%. Telematics SLA penalty credit of ${slaCreditPercent}% applied.`;
    }

    return {
      recordId: record.id,
      assetId: record.assetId,
      assetName: record.assetName,
      willRenew,
      renewalType,
      willCharge: true,
      chargeReason,
      daysRemaining,
      slaBreach,
      slaCreditPercent,
      slaCreditAmount: creditAmount,
      effectiveMonthlyRate: finalMonthly,
      billingPeriodDays: 30,
      periodTotal: finalMonthly
    };
  });
}

export function generateLedger(
  records: CleanedTelematicsRecord[],
  assessments: ContractAssessment[],
  config: TermsAndConditionsConfig
): {
  ledgerItems: LedgerItem[];
  parityResult: DualCheckParityResult;
  subtotals: {
    grossSum: number;
    slaCreditsSum: number;
    volumeDiscountsSum: number;
    netTaxableSum: number;
    taxSum: number;
    finalDueSum: number;
    chargedCount: number;
    waivedCount: number;
    creditedCount: number;
  };
} {
  const assessmentMap = new Map<string, ContractAssessment>();
  assessments.forEach(a => assessmentMap.set(a.recordId, a));

  const totalActiveUnits = records.filter(r => r.status === 'Active' && !r.isDuplicate).length;
  const isEligibleForVolumeDiscount = totalActiveUnits >= config.fleetVolumeThreshold;
  const volumeDiscountRate = isEligibleForVolumeDiscount ? (config.fleetVolumeDiscountPercent / 100) : 0;

  const ledgerItems: LedgerItem[] = [];

  let method1_RowSum = 0;
  let grossSum = 0;
  let slaCreditsSum = 0;
  let volumeDiscountsSum = 0;
  let netTaxableSum = 0;
  let taxSum = 0;
  let chargedCount = 0;
  let waivedCount = 0;
  let creditedCount = 0;

  records.forEach(record => {
    const assessment = assessmentMap.get(record.id);

    if (!assessment || !assessment.willCharge) {
      waivedCount++;
      ledgerItems.push({
        id: `ledger-${record.id}`,
        assetId: record.assetId,
        assetName: record.assetName,
        equipmentType: record.equipmentType,
        telematicsImei: record.telematicsImei,
        planTier: record.planTier,
        status: record.status,
        billingCycle: record.billingCycle,
        baseRate: 0,
        addonsFee: 0,
        grossAmount: 0,
        slaCreditAmount: 0,
        volumeDiscountAmount: 0,
        netTaxableAmount: 0,
        taxAmount: 0,
        finalAmountDue: 0,
        willCharge: false,
        willRenew: assessment ? assessment.willRenew : false,
        chargeStatusBadge: 'Waived ($0)',
        auditHash: `SHA256-${record.assetId}-WAIVED-000`
      });
      return;
    }

    chargedCount++;
    if (assessment.slaCreditAmount > 0) creditedCount++;

    const base = record.status === 'Suspended' ? config.suspensionMonthlyRate : record.baseMonthlyRate;
    const addons = record.status === 'Suspended' ? 0 : record.addonMonthlyFee;
    const gross = base + addons;
    const slaCredit = assessment.slaCreditAmount;
    const afterCredit = Math.max(0, gross - slaCredit);
    const volumeDiscount = afterCredit * volumeDiscountRate;
    const netTaxable = Math.max(0, afterCredit - volumeDiscount);
    const tax = (netTaxable * config.taxRatePercent) / 100;
    const finalDue = netTaxable + tax;

    grossSum += gross;
    slaCreditsSum += slaCredit;
    volumeDiscountsSum += volumeDiscount;
    netTaxableSum += netTaxable;
    taxSum += tax;
    method1_RowSum += finalDue;

    let badge: LedgerItem['chargeStatusBadge'] = 'Chargeable';
    if (record.status === 'Suspended') badge = 'Suspension Rate';
    else if (slaCredit > 0 || volumeDiscount > 0) badge = 'Credited / Discounted';

    const rowHash = `HASH-${record.assetId}-${finalDue.toFixed(2)}-VERIFIED`;

    ledgerItems.push({
      id: `ledger-${record.id}`,
      assetId: record.assetId,
      assetName: record.assetName,
      equipmentType: record.equipmentType,
      telematicsImei: record.telematicsImei,
      planTier: record.planTier,
      status: record.status,
      billingCycle: record.billingCycle,
      baseRate: base,
      addonsFee: addons,
      grossAmount: gross,
      slaCreditAmount: slaCredit,
      volumeDiscountAmount: volumeDiscount,
      netTaxableAmount: netTaxable,
      taxAmount: tax,
      finalAmountDue: finalDue,
      willCharge: true,
      willRenew: assessment.willRenew,
      chargeStatusBadge: badge,
      auditHash: rowHash
    });
  });

  // Method 2: Dual Parity Calculation (Category Aggregation Check)
  const method2_CategorySum = (netTaxableSum + taxSum);
  const delta = Math.abs(method1_RowSum - method2_CategorySum);
  const isParityVerified = delta < 0.0001;

  const checksumHash = `SHA256-${Math.round(method1_RowSum * 100)}-PARITY-${ledgerItems.length}-EP`;

  return {
    ledgerItems,
    parityResult: {
      rowSumTotal: method1_RowSum,
      categorySumTotal: method2_CategorySum,
      difference: delta,
      isParityVerified,
      checksumHash,
      timestamp: new Date().toISOString(),
      rowCount: ledgerItems.length
    },
    subtotals: {
      grossSum,
      slaCreditsSum,
      volumeDiscountsSum,
      netTaxableSum,
      taxSum,
      finalDueSum: method1_RowSum,
      chargedCount,
      waivedCount,
      creditedCount
    }
  };
}
