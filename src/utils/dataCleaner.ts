import { RawTelematicsRow, CleanedTelematicsRecord, DataCorrection, CleaningAuditSummary, SupportedCurrency } from '../types/telematics';
import { STANDARD_TIER_RATES } from '../data/termsAndConditions';
import { detectCurrencyFromData } from './currency';
import { detectColumnKeys, extractCustomerNameFromRows } from './columnDetector';

export function parseFlexibleDate(val: any): { dateStr: string; wasModified: boolean; original: string } {
  if (val === null || val === undefined || String(val).trim() === '') {
    const now = new Date();
    return { dateStr: now.toISOString().split('T')[0], wasModified: true, original: String(val) };
  }

  // If already a JS Date object (e.g. from XLSX parser)
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return { dateStr: `${y}-${m}-${d}`, wasModified: true, original: val.toISOString() };
    }
  }

  const str = String(val).trim();

  // Excel serial date number (e.g. 44500 to 47000)
  if (/^\d{4,5}$/.test(str)) {
    const serial = parseInt(str, 10);
    if (serial > 20000 && serial < 60000) {
      const utcDays = serial - 25569;
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      const y = dateInfo.getUTCFullYear();
      const m = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dateInfo.getUTCDate()).padStart(2, '0');
      return { dateStr: `${y}-${m}-${d}`, wasModified: true, original: str };
    }
  }

  // Standard ISO YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return { dateStr: `${y}-${m}-${d}`, wasModified: str !== `${y}-${m}-${d}`, original: str };
  }

  // DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (slashMatch) {
    const first = parseInt(slashMatch[1], 10);
    const second = parseInt(slashMatch[2], 10);
    const year = slashMatch[3];

    // If first > 12, it must be DD/MM/YYYY
    if (first > 12) {
      const d = String(first).padStart(2, '0');
      const m = String(second).padStart(2, '0');
      return { dateStr: `${year}-${m}-${d}`, wasModified: true, original: str };
    }
    // If second > 12, it must be MM/DD/YYYY
    if (second > 12) {
      const m = String(first).padStart(2, '0');
      const d = String(second).padStart(2, '0');
      return { dateStr: `${year}-${m}-${d}`, wasModified: true, original: str };
    }
    // Default assumption for ambiguous DD/MM vs MM/DD: DD-MM-YYYY (standard international in construction)
    const d = String(first).padStart(2, '0');
    const m = String(second).padStart(2, '0');
    return { dateStr: `${year}-${m}-${d}`, wasModified: true, original: str };
  }

  // Try standard date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return { dateStr: `${y}-${m}-${d}`, wasModified: true, original: str };
  }

  const fallback = new Date().toISOString().split('T')[0];
  return { dateStr: fallback, wasModified: true, original: str };
}

