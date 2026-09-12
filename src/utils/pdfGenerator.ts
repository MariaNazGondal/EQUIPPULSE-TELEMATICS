import jsPDF from 'jspdf';
import { LedgerItem, InvoiceMetadata, TermsAndConditionsConfig, SupportedCurrency } from '../types/telematics';
import { formatCurrency } from './currency';

export function generatePdfReceipt(
  meta: InvoiceMetadata | undefined,
  ledgerItems: LedgerItem[],
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
  },
  config: TermsAndConditionsConfig,
  auditChecksum: string = '',
  currency: SupportedCurrency = 'USD'
): { success: boolean; blobUrl?: string } {
  try {
    const safeMeta: InvoiceMetadata = {
      invoiceNumber: meta?.invoiceNumber || 'INV-EP-2026-0941',
      invoiceDate: meta?.invoiceDate || '2026-09-11',
      dueDate: meta?.dueDate || '2026-10-11',
      customerName: meta?.customerName || 'Beta Industries',
      customerAddress: meta?.customerAddress || '742 Industrial Pkwy, Construction Bay 8',
      customerEmail: meta?.customerEmail || 'ap@betaindustries.com',
      customerTaxId: meta?.customerTaxId || 'US-EIN-94-3829104',
      projectSite: meta?.projectSite || 'Construction Fleet Site',
      paymentTerms: meta?.paymentTerms || 'Net 30 Days via Corporate ACH or Wire',
      notes: meta?.notes || 'Telematics subscription charges calculated under EquipPulse Master SLA and Terms of Service.'
    };

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 14;

    // 1. Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 36, 'F');

    // Accent Line
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 36, pageWidth, 2.5, 'F');

    // Brand Name & Mission
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('EQUIPPULSE TELEMATICS', margin, 17);

    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CONNECTING CONSTRUCTION TO ELIMINATE DOWNTIME', margin, 23);

    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Fleet Connectivity & Telematics Subscription Billing Ledger', margin, 29);

    // Right Side: Invoice Number, Date, Currency
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`INVOICE: ${safeMeta.invoiceNumber}`, pageWidth - margin, 15, { align: 'right' });

    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Date: ${safeMeta.invoiceDate}`, pageWidth - margin, 21, { align: 'right' });
    doc.text(`Payment Due: ${safeMeta.dueDate}`, pageWidth - margin, 26, { align: 'right' });

    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Currency: ${currency}`, pageWidth - margin, 31, { align: 'right' });

    y = 44;

    // 2. Billing & Customer Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 32, 2, 2, 'S');

    // Billed To (Client Account)
    doc.setTextColor(217, 119, 6); // amber-600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('BILLED TO (CUSTOMER ACCOUNT):', margin + 5, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(safeMeta.customerName || 'Beta Industries', margin + 5, y + 13);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Project Site: ${safeMeta.projectSite || 'Construction Fleet Site'}`, margin + 5, y + 19);
    doc.text(`Address: ${safeMeta.customerAddress || 'Operational Yard & Regional Office'}`, margin + 5, y + 24);
    doc.text(`Account ID: ${safeMeta.customerTaxId || 'CUST-BETA-091'} | Email: ${safeMeta.customerEmail || 'ap@betaindustries.com'}`, margin + 5, y + 29);

    // Issued By
    const rightColX = pageWidth / 2 + 10;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ISSUED BY:', rightColX, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('EquipPulse Telematics Solutions Inc.', rightColX, y + 13);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Industrial Parkway, Suite 400', rightColX, y + 19);
    doc.text('Tax ID: US-EIN-88-2940192 • Support: +1 (800) 555-PULSE', rightColX, y + 24);
    doc.text('Email: billing@equippulse-telematics.com', rightColX, y + 29);

    y += 37;

    // 3. Itemized Equipment Table Header
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 7.5, 1, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);

    const colAsset = margin + 3;
    const colName = margin + 25;
    const colImei = margin + 65;
    const colTier = margin + 98;
    const colRate = margin + 130;
    const colCredit = margin + 152;
    const colTotal = pageWidth - margin - 3;

    doc.text('ASSET ID', colAsset, y + 5);
    doc.text('EQUIPMENT / MODEL', colName, y + 5);
    doc.text('TELEMATICS IMEI', colImei, y + 5);
    doc.text('PLAN TIER', colTier, y + 5);
    doc.text('BASE', colRate, y + 5, { align: 'right' });
    doc.text('SLA CREDIT', colCredit, y + 5, { align: 'right' });
    doc.text('NET DUE', colTotal, y + 5, { align: 'right' });

    y += 8.5;

    // 4. Rows (render up to max rows that fit cleanly)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const maxItems = Math.min(ledgerItems.length, 14);

    for (let i = 0; i < maxItems; i++) {
      const item = ledgerItems[i];
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, pageWidth - (margin * 2), 6.5, 'F');
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(item.assetId.substring(0, 10), colAsset, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.text(item.assetName.substring(0, 22), colName, y + 4.5);

      doc.setTextColor(71, 85, 105);
      doc.text(item.telematicsImei.substring(0, 15), colImei, y + 4.5);

      const tierShort = item.planTier.replace('Pulse ', '').substring(0, 14);
      doc.text(tierShort, colTier, y + 4.5);

      doc.setTextColor(15, 23, 42);
      doc.text(formatCurrency(item.baseRate, currency), colRate, y + 4.5, { align: 'right' });

      if (item.slaCreditAmount > 0) {
        doc.setTextColor(225, 29, 72);
        doc.text(`-${formatCurrency(item.slaCreditAmount, currency)}`, colCredit, y + 4.5, { align: 'right' });
      } else {
        doc.setTextColor(148, 163, 184);
        doc.text('$0.00', colCredit, y + 4.5, { align: 'right' });
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.finalAmountDue, currency), colTotal, y + 4.5, { align: 'right' });

      y += 6.5;
    }

    if (ledgerItems.length > maxItems) {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text(`... and ${ledgerItems.length - maxItems} additional machinery assets itemized in full ledger database.`, margin + 3, y + 4);
      y += 6;
    }

    // 5. Summary Section & Remittance Box
    const summaryBoxY = Math.max(y + 3, pageHeight - 65);
    const summaryBoxWidth = 72;
    const summaryBoxX = pageWidth - margin - summaryBoxWidth;

    // Right Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 44, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 44, 2, 2, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    doc.text('Gross Telematics Subtotal:', summaryBoxX + 4, summaryBoxY + 6);
    doc.text(formatCurrency(subtotals.grossSum, currency), pageWidth - margin - 4, summaryBoxY + 6, { align: 'right' });

    doc.setTextColor(225, 29, 72);
    doc.text('SLA Downtime Deductions:', summaryBoxX + 4, summaryBoxY + 12);
    doc.text(`-${formatCurrency(subtotals.slaCreditsSum, currency)}`, pageWidth - margin - 4, summaryBoxY + 12, { align: 'right' });

    doc.setTextColor(217, 119, 6);
    doc.text(`Volume Discount (${config.fleetVolumeDiscountPercent}%):`, summaryBoxX + 4, summaryBoxY + 18);
    doc.text(`-${formatCurrency(subtotals.volumeDiscountsSum, currency)}`, pageWidth - margin - 4, summaryBoxY + 18, { align: 'right' });

    doc.setTextColor(71, 85, 105);
    doc.text(`Estimated Tax/VAT (${config.taxRatePercent}%):`, summaryBoxX + 4, summaryBoxY + 24);
    doc.text(`+${formatCurrency(subtotals.taxSum, currency)}`, pageWidth - margin - 4, summaryBoxY + 24, { align: 'right' });

    // Highlighted TOTAL AMOUNT DUE Bar
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(summaryBoxX, summaryBoxY + 28, summaryBoxWidth, 16, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.6);
    doc.rect(summaryBoxX, summaryBoxY + 28, summaryBoxWidth, 16, 'S');

    doc.setTextColor(120, 53, 15); // amber-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TOTAL AMOUNT DUE:', summaryBoxX + 4, summaryBoxY + 34);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(formatCurrency(subtotals.finalDueSum, currency), pageWidth - margin - 4, summaryBoxY + 41, { align: 'right' });

    // Left Box: HOW TO PAY / REMITTANCE INSTRUCTIONS
    const leftBoxWidth = summaryBoxX - margin - 5;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, summaryBoxY, leftBoxWidth, 44, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, summaryBoxY, leftBoxWidth, 44, 2, 2, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('HOW TO PAY (BANK REMITTANCE INSTRUCTIONS):', margin + 4, summaryBoxY + 6);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.text(`Beneficiary: EquipPulse Telematics Solutions Inc.`, margin + 4, summaryBoxY + 11);
    doc.text('Bank: JPMorgan Chase NA (Global Industrial Banking)', margin + 4, summaryBoxY + 16);
    doc.text('ACH Routing: 111000614 | Swift/BIC: CHASUS33XXX', margin + 4, summaryBoxY + 21);
    doc.text('Account #: 89401928410 | Payment Terms: Net 30 Days', margin + 4, summaryBoxY + 26);
    doc.text(`Reference: ${safeMeta.invoiceNumber} / ${safeMeta.customerName || 'Beta Industries'}`, margin + 4, summaryBoxY + 31);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(`Dual-Checksum Audit Verification: ${auditChecksum.substring(0, 36)}...`, margin + 4, summaryBoxY + 38);

    // 6. Bottom Footer
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 9, pageWidth, 9, 'F');

    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(
      'EquipPulse Telematics • Connecting construction to eliminate downtime • Official Telematics Subscription Receipt',
      pageWidth / 2,
      pageHeight - 3.5,
      { align: 'center' }
    );

    // Save with resilient dual fallback
    const safeCustomer = (safeMeta.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `EquipPulse_Receipt_${safeCustomer}_${safeMeta.invoiceNumber || 'INV'}.pdf`;

    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // Try download trigger
    try {
      doc.save(filename);
    } catch (saveErr) {
      console.warn('doc.save was prevented, using URL trigger fallback:', saveErr);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1000);
    }

    return { success: true, blobUrl };
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    return { success: false };
  }
}
