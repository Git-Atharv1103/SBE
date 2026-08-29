/**
 * Shree Balaji Enterprises — Professional Customer-Facing Quotation & Bill Generator
 * 
 * SPECIFICATIONS:
 * - A4 Portrait format (210mm x 297mm) with proper 16mm margins (178mm printable content width).
 * - Full Unicode font support (Roboto Regular & Bold) for flawless Indian Rupee (₹) rendering.
 * - Customer-facing quotation table contains ONLY: | Sr. No. | Counter Name | Qty | Amount (₹) |
 * - NEVER includes internal material calculations, weights, rates, labor, or markup percentages.
 * - Dynamic estimate numbers, client names, counter names, quantities, and selling prices.
 * - Indian number formatting (e.g. ₹ 16,565.16) and Indian currency words conversion.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { registerFonts } from './fonts/roboto.js';
import { COMPANY_DETAILS, DEFAULT_TERMS_AND_CONDITIONS } from './constants.js';
import { calculateEstimate, formatCurrency, numberToWords } from './calculations.js';

/**
 * Formats a sanitized and safe quotation PDF filename
 * Format: <Client Name> - <Estimate Number>.pdf
 * @param {string} customerName 
 * @param {string} estimateNumber 
 * @returns {string} Safe PDF filename (e.g. "ABC Hotel - EST 01.pdf")
 */
export function getQuotationFileName(customerName, estimateNumber) {
  const rawCustomer = (customerName || '').trim() || 'Customer';
  const rawEstNum = (estimateNumber || 'EST 01').trim();

  // Sanitize Windows invalid filename characters: < > : " / \ | ? *
  const cleanCustomer = rawCustomer
    .replace(/[/\\]+/g, ' - ')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanEstNum = rawEstNum
    .replace(/[/\\]+/g, ' - ')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `${cleanCustomer} - ${cleanEstNum}.pdf`;
}

/**
 * Helper to format currency numbers to Indian format with ₹ symbol
 * @param {number|string} amount 
 * @returns {string} e.g. "₹ 16,565.16"
 */