export function cleanTelematicsDataset(
  rawRows: RawTelematicsRow[],
  forcedCurrency?: SupportedCurrency,
  fileName?: string
): {
  cleanedRecords: CleanedTelematicsRecord[];
  corrections: DataCorrection[];
  duplicatesFound: number;
  auditSummary: CleaningAuditSummary;
} {
  if (!rawRows || rawRows.length === 0) {
    return {
      cleanedRecords: [],
      corrections: [],
      duplicatesFound: 0,
      auditSummary: {
        totalRowsProcessed: 0,
        validRows: 0,
        correctionsCount: 0,
        invertedDatesFixed: 0,
        duplicatesQuarantined: 0,
        ratesRectified: 0,
        tierNamesStandardized: 0,
        detectedCurrency: forcedCurrency || 'USD',
        customerName: 'Awaiting File Upload',
        fileName: fileName,
        summaryHighlights: [],
        invertedDateItems: [],
        duplicateItems: []
      }
    };
  }

  const detectedCurrency: SupportedCurrency = forcedCurrency || detectCurrencyFromData(rawRows);
  const detectedCustomerName = extractCustomerNameFromRows(rawRows, fileName);
  const columnMap = detectColumnKeys(rawRows[0]);

  const corrections: DataCorrection[] = [];
  const cleanedRecords: CleanedTelematicsRecord[] = [];
  const seenImeis = new Map<string, number>();
  const seenAssetIds = new Map<string, number>();

  let duplicatesFound = 0;
  let invertedDatesFixed = 0;
  let ratesRectified = 0;
  let tierNamesStandardized = 0;

  const invertedDateItems: CleaningAuditSummary['invertedDateItems'] = [];
  const duplicateItems: CleaningAuditSummary['duplicateItems'] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 1;

    // Helper to extract value by matched column key or fallbacks
    const getVal = (key?: string, fallbackKeys: string[] = []): any => {
      if (key && row[key] !== undefined && row[key] !== null) return row[key];
      for (const fk of fallbackKeys) {
        if (row[fk] !== undefined && row[fk] !== null) return row[fk];
      }
      return undefined;
    };

    const rawAssetId = (
      getVal(columnMap.assetIdKey, ['assetId', 'asset_id', 'Asset ID', 'AssetID', 'Asset', 'Unit ID', 'Equipment ID', 'Tag']) ??
      `EQ-${rowNum}`
    ).toString().trim();

    const rawAssetName = (
      getVal(columnMap.assetNameKey, ['assetName', 'asset_name', 'Equipment Name', 'Asset Name', 'Machine', 'Equipment', 'Model', 'Description']) ??
      `Heavy Asset #${rowNum}`
    ).toString().trim();

    const rawEquipmentType = (
      getVal(columnMap.equipmentTypeKey, ['equipmentType', 'equipment_type', 'Equipment Type', 'Type', 'Category']) ??
      'Heavy Machinery'
    ).toString().trim();

    const rawImei = (
      getVal(columnMap.imeiKey, ['telematicsImei', 'imei', 'IMEI', 'Telematics IMEI', 'Modem', 'Serial/IMEI', 'Modem IMEI', 'Device ID']) ??
      ''
    ).toString().trim();

    const rawSerial = (
      getVal(columnMap.serialKey, ['serialNumber', 'serial_number', 'Serial Number', 'Serial', 'SN', 'VIN']) ??
      ''
    ).toString().trim();

    const rawPlanTier = (
      getVal(columnMap.planTierKey, ['planTier', 'plan_tier', 'Plan', 'Plan Tier', 'Subscription Tier', 'Subscription', 'Tier', 'Package']) ??
      'Pulse Machine (CAN Diagnostics)'
    ).toString().trim();

    const rawStartDate = getVal(columnMap.startDateKey, [
      'contractStartDate', 'start_date', 'Start Date', 'Contract Start', 'Start', 'StartDate', 'From', 'Begin Date', 'Effective'
    ]);

    const rawEndDate = getVal(columnMap.endDateKey, [
      'contractEndDate', 'end_date', 'End Date', 'Contract End', 'End', 'EndDate', 'To', 'Expiry', 'Expiration Date', 'Term End'
    ]);

    const rawBillingCycle = (
      getVal(columnMap.billingCycleKey, ['billingCycle', 'billing_cycle', 'Billing Cycle', 'Cycle', 'Frequency']) ??
      'Monthly'
    ).toString().trim();

    const rawRate = getVal(columnMap.rateKey, [
      'monthlyRate', 'monthly_rate', 'Rate', 'Monthly Rate', 'Price', 'Monthly Fee', 'Fee', 'Amount', 'Cost'
    ]);

    const rawAddons = (
      getVal(columnMap.addonsKey, ['addons', 'Addons', 'Options', 'Features']) ??
      ''
    ).toString().trim();

    const rawAddonFee = getVal(columnMap.addonFeeKey, ['addonFee', 'addon_fee', 'Addon Fee', 'Addon Rate']) ?? 0;

    const rawStatus = (
      getVal(columnMap.statusKey, ['status', 'Status', 'State', 'Machine Status']) ??
      'Active'
    ).toString().trim();

    const rawUptime = getVal(columnMap.uptimeKey, ['slaUptimePercent', 'uptime', 'Uptime', 'SLA', 'Availability']) ?? 99.95;

    const rawCustomer = (
      getVal(columnMap.customerKey, ['customerName', 'Customer', 'Company', 'Client', 'Organization', 'Account']) ??
      detectedCustomerName
    ).toString().trim();

    const rawSite = (
      getVal(columnMap.siteKey, ['siteLocation', 'Site', 'Location', 'Project Site', 'Project']) ??
      'Industrial Construction Project Site'
    ).toString().trim();

    // 1. DUPLICATION CHECK (Both IMEI and Asset ID)
    let isDuplicate = false;
    let cleanImei = rawImei.replace(/[^0-9]/g, '');
    if (!cleanImei) {
      cleanImei = `35${String(Math.floor(1000000000000 + Math.random() * 9000000000000))}`;
    }

    // Check if IMEI or Asset ID is duplicated in previous rows
    const duplicateImeiPrevRow = seenImeis.get(cleanImei);
    const duplicateAssetPrevRow = seenAssetIds.get(rawAssetId.toLowerCase());

    if (duplicateImeiPrevRow !== undefined || duplicateAssetPrevRow !== undefined) {
      isDuplicate = true;
      duplicatesFound++;
      const prevRow = duplicateImeiPrevRow ?? duplicateAssetPrevRow!;
      
      duplicateItems.push({
        assetId: rawAssetId,
        imei: cleanImei,
        rowNum: rowNum,
        duplicateOfRowNum: prevRow
      });

      corrections.push({
        id: `corr-${rowNum}-duplicate`,
        rowNumber: rowNum,
        assetId: rawAssetId,
        field: 'telematicsImei',
        originalValue: cleanImei,
        correctedValue: `${cleanImei} (DUPLICATE-QUARANTINED)`,
        reason: `DUPLICATION DETECTED: Asset or IMEI duplicated from Row #${prevRow}. Quarantined for $0 billing to prevent double-invoicing.`,
        ruleApplied: 'Fleet Deduplication Rule',
        excelFormulaTip: '=IF(COUNTIF($D$2:$D$100, D2)>1, "DUPLICATE", "UNIQUE")',
        confidence: 'High',
        applied: true
      });
    } else {
      seenImeis.set(cleanImei, rowNum);
      seenAssetIds.set(rawAssetId.toLowerCase(), rowNum);
    }

    // 2. Whitespace & Identifier Sanitization (silent clean without cluttering audit)
    let cleanAssetId = rawAssetId.trim();
    if (cleanAssetId.includes('  ') || /\s+/.test(cleanAssetId)) {
      cleanAssetId = cleanAssetId.replace(/\s+/g, '-');
    }

    // 3. Plan Tier Normalization
    let cleanTier: CleanedTelematicsRecord['planTier'] = 'Pulse Machine (CAN Diagnostics)';
    const lowerTier = rawPlanTier.toLowerCase();
    if (lowerTier.includes('spot') || lowerTier.includes('go') || lowerTier.includes('basic') || lowerTier.includes('track') || lowerTier.includes('location')) {
      cleanTier = 'Pulse Go (Asset Tracking)';
    } else if (lowerTier.includes('insight') || lowerTier.includes('manager') || lowerTier.includes('pro') || lowerTier.includes('intelligence') || lowerTier.includes('advanced')) {
      cleanTier = 'Pulse Insight (Fleet Intelligence)';
    } else if (lowerTier.includes('custom') || lowerTier.includes('oem')) {
      cleanTier = 'Custom Fleet Telematics';
    } else {
      cleanTier = 'Pulse Machine (CAN Diagnostics)';
    }

    if (rawPlanTier && rawPlanTier.trim() !== cleanTier && rawPlanTier.trim() !== '') {
      tierNamesStandardized++;
      corrections.push({
        id: `corr-${rowNum}-tier`,
        rowNumber: rowNum,
        assetId: cleanAssetId,
        field: 'planTier',
        originalValue: rawPlanTier,
        correctedValue: cleanTier,
        reason: `Aligned tier description to catalogue packaging standard (${cleanTier}).`,
        ruleApplied: 'Catalogue Packaging Standardizer',
        excelFormulaTip: '=IF(ISNUMBER(SEARCH("insight", E2)), "Pulse Insight", IF(ISNUMBER(SEARCH("go", E2)), "Pulse Go", "Pulse Machine"))',
        confidence: 'High',
        applied: true
      });
    }

    // 4. DATE PARSING & INVERTED DATE CHECK
    const parsedStart = parseFlexibleDate(rawStartDate);
    const parsedEnd = parseFlexibleDate(rawEndDate);
    let finalStartDate = parsedStart.dateStr;
    let finalEndDate = parsedEnd.dateStr;

    // CRITICAL DATE INVERSION GUARD:
    // If End Date < Start Date (e.g. Start: 2026-11-01, End: 2025-11-01 or inverted day/month)
    const startTime = new Date(finalStartDate).getTime();
    const endTime = new Date(finalEndDate).getTime();

    if (!isNaN(startTime) && !isNaN(endTime) && endTime < startTime) {
      invertedDatesFixed++;
      const originalStart = finalStartDate;
      const originalEnd = finalEndDate;
      finalStartDate = originalEnd;
      finalEndDate = originalStart;

      invertedDateItems.push({
        assetId: cleanAssetId,
        assetName: rawAssetName,
        originalStart,
        originalEnd,
        swappedStart: finalStartDate,
        swappedEnd: finalEndDate
      });

      corrections.push({
        id: `corr-${rowNum}-inverted-dates`,
        rowNumber: rowNum,
        assetId: cleanAssetId,
        field: 'contractDates',
        originalValue: `Start: ${originalStart} | End: ${originalEnd}`,
        correctedValue: `Start: ${finalStartDate} | End: ${finalEndDate}`,
        reason: 'CRITICAL REVERSAL: Inverted contract dates detected (End Date preceded Start Date). Swapped chronological timestamps.',
        ruleApplied: 'Chronological Inversion Guard',
        excelFormulaTip: '=IF(D2<C2, D2, C2) [for Start Date] & =IF(D2<C2, C2, D2) [for End Date]',
        confidence: 'High',
        applied: true
      });
    }

    // 5. Billing Cycle & Monthly Rate Sanitization
    let cleanCycle: 'Monthly' | 'Annual' = 'Monthly';
    if (rawBillingCycle.toLowerCase().includes('ann') || rawBillingCycle.toLowerCase().includes('year')) {
      cleanCycle = 'Annual';
    }

    let cleanRate = 0;
    if (typeof rawRate === 'number') {
      cleanRate = Math.abs(rawRate);
    } else if (rawRate !== undefined && rawRate !== null) {
      const numStr = String(rawRate).replace(/[^0-9.-]/g, '');
      cleanRate = Math.abs(parseFloat(numStr) || 0);
    }

    // If rate is 0, negative, or not provided, pull from STANDARD_TIER_RATES
    if (cleanRate <= 0 || String(rawRate).includes('-') || isNaN(cleanRate)) {
      ratesRectified++;
      const tierConf = STANDARD_TIER_RATES[cleanTier];
      let standardRate = tierConf.monthlyUSD;
      if (detectedCurrency === 'DKK') standardRate = tierConf.monthlyDKK;
      else if (detectedCurrency === 'EUR') standardRate = tierConf.monthlyEUR;

      corrections.push({
        id: `corr-${rowNum}-rate`,
        rowNumber: rowNum,
        assetId: cleanAssetId,
        field: 'monthlyRate',
        originalValue: String(rawRate ?? '[EMPTY]'),
        correctedValue: standardRate.toFixed(2),
        reason: `Rectified non-positive or missing rate using standard ${cleanTier} catalogue pricing.`,
        ruleApplied: 'Negative/Zero Rate Rectification',
        excelFormulaTip: '=IF(F2<=0, VLOOKUP(E2, PricingTable, 2, FALSE), F2)',
        confidence: 'High',
        applied: true
      });
      cleanRate = standardRate;
    }

    // 6. Status Sanitization
    let cleanStatus: 'Active' | 'Suspended' | 'Decommissioned' = 'Active';
    const lowerStatus = rawStatus.toLowerCase();
    if (lowerStatus.includes('susp') || lowerStatus.includes('pause') || lowerStatus.includes('dormant') || lowerStatus.includes('standby')) {
      cleanStatus = 'Suspended';
    } else if (lowerStatus.includes('decom') || lowerStatus.includes('retire') || lowerStatus.includes('cancel') || lowerStatus.includes('off') || lowerStatus.includes('scrap')) {
      cleanStatus = 'Decommissioned';
    } else {
      cleanStatus = 'Active';
    }

    // 7. SLA Uptime Sanitization
    let cleanUptime = typeof rawUptime === 'number' ? rawUptime : parseFloat(String(rawUptime).replace(/[^0-9.]/g, ''));
    if (isNaN(cleanUptime) || cleanUptime > 100 || cleanUptime < 0) {
      cleanUptime = 99.95;
    }

    // 8. Addons Fee Sanitization
    let cleanAddonFee = typeof rawAddonFee === 'number' ? rawAddonFee : parseFloat(String(rawAddonFee).replace(/[^0-9.]/g, '')) || 0;
    cleanAddonFee = Math.max(0, cleanAddonFee);

    // Parse Addons array
    const addonsArray = rawAddons
      ? rawAddons.split(/[,;+]/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    cleanedRecords.push({
      id: `rec-${rowNum}-${cleanAssetId}`,
      rowNumber: rowNum,
      assetId: cleanAssetId,
      assetName: rawAssetName,
      equipmentType: rawEquipmentType,
      telematicsImei: cleanImei,
      serialNumber: rawSerial || `SN-${cleanAssetId}`,
      planTier: cleanTier,
      contractStartDate: finalStartDate,
      contractEndDate: finalEndDate,
      billingCycle: cleanCycle,
      baseMonthlyRate: cleanRate,
      addons: addonsArray,
      addonMonthlyFee: cleanAddonFee,
      status: cleanStatus,
      slaUptimePercent: cleanUptime,
      customerName: rawCustomer || detectedCustomerName,
      siteLocation: rawSite,
      isDuplicate,
      currency: detectedCurrency
    });
  });

  // Build Human-Readable Highlights for Notification
  const highlights: string[] = [];
  if (invertedDatesFixed > 0) {
    highlights.push(`Rectified ${invertedDatesFixed} inverted contract date range(s) where End Date preceded Start Date.`);
  }
  if (duplicatesFound > 0) {
    highlights.push(`Quarantined ${duplicatesFound} duplicate telematics IMEI(s)/Asset(s) for $0 billing to eliminate double charging.`);
  }
  if (ratesRectified > 0) {
    highlights.push(`Normalized ${ratesRectified} non-standard or missing subscription rates to current catalogue standard.`);
  }
  if (tierNamesStandardized > 0) {
    highlights.push(`Standardized ${tierNamesStandardized} packaging tier descriptions to official telematics tiers.`);
  }
  highlights.push(`Ingested and verified customer account: "${detectedCustomerName}" in ${detectedCurrency}.`);

  return {
    cleanedRecords,
    corrections,
    duplicatesFound,
    auditSummary: {
      totalRowsProcessed: rawRows.length,
      validRows: cleanedRecords.length,
      correctionsCount: corrections.length,
      invertedDatesFixed,
      duplicatesQuarantined: duplicatesFound,
      ratesRectified,
      tierNamesStandardized,
      detectedCurrency,
      customerName: detectedCustomerName,
      fileName,
      summaryHighlights: highlights,
      invertedDateItems,
      duplicateItems
    }
  };
}
