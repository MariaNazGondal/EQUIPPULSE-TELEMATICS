export interface FormulaGuideItem {
  id: string;
  category: 'Date Correction' | 'Deduplication' | 'Text & Whitespace Cleaning' | 'Telematics & IMEI Validation' | 'Contract & SLA Calculation';
  title: string;
  problem: string;
  excelFormula: string;
  sheetsFormula: string;
  explanation: string;
  exampleInput: string;
  exampleOutput: string;
}

export const SPREADSHEET_FORMULA_GUIDE: FormulaGuideItem[] = [
  {
    id: 'invert-fix',
    category: 'Date Correction',
    title: 'Fix Inverted Dates (End Date Earlier Than Start Date)',
    problem: 'End Date was entered earlier than Start Date due to human error or reversed copy-paste.',
    excelFormula: '=IF(D2<C2, D2, C2) [for Start Date] and =IF(D2<C2, C2, D2) [for End Date]',
    sheetsFormula: '=IF(D2<C2, {D2, C2}, {C2, D2})',
    explanation: 'Evaluates if date in column D is chronologically before column C. If true, swaps both timestamps automatically so Start Date is strictly earlier than End Date.',
    exampleInput: 'Start: 2026-11-01, End: 2025-11-01',
    exampleOutput: 'Start: 2025-11-01, End: 2026-11-01'
  },
  {
    id: 'text-to-iso-date',
    category: 'Date Correction',
    title: 'Convert European/Text Dates (DD/MM/YYYY) to Standard ISO Date',
    problem: 'Dates entered with slashes or inconsistent text string format like "15/01/2026".',
    excelFormula: '=DATE(RIGHT(C2,4), MID(C2,4,2), LEFT(C2,2))',
    sheetsFormula: '=DATEVALUE(REGEXREPLACE(C2, "(\\d{2})/(\\d{2})/(\\d{4})", "$3-$2-$1"))',
    explanation: 'Deconstructs the day, month, and 4-digit year tokens and reconstructs them into an authentic numeric date cell in YYYY-MM-DD format.',
    exampleInput: '" 15/01/2026 "',
    exampleOutput: '2026-01-15'
  },
  {
    id: 'edate-annual-renewal',
    category: 'Date Correction',
    title: 'Auto-Compute Standard 12-Month Telematics Contract Expiry',
    problem: 'Contract end date is missing or inconsistent with standard 12-month minimum commitment.',
    excelFormula: '=EDATE(C2, 12) - 1',
    sheetsFormula: '=EDATE(C2, 12) - 1',
    explanation: 'Uses the EDATE function to add exactly 12 calendar months to the start date and subtracts 1 day to mark the exact annual anniversary eve.',
    exampleInput: '2025-10-15',
    exampleOutput: '2026-10-14'
  },
  {
    id: 'trim-clean',
    category: 'Text & Whitespace Cleaning',
    title: 'Remove Ghost Spaces, Tabs, and Non-Breaking Spaces',
    problem: 'Trailing whitespace and non-breaking space characters (ASCII 160) from ERP/CSV exports causing VLOOKUP and matching failures.',
    excelFormula: '=TRIM(CLEAN(SUBSTITUTE(A2, CHAR(160), " ")))',
    sheetsFormula: '=TRIM(CLEAN(SUBSTITUTE(A2, CHAR(160), " ")))',
    explanation: 'SUBSTITUTE removes web non-breaking spaces; CLEAN strips non-printable ASCII characters; TRIM removes leading, trailing, and duplicate interior spaces.',
    exampleInput: '"  Trackunit Raw  "',
    exampleOutput: '"Trackunit Raw"'
  },
  {
    id: 'dup-flag',
    category: 'Deduplication',
    title: 'Flag Duplicate Telematics Device IMEIs or Serial Numbers',
    problem: 'Multiple rows with the same hardware telematics unit causing double billing.',
    excelFormula: '=IF(COUNTIF($D$2:$D$100, D2)>1, "DUPLICATE IMEI - REVIEW", "OK")',
    sheetsFormula: '=IF(COUNTIF(D$2:D, D2)>1, "DUPLICATE", "OK")',
    explanation: 'Scans the entire telematics IMEI column range. If the IMEI occurs more than once, flags the duplicate row instantly for consolidation.',
    exampleInput: 'IMEI 352940182940192 appears in row 4 and row 5',
    exampleOutput: '"DUPLICATE IMEI - REVIEW"'
  },
  {
    id: 'unique-filter',
    category: 'Deduplication',
    title: 'Extract Distinct Error-Free Fleet Master Records',
    problem: 'Need to create a sanitized duplicate-free master list in a separate tab.',
    excelFormula: '=UNIQUE(A2:N100)',
    sheetsFormula: '=UNIQUE(FILTER(A2:N, A2:A<>""))',
    explanation: 'Spills only the unique combination of columns, stripping all identical duplicate rows.',
    exampleInput: 'Table with 15 rows containing 1 duplicate row',
    exampleOutput: 'Sanitized table with 14 unique records'
  },
  {
    id: 'imei-validation',
    category: 'Telematics & IMEI Validation',
    title: 'Validate 15-Digit Telematics Hardware IMEI Format',
    problem: 'Accidental scientific notation (e.g., 3.55E+14) or corrupted truncated hardware serial numbers.',
    excelFormula: '=IF(AND(ISNUMBER(VALUE(D2)), LEN(TEXT(D2,"0"))=15), "VALID_IMEI", "INVALID_FORMAT")',
    sheetsFormula: '=IF(REGEXMATCH(TO_TEXT(D2), "^\\d{15}$"), "VALID_IMEI", "INVALID_FORMAT")',
    explanation: 'Verifies the telematics modem identifier consists of exactly 15 numeric digits without scientific rounding.',
    exampleInput: '354892091823901 vs 35489',
    exampleOutput: '"VALID_IMEI" vs "INVALID_FORMAT"'
  },
  {
    id: 'sla-credit-calc',
    category: 'Contract & SLA Calculation',
    title: 'Automate Trackunit SLA Uptime Credit Calculation',
    problem: 'Calculating contractually mandated SLA penalty credits based on monthly uptime percentage.',
    excelFormula: '=IFS(M2>=99.9, 0, M2>=99.0, 0.10*I2, M2>=95.0, 0.25*I2, TRUE, 0.50*I2)',
    sheetsFormula: '=IFS(M2>=99.9, 0, M2>=99.0, 0.10*I2, M2>=95.0, 0.25*I2, TRUE, 0.50*I2)',
    explanation: 'Checks uptime in column M: if >= 99.9% credit is $0; if 99.0%-99.89% applies 10% credit; if 95.0%-98.99% applies 25% credit; if < 95% applies 50% credit.',
    exampleInput: 'Uptime: 98.80%, Base Rate: $16.00',
    exampleOutput: '$4.00 SLA Credit (Net: $12.00)'
  }
];