function formatRupee(amount) {
  const val = parseFloat(amount) || 0;
  return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generate Professional Customer-Facing A4 Quotation PDF for Shree Balaji Enterprises
 * @param {Object} estimateData - Full estimate project object
 * @param {Object} [options]
 * @param {boolean} [options.shouldPrint=false] - Whether to trigger browser print dialog
 * @returns {jsPDF} Generated jsPDF instance
 */
export function generateQuotationPDF(estimateData, options = {}) {
  const { shouldPrint = false } = options;

  // Initialize A4 Portrait Document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Register Unicode Roboto Fonts (Supports Indian Rupee Symbol ₹)
  registerFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16; // 16mm Left and Right Margin
  const topMargin = 13; // 13mm Top Margin
  const bottomMargin = 15; // 15mm Bottom Margin
  const contentWidth = pageWidth - (margin * 2); // 178mm Content Width

  // Flatten material items to run accurate internal calculation if needed
  const sheets = Array.isArray(estimateData.sheets) ? estimateData.sheets : [];
  const pipes = Array.isArray(estimateData.pipes) ? estimateData.pipes : [];
  const angles = Array.isArray(estimateData.angles) ? estimateData.angles : [];
  const purchased = Array.isArray(estimateData.purchased) ? estimateData.purchased : [];
  const compressor = Array.isArray(estimateData.compressor) ? estimateData.compressor : [];
  const allRows = [...sheets, ...pipes, ...angles, ...purchased, ...compressor];

  // Master Universal Calculation
  const calculation = calculateEstimate({
    materials: allRows,
    totalMaterialWeight: estimateData.totalMaterialWeight,
    materialRate: estimateData.materialRate,
    sheetRate: estimateData.sheetRate,
    pipeRate: estimateData.pipeRate,
    angleRate: estimateData.angleRate,
    labourRate: estimateData.labourRate,
    labourCost: estimateData.labourCost,
    sellingPercentage: estimateData.sellingPercentage,
    counterQuantity: estimateData.counterQuantity,
    discount: estimateData.discount,
    gst: estimateData.gst
  });

  const estNumber = (estimateData.estimateNumber || estimateData.projectNumber || 'EST 01').trim();
  
  // Format Date (DD/MM/YYYY)
  let estDate = '';
  if (estimateData.date) {
    try {
      const d = new Date(estimateData.date);
      if (!isNaN(d.getTime())) {
        estDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    } catch {
      estDate = '';
    }
  }
  if (!estDate) {
    estDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  let currentY = topMargin;

  // -------------------------------------------------------------
  // 1. TOP HEADER SECTION
  // -------------------------------------------------------------
  // Header Accent Top Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, contentWidth, 1.2, 'F');
  currentY += 4;

  const headerStartY = currentY;

  // LEFT SIDE: Logo Emblem + Company Details
  const logoWidth = 14;
  const logoHeight = 14;
  
  // SBE Shield Logo Badge
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, logoWidth, logoHeight, 2, 2, 'F');
  
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.circle(margin + (logoWidth / 2), currentY + (logoHeight / 2), 4.8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8);
  doc.text('SBE', margin + (logoWidth / 2), currentY + (logoHeight / 2) + 1.1, { align: 'center' });

  // Company Name & Subtitles
  const headerTextX = margin + logoWidth + 3.5;
  
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(13);
  doc.text('SHREE BALAJI ENTERPRISES', headerTextX, currentY + 3.8);

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('Commercial/Hotel Kitchen Equipment Manufacturer', headerTextX, currentY + 7.8);

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Canteen Equipment • Display Counters • Refrigeration • Exhaust Ventilation', headerTextX, currentY + 11.6);

  // RIGHT SIDE: Quotation, Estimate No & Date (Vertically Aligned with Left Side)
  const rightAlignX = margin + contentWidth;
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(13);
  doc.text('QUOTATION', rightAlignX, currentY + 3.8, { align: 'right' });

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(`Estimate No: ${estNumber}`, rightAlignX, currentY + 7.8, { align: 'right' });

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Date: ${estDate}`, rightAlignX, currentY + 11.6, { align: 'right' });

  currentY += Math.max(logoHeight, 13) + 3;

  // -------------------------------------------------------------
  // 2. CONTACT INFORMATION SECTION (Clean 2-3 Lines Card)
  // -------------------------------------------------------------
  const contactCardY = currentY;
  const contactCardHeight = 14;
  
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, contactCardY, contentWidth, contactCardHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, contactCardY, contentWidth, contactCardHeight, 1.5, 1.5, 'S');

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85); // slate-700

  // Line 1: Phones & Office
  const phoneLine = 'Phone: +91 9604386808 / +91 9422541505 / +91 9011127134    |    Office: +91 9604597979';
  doc.text(phoneLine, margin + 3.5, contactCardY + 4);

  // Line 2: Email & Address (with natural wrapping if needed)
  const emailAddrLine = 'Email: balajishree46@gmail.com    |    Address: Sr. No - 2/1 Mangde Wadi - Katraj, Pune Satara Road, Near Indian Oil Petrol Pump, Katraj, Pune - 411046';
  const splitEmailAddr = doc.splitTextToSize(emailAddrLine, contentWidth - 7);
  doc.text(splitEmailAddr, margin + 3.5, contactCardY + 8);

  currentY = contactCardY + contactCardHeight + 3.5;

  // -------------------------------------------------------------
  // 3. CUSTOMER SECTION & SUBJECT
  // -------------------------------------------------------------
  const clientName = (
    estimateData.customerName || 
    estimateData.projectName || 
    estimateData.clientName || 
    'Valued Customer'
  ).trim();

  const custBoxY = currentY;
  const custBoxHeight = 17;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, custBoxY, contentWidth, custBoxHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, custBoxY, contentWidth, custBoxHeight, 1.5, 1.5, 'S');

  // "To:"
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('To:', margin + 3.5, custBoxY + 4.2);

  // Customer Name (Bold & Distinct)
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(clientName, margin + 11, custBoxY + 4.2);

  // Optional customer meta details on same card if available
  const custMeta = [];
  if (estimateData.companyName) custMeta.push(estimateData.companyName);
  if (estimateData.phone) {
    const rawDigits = String(estimateData.phone).replace(/\D/g, '');
    const formattedPhone = rawDigits.length === 10
      ? `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`
      : estimateData.phone;
    custMeta.push(`Phone: ${formattedPhone}`);
  }
  if (estimateData.email) custMeta.push(`Email: ${estimateData.email}`);
  
  if (custMeta.length > 0) {
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(custMeta.join('   •   '), margin + 11, custBoxY + 8);
  }

  // Subject Banner at Bottom of Customer Box
  const subjectBannerY = custBoxY + custBoxHeight - 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, subjectBannerY, contentWidth, 6, 0, 0, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, subjectBannerY, margin + contentWidth, subjectBannerY);

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('Subject: Quotation for Commercial Kitchen Equipment', margin + 3.5, subjectBannerY + 4.2);

  currentY = custBoxY + custBoxHeight + 3.5;

  // -------------------------------------------------------------
  // 4. CUSTOMER BILL TABLE
  // Columns: | Sr. No. | Particular | Qty | Rate | Amount (₹) |
  // -------------------------------------------------------------
  const tableHeaders = [
    [
      { content: 'Sr. No.', styles: { halign: 'center' } },
      { content: 'Particular', styles: { halign: 'left' } },
      { content: 'Qty', styles: { halign: 'center' } },
      { content: 'Rate (₹)', styles: { halign: 'right' } },
      { content: 'Amount (₹)', styles: { halign: 'right' } }
    ]
  ];

  const productRows = [];

  const mainEquipmentName = estimateData.counterSubtype
    ? `${estimateData.counterType || 'Commercial Kitchen Equipment'} (${estimateData.counterSubtype})`
    : (estimateData.counterType || 'Commercial Kitchen Equipment');

  const counterQty = parseFloat(estimateData.counterQuantity || estimateData.quantity || 1) || 1;
  const unitRate = calculation.unitSellingPrice || 0;
  const totalSellingPrice = calculation.totalSellingPrice || (unitRate * counterQty);

  productRows.push([
    { content: '1', styles: { halign: 'center' } },
    { content: mainEquipmentName, styles: { halign: 'left', fontStyle: 'normal' } },
    { content: String(counterQty), styles: { halign: 'center' } },
    { content: formatRupee(unitRate), styles: { halign: 'right', fontStyle: 'normal' } },
    { content: formatRupee(totalSellingPrice), styles: { halign: 'right', fontStyle: 'bold' } }
  ]);

  // Selected Purchased Items with price > 0 and qty > 0 if any
  let itemIndex = 2;
  const selectedPurchasedItems = (Array.isArray(estimateData.purchased) ? estimateData.purchased : []).filter(
    p => p && parseFloat(p.quantity) > 0 && parseFloat(p.price) > 0
  );
  selectedPurchasedItems.forEach(p => {
    const q = parseFloat(p.quantity) || 1;
    const rate = parseFloat(p.price) || 0;
    const amt = q * rate;
    const name = p.size ? `${p.material} (${p.size})` : p.material;

    productRows.push([
      { content: String(itemIndex++), styles: { halign: 'center' } },
      { content: name, styles: { halign: 'left', fontStyle: 'normal' } },
      { content: String(q), styles: { halign: 'center' } },
      { content: formatRupee(rate), styles: { halign: 'right', fontStyle: 'normal' } },
      { content: formatRupee(amt), styles: { halign: 'right', fontStyle: 'bold' } }
    ]);
  });

  // Total Summary rows
  const totalQty = counterQty + selectedPurchasedItems.reduce((s, p) => s + (parseFloat(p.quantity) || 0), 0);
  const subTotalAmount = totalSellingPrice + selectedPurchasedItems.reduce((s, p) => s + ((parseFloat(p.quantity) || 0) * (parseFloat(p.price) || 0)), 0);

  if (calculation.gstAmount > 0) {
    productRows.push([
      { content: `GST (${calculation.gstPercent}%)`, colSpan: 4, styles: { halign: 'right', fontStyle: 'normal' } },
      { content: formatRupee(calculation.gstAmount), styles: { halign: 'right', fontStyle: 'bold' } }
    ]);
  }

  if (calculation.discount > 0) {
    productRows.push([
      { content: 'Discount', colSpan: 4, styles: { halign: 'right', fontStyle: 'normal', textColor: [225, 29, 72] } },
      { content: `- ${formatRupee(calculation.discount)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [225, 29, 72] } }
    ]);
  }

  // GRAND TOTAL ROW
  productRows.push([
    { 
      content: `GRAND TOTAL (Qty: ${totalQty})`, 
      colSpan: 4, 
      styles: { 
        halign: 'right', 
        fontStyle: 'bold', 
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255], 
        fontSize: 9
      } 
    },
    { 
      content: formatRupee(calculation.finalTotal), 
      styles: { 
        halign: 'right', 
        fontStyle: 'bold', 
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255], 
        fontSize: 9
      } 
    }
  ]);

  // Render Product Table using jsPDF AutoTable with Exact Dimensions
  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: productRows,
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontStyle: 'normal'
    },
    headStyles: {
      font: 'Roboto',
      fontStyle: 'bold',
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42], // slate-900
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [203, 213, 225], // slate-300
      lineWidth: 0.25
    },
    bodyStyles: {
      font: 'Roboto',
      fontSize: 8.5,
      textColor: [30, 41, 59], // slate-800
      cellPadding: 3,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' }, // Sr. No.
      1: { cellWidth: 84, halign: 'left' },   // Particular
      2: { cellWidth: 18, halign: 'center' }, // Qty
      3: { cellWidth: 30, halign: 'right' },  // Rate (₹)
      4: { cellWidth: 30, halign: 'right' }   // Amount (₹)
    },
    margin: { left: margin, right: margin, bottom: bottomMargin + 8 },
    showHead: 'everyPage'
  });

  // -------------------------------------------------------------
  // 5. AMOUNT IN WORDS BOX
  // -------------------------------------------------------------
  let afterTableY = doc.lastAutoTable.finalY + 3.5;

  // Check if remaining content fits on current page
  if (afterTableY + 70 > pageHeight - bottomMargin) {
    doc.addPage();
    afterTableY = topMargin + 2;
  }

  const wordsText = numberToWords(calculation.finalTotal);

  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, afterTableY, contentWidth, 8, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, afterTableY, contentWidth, 8, 1, 1, 'S');

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Amount in Words:', margin + 3, afterTableY + 5.2);

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(wordsText, margin + 31, afterTableY + 5.2);

  afterTableY += 12;

  // -------------------------------------------------------------
  // 6. TERMS & CONDITIONS SECTION
  // -------------------------------------------------------------
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Terms & Conditions', margin, afterTableY);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, afterTableY + 1.2, margin + 35, afterTableY + 1.2);

  afterTableY += 4.8;

  const termsList = (Array.isArray(estimateData.terms) && estimateData.terms.length > 0)
    ? estimateData.terms
    : DEFAULT_TERMS_AND_CONDITIONS;

  doc.setFontSize(7.5);

  termsList.forEach((term, idx) => {
    const label = term.label || `Term ${idx + 1}`;
    const val = term.value || term;

    doc.setFont('Roboto', 'bold');
    doc.setTextColor(30, 41, 59); // slate-800
    const prefix = `${idx + 1}. ${label}:`;
    doc.text(prefix, margin + 1, afterTableY);

    const prefixWidth = doc.getTextWidth(prefix) + 1.5;
    
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(51, 65, 85); // slate-700
    const splitVal = doc.splitTextToSize(String(val), contentWidth - prefixWidth - 2);
    doc.text(splitVal, margin + 1 + prefixWidth, afterTableY);

    afterTableY += 3.8 * splitVal.length;
  });

  afterTableY += 4;

  // -------------------------------------------------------------
  // 7. SIGNATURE AREA (Two Equal-Width Columns)
  // -------------------------------------------------------------
  if (afterTableY + 28 > pageHeight - bottomMargin) {
    doc.addPage();
    afterTableY = topMargin + 4;
  }

  const sigColWidth = 75;
  const sigY = afterTableY + 2;

  // LEFT COLUMN: Customer Acceptance Block
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Customer Acceptance & Confirmation:', margin + 1, sigY);

  // Left Signature Line
  const leftLineY = sigY + 15;
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.3);
  doc.line(margin + 1, leftLineY, margin + sigColWidth, leftLineY);

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Signature & Stamp', margin + 1, leftLineY + 4.5);

  // RIGHT COLUMN: Company Signatory Block
  const rightColX = margin + contentWidth - sigColWidth;
  
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('For', rightColX, sigY);

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('SHREE BALAJI ENTERPRISES', rightColX, sigY + 4.5);

  // Right Signature Line (Exact Same Horizontal Level as Left Line)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(rightColX, leftLineY, margin + contentWidth, leftLineY);

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Authorized Signatory', rightColX, leftLineY + 4.5);

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Contact: +91 9011127134 / +91 9604386808', rightColX, leftLineY + 8.5);

  // -------------------------------------------------------------
  // 8. RUNNING PAGE FOOTER ACROSS ALL PAGES
  // -------------------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);
    
    // Top border of footer
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, margin + contentWidth, pageHeight - 10);

    // Footer Text
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(148, 163, 184); // slate-400

    doc.text('Shree Balaji Enterprises • Commercial Kitchen Equipment Manufacturer', margin, pageHeight - 6);
    doc.text(`Page ${pageNum} of ${totalPages}`, margin + contentWidth, pageHeight - 6, { align: 'right' });
  }

  // -------------------------------------------------------------
  // 9. OUTPUT / DOWNLOAD / PRINT
  // -------------------------------------------------------------
  const fileName = getQuotationFileName(
    estimateData.customerName || estimateData.clientName || estimateData.projectName, 
    estNumber
  );

  if (shouldPrint) {
    doc.autoPrint();
    if (typeof window !== 'undefined') {
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    }
  } else if (typeof window !== 'undefined') {
    doc.save(fileName);
  }

  return doc;
}
