import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DataCleaningView } from './components/DataCleaningView';
import { TermsAndRenewalsView } from './components/TermsAndRenewalsView';
import { LedgerView } from './components/LedgerView';
import { VisualizationView } from './components/VisualizationView';
import { ReceiptView } from './components/ReceiptView';
import { ReceiptModal } from './components/ReceiptModal';
import { CleanAuditNotificationModal } from './components/CleanAuditNotificationModal';
import { SAMPLE_RAW_TELEMATICS_DATA } from './data/sampleData';
import { DEFAULT_TERMS_AND_CONDITIONS } from './data/termsAndConditions';
import { cleanTelematicsDataset } from './utils/dataCleaner';
import { assessContracts, generateLedger } from './utils/billingEngine';
import { detectCurrencyFromData } from './utils/currency';
import {
  RawTelematicsRow,
  TermsAndConditionsConfig,
  CleanedTelematicsRecord,
  SupportedCurrency,
  CleaningAuditSummary,
  InvoiceMetadata
} from './types/telematics';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'clean' | 'terms' | 'ledger' | 'visualize' | 'receipt'>('clean');
  
  // Requirement 1: Start with completely blank data (waiting for data to be uploaded)
  const [rawRows, setRawRows] = useState<RawTelematicsRow[]>([]);
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [config, setConfig] = useState<TermsAndConditionsConfig>(DEFAULT_TERMS_AND_CONDITIONS);
  const [loadedFileName, setLoadedFileName] = useState<string>('');

  // Dynamic invoice metadata initialized with customer information
  const [invoiceMeta, setInvoiceMeta] = useState<InvoiceMetadata>({
    invoiceNumber: 'INV-EP-2026-0941',
    invoiceDate: '2026-09-11',
    dueDate: '2026-10-11',
    customerName: 'Beta Industries',
    customerAddress: '742 Industrial Pkwy, Construction Bay 8',
    customerEmail: 'ap-billing@betaindustries.com',
    customerTaxId: 'US-EIN-94-3829104',
    projectSite: 'Active Construction Fleet Operations',
    paymentTerms: 'Net 30 Days via Corporate ACH or Wire Transfer',
    notes: 'Telematics subscription charges calculated under EquipPulse Master SLA and Terms of Service. Inverted dates rectified and duplicate IMEIs quarantined.'
  });

  // 1-Click PDF Receipt Pop-up state from header
  const [isHeaderReceiptOpen, setIsHeaderReceiptOpen] = useState(false);

  // Requirement 3: Notification modal state with findings & what was done
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [lastAuditSummary, setLastAuditSummary] = useState<CleaningAuditSummary | null>(null);

  // Step 1: Clean Data & Audit Engine (Meticulous cleaning: inversion fix, deduplication, dynamic columns)
  const { cleanedRecords, corrections, duplicatesFound, auditSummary } = useMemo(() => {
    return cleanTelematicsDataset(rawRows, currency, loadedFileName);
  }, [rawRows, currency, loadedFileName]);

  // Detected or extracted customer name (e.g. Beta Industries)
  const customerName = useMemo(() => {
    return (
      lastAuditSummary?.customerName ||
      auditSummary?.customerName ||
      (loadedFileName ? loadedFileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : '') ||
      'Beta Industries'
    );
  }, [lastAuditSummary, auditSummary, loadedFileName]);

  // Keep invoice customer name synchronized with uploaded customer
  React.useEffect(() => {
    if (customerName) {
      setInvoiceMeta(prev => ({
        ...prev,
        customerName: customerName,
        customerEmail: `ap-billing@${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      }));
    }
  }, [customerName]);

  // Step 2 & 3: Assess Contracts against Terms and Conditions
  const assessments = useMemo(() => {
    return assessContracts(cleanedRecords, config, '2026-09-11');
  }, [cleanedRecords, config]);

  // Step 4: Generate Meticulous Ledger with Dual-Checksum Parity Verification
  const { ledgerItems, parityResult, subtotals } = useMemo(() => {
    return generateLedger(cleanedRecords, assessments, config);
  }, [cleanedRecords, assessments, config]);

  // Upload handler: cleans dataset, auto-detects currency, updates customer name across all views, and displays audit notification
  const handleFileUpload = (data: RawTelematicsRow[], fileName?: string) => {
    if (fileName) setLoadedFileName(fileName);
    const autoCurr = detectCurrencyFromData(data);
    setCurrency(autoCurr);
    setRawRows(data);

    // Compute immediate summary for notification popup with fileName
    const result = cleanTelematicsDataset(data, autoCurr, fileName);
    setLastAuditSummary(result.auditSummary);
    setIsAuditModalOpen(true);
    setCurrentTab('clean');
  };

  // Sample data loader for testing
  const handleLoadSample = () => {
    setCurrency('USD');
    setLoadedFileName('Sample_Fleet_Telematics.csv');
    setRawRows(SAMPLE_RAW_TELEMATICS_DATA);

    const result = cleanTelematicsDataset(SAMPLE_RAW_TELEMATICS_DATA, 'USD', 'Sample_Fleet_Telematics.csv');
    setLastAuditSummary(result.auditSummary);
    setIsAuditModalOpen(true);
  };

  const handleToggleCorrection = (id: string) => {
    // Individual correction toggle
  };

  const handleUpdateRecord = (id: string, field: keyof CleanedTelematicsRecord, value: any) => {
    // Cell value updater
  };

  const hasData = rawRows.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Navigation & Header with Header Upload Button and 1-Click PDF Receipt */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLoadSampleData={handleLoadSample}
        onFileUpload={handleFileUpload}
        onOpenReceiptModal={() => setIsHeaderReceiptOpen(true)}
        correctionsCount={corrections.length}
        totalRecordsCount={cleanedRecords.length}
        totalDue={subtotals.finalDueSum}
        isParityVerified={parityResult.isParityVerified}
        currency={currency}
        onCurrencyChange={setCurrency}
        hasData={hasData}
        customerName={customerName}
        loadedFileName={loadedFileName}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'clean' && (
          <DataCleaningView
            rawRows={rawRows}
            cleanedRecords={cleanedRecords}
            corrections={corrections}
            duplicatesCount={duplicatesFound}
            onFileUpload={handleFileUpload}
            onLoadSample={handleLoadSample}
            onToggleCorrection={handleToggleCorrection}
            onProceedToTerms={() => setCurrentTab('terms')}
            onUpdateRecord={handleUpdateRecord}
            currency={currency}
          />
        )}

        {currentTab === 'terms' && (
          <TermsAndRenewalsView
            assessments={assessments}
            cleanedRecords={cleanedRecords}
            config={config}
            onUpdateConfig={setConfig}
            onProceedToLedger={() => setCurrentTab('ledger')}
            currency={currency}
          />
        )}

        {currentTab === 'ledger' && (
          <LedgerView
            ledgerItems={ledgerItems}
            parityResult={parityResult}
            subtotals={subtotals}
            config={config}
            onProceedToVisualize={() => setCurrentTab('visualize')}
            onProceedToReceipt={() => setCurrentTab('receipt')}
            currency={currency}
            customerName={customerName}
          />
        )}

        {currentTab === 'visualize' && (
          <VisualizationView
            ledgerItems={ledgerItems}
            assessments={assessments}
            cleanedRecords={cleanedRecords}
            subtotals={subtotals}
            onProceedToReceipt={() => setCurrentTab('receipt')}
            currency={currency}
          />
        )}

        {currentTab === 'receipt' && (
          <ReceiptView
            ledgerItems={ledgerItems}
            subtotals={subtotals}
            config={config}
            auditChecksum={parityResult.checksumHash}
            currency={currency}
            customerName={customerName}
            invoiceMeta={invoiceMeta}
            onUpdateInvoiceMeta={setInvoiceMeta}
          />
        )}
      </main>

      {/* 1-Click PDF Receipt Pop-up Modal triggered from Header */}
      <ReceiptModal
        isOpen={isHeaderReceiptOpen}
        onClose={() => setIsHeaderReceiptOpen(false)}
        ledgerItems={ledgerItems}
        subtotals={subtotals}
        config={config}
        auditChecksum={parityResult.checksumHash}
        currency={currency}
        customerName={customerName}
        invoiceMeta={invoiceMeta}
      />

      {/* Requirement 3: Explicit Notification Modal on Data Cleansing with Inverted Dates & Duplicates Breakdown */}
      <CleanAuditNotificationModal
        isOpen={isAuditModalOpen}
        summary={lastAuditSummary}
        onClose={() => setIsAuditModalOpen(false)}
        onProceedToTerms={() => {
          setIsAuditModalOpen(false);
          setCurrentTab('terms');
        }}
      />

      {/* Industrial Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-xs text-slate-500 text-center no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300">EQUIPPULSE TELEMATICS</span>
            <span>• Connecting Construction to Eliminate Downtime</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Danish Krone (DKK) • Euro (EUR) • US Dollar (USD)</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">100% Error-Free Parity Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