export const TELEMATICS_DATA_HYGIENE_TIPS = [
  {
    title: 'Always Store IMEIs as Text (Never Scientific Numbers)',
    description: '15-digit cellular telematics IMEIs (e.g. 354892091823901) exceed standard 64-bit IEEE float precision in Excel. Prefix with an apostrophe (\') or format as Text to prevent digit truncation.'
  },
  {
    title: 'ISO 8601 (YYYY-MM-DD) Standard Eliminates Inversion',
    description: 'Never use ambiguous slashes like 04/05/2026 which could mean April 5 (US) or May 4 (Europe). Enforcing YYYY-MM-DD in both ERP and field spreadsheets guarantees zero date inversion.'
  },
  {
    title: 'Map CAN-Bus Engine Hours vs Telematics Unit Hours',
    description: 'Ensure your fleet ledger differentiates between machine odometer/hour-meter readings (from OEM CAN bus J1939) and telematics GPS powered hours.'
  },
  {
    title: 'Track Decommissioning & Transfer Cutoff Dates',
    description: 'When equipment is sold, off-hired, or relocated, log the official off-board date immediately. Trackunit SLA terms waive fees if decommission notice is received before the 15th of the billing month.'
  },
  {
    title: 'Automate Luhn Checksum on Cellular SIM / IMEI Numbers',
    description: 'Telematics modems follow the standard 15-digit 3GPP IMEI standard with a Luhn check digit. Implement formula checks before importing bulk carrier data.'
  }
];
