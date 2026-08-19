/**
 * Shree Balaji Enterprises — Professional Commercial Kitchen Equipment Quotation Generator
 * Generates print-ready A4 commercial quotation documents with dynamic multi-page flow.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPANY_DETAILS, DEFAULT_TERMS_AND_CONDITIONS } from './constants.js';
import { calculateEstimate, formatCurrency, numberToWords } from './calculations.js';

/**
 * Helper to extract size and dimension description from estimate sheets/components
 * @param {Object} estimateData 
 * @returns {string} Formatted size / spec string
 */
function getEquipmentSizeSpec(estimateData) {
  const sheets = Array.isArray(estimateData.sheets) ? estimateData.sheets : [];
  
  // Find top sheet or primary sheet
  const primarySheet = sheets.find(s => s.length && s.width) || sheets[0];
  const grade = (primarySheet && primarySheet.grade) ? `SS ${primarySheet.grade} Grade` : 'SS 304 Grade';
  
  const parts = [];
  if (primarySheet && primarySheet.length && primarySheet.width) {
    const l = primarySheet.length;
    const w = primarySheet.width;
    parts.push(`Size: ${l}" (L) × ${w}" (W) × 34" (H)`);
  } else if (estimateData.size) {
    parts.push(`Size: ${estimateData.size}`);
  }

  if (grade) {
    parts.push(grade);
  }

  if (primarySheet && primarySheet.gauge) {
    parts.push(`Sheet Thickness: ${primarySheet.gauge} mm`);
  }

  return parts.join(' • ');
}

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
  // Specifically replace '/' and '\' with ' - ' per requirement: "ABC / XYZ Hotel" -> "ABC - XYZ Hotel"
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
 * Generate Professional A4 Commercial Quotation PDF for Shree Balaji Enterprises
 * @param {Object} estimateData - Full estimate project object
 * @param {Object} [options]
 * @param {boolean} [options.shouldPrint=false] - Whether to trigger browser print dialog
 * @returns {jsPDF} Generated jsPDF instance
 */
export function generateQuotationPDF(estimateData, options = {}) {
  const { shouldPrint = false } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 12; // 12mm left and right margin
  const contentWidth = pageWidth - (margin * 2); // 186mm

  // Flatten all material components for calculation
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
    labourCost: estimateData.labourCost,
    discount: estimateData.discount,
    gst: estimateData.gst
  });

  const estNumber = estimateData.estimateNumber || 'EST 01';
  const estDate = estimateData.date
    ? new Date(estimateData.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // -------------------------------------------------------------
  // 1. COMPANY HEADER (ERP-Style Professional Layout)
  // -------------------------------------------------------------
  let currentY = 10;

  // Header Container Top Border
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 4;

  // LEFT: SBE Logo Badge
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, 15, 15, 2, 2, 'F');
  
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.circle(margin + 7.5, currentY + 7.5, 5.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SBE', margin + 3.8, currentY + 8.7);

  // CENTER: Company Name & Subtitle
  const headerCenterLeft = margin + 18;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text('SHREE BALAJI ENTERPRISES', headerCenterLeft, currentY + 4.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('Commercial/Hotel Kitchen Equipment Manufacturer', headerCenterLeft, currentY + 8.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('Canteen Equipment • Display Counters • Refrigeration • Exhaust Ventilation', headerCenterLeft, currentY + 11.8);

  // RIGHT: Quotation No & Date Box
  const rightColX = margin + contentWidth;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('QUOTATION', rightColX, currentY + 4.2, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Quotation No: ${estNumber}`, rightColX, currentY + 8.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${estDate}`, rightColX, currentY + 12.2, { align: 'right' });

  currentY += 16.5;

  // Contact Details Ribbon
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 9.5, 1, 1, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 9.5, 1, 1, 'S');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  
  const phoneStr = 'Phone: +91 9604386808 / +91 9422541505 / +91 9011127134   |   Office: +91 9604597979   |   Email: balajishree46@gmail.com';
  doc.text(phoneStr, margin + 2.5, currentY + 3.8);

  const addrStr = 'Address: Sr. No - 2/1 Mangde Wadi - Katraj, Pune Satara Road, Near Indian Oil Petrol Pump, Katraj, Pune - 411046';
  doc.text(addrStr, margin + 2.5, currentY + 7.5);

  currentY += 12;

  // -------------------------------------------------------------
  // 2. CUSTOMER DETAILS & SUBJECT CARD
  // -------------------------------------------------------------
  const custBoxHeight = 26;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, contentWidth, custBoxHeight, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, custBoxHeight, 1, 1, 'S');

  // "To,"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('To,', margin + 3, currentY + 4.2);

  // Customer Name
  const clientName = estimateData.customerName || estimateData.projectName || 'Valued Customer';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(clientName, margin + 3, currentY + 8.5);

  // Company Name / Address / Phone
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  
  let custLineY = currentY + 12.5;
  if (estimateData.companyName) {
    doc.text(estimateData.companyName, margin + 3, custLineY);
    custLineY += 3.4;
  }

  const addr = estimateData.address ? estimateData.address : '';
  if (addr) {
    const splitAddr = doc.splitTextToSize(`Address: ${addr}`, 115);
    doc.text(splitAddr[0], margin + 3, custLineY);
    custLineY += 3.4;
  }

  const phoneText = estimateData.phone ? `Phone: ${estimateData.phone}` : '';
  const emailText = estimateData.email ? `Email: ${estimateData.email}` : '';
  const contactCombined = [phoneText, emailText].filter(Boolean).join(' • ');
  if (contactCombined && custLineY <= currentY + 19) {
    doc.text(contactCombined, margin + 3, custLineY);
  }

  // Right Column of Customer Box: Counter / Equipment Spec
  const rightCustX = margin + 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('COUNTER / EQUIPMENT:', rightCustX, currentY + 4.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const equipHeading = estimateData.counterSubtype
    ? `${estimateData.counterType || 'Commercial Kitchen Equipment'} (${estimateData.counterSubtype})`
    : (estimateData.counterType || 'Commercial Kitchen Equipment');
  
  const splitEquip = doc.splitTextToSize(equipHeading, 62);
  doc.text(splitEquip[0], rightCustX, currentY + 8.5);

  // Subject Banner inside customer card
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY + custBoxHeight - 6, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY + custBoxHeight - 6, margin + contentWidth, currentY + custBoxHeight - 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Subject: Quotation For ${equipHeading}`, margin + 3, currentY + custBoxHeight - 2);

  currentY += custBoxHeight + 3.5;

  // -------------------------------------------------------------
  // 3. PRODUCT TABLE (Sr. No. | Particular | Qty | Rate (Rs.) | Amount (Rs.))
  // -------------------------------------------------------------
  const tableHeaders = [
    [
      { content: 'Sr. No.', styles: { halign: 'center' } },
      { content: 'Particular', styles: { halign: 'left' } },
      { content: 'Qty', styles: { halign: 'center' } },
      { content: 'Rate (Rs.)', styles: { halign: 'right' } },
      { content: 'Amount (Rs.)', styles: { halign: 'right' } }
    ]
  ];

  const productRows = [];

  // Check if explicit products array is provided
  if (Array.isArray(estimateData.products) && estimateData.products.length > 0) {
    estimateData.products.forEach((prod, idx) => {
      const qty = parseFloat(prod.quantity || prod.qty || 1) || 1;
      const rate = parseFloat(prod.rate || prod.price || 0) || 0;
      const amount = parseFloat(prod.amount) || (qty * rate);

      const particularCell = [
        prod.name || prod.particular || 'Commercial Kitchen Equipment',
        prod.size ? `\nSize: ${prod.size}` : '',
        prod.description ? `\n${prod.description}` : ''
      ].filter(Boolean).join('');

      productRows.push([
        { content: String(idx + 1), styles: { halign: 'center' } },
        { content: particularCell },
        { content: String(qty), styles: { halign: 'center', fontStyle: 'bold' } },
        { content: rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold' } }
      ]);
    });
  } else {
    // Construct dynamic quotation line items from current estimate
    const mainEquipmentName = estimateData.counterSubtype
      ? `${estimateData.counterType || 'Commercial Kitchen Equipment'} (${estimateData.counterSubtype})`
      : (estimateData.counterType || estimateData.projectName || 'Commercial Kitchen Equipment');

    const sizeSpec = getEquipmentSizeSpec(estimateData);
    
    // Main Counter / Fabricated Equipment Row (Material Cost + Labour Cost)
    const mainFabCost = calculation.materialCost + calculation.labourCost;
    const mainQty = 1;
    const mainRate = mainFabCost;
    const mainAmount = mainQty * mainRate;

    let particularDesc = mainEquipmentName;
    if (sizeSpec) {
      particularDesc += `\n${sizeSpec}`;
    }
    if (estimateData.remarks) {
      particularDesc += `\n${estimateData.remarks}`;
    }

    productRows.push([
      { content: '1', styles: { halign: 'center' } },
      { 
        content: particularDesc,
        styles: { fontStyle: 'normal' }
      },
      { content: String(mainQty), styles: { halign: 'center', fontStyle: 'bold' } },
      { content: mainRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' } },
      { content: mainAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold' } }
    ]);

    // Additional purchased / compressor accessory items (ONLY items with valid quantity > 0)
    const validPurchasedRows = [...purchased, ...compressor].filter(p => {
      if (!p || !p.material) return false;
      const q = parseFloat(p.quantity);
      return !isNaN(q) && q > 0;
    });

    validPurchasedRows.forEach((item, index) => {
      const pQty = parseFloat(item.quantity) || 1;
      const pRate = parseFloat(item.price) || 0;
      const pAmount = pQty * pRate;

      let itemDesc = item.material;
      if (item.size) {
        itemDesc += `\nSize / Model: ${item.size}`;
      }

      productRows.push([
        { content: String(index + 2), styles: { halign: 'center' } },
        { content: itemDesc },
        { content: String(pQty), styles: { halign: 'center', fontStyle: 'bold' } },
        { content: pRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: pAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold' } }
      ]);
    });
  }

  // -------------------------------------------------------------
  // 4. PRICING SUMMARY ROWS AT BOTTOM OF TABLE
  // -------------------------------------------------------------
  // Material Cost Row
  productRows.push([
    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255], borderBottomWidth: 0 } },
    { content: 'Material Cost', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } },
    { content: calculation.materialCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } }
  ]);

  // Purchased & Components Row
  productRows.push([
    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255], borderBottomWidth: 0 } },
    { content: 'Purchased & Components', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 255, 255] } },
    { content: calculation.purchasedItemCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 255, 255] } }
  ]);

  // Labour Cost Row
  productRows.push([
    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255], borderBottomWidth: 0 } },
    { content: 'Labour Cost', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } },
    { content: calculation.labourCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } }
  ]);

  // Discount Row (if discount > 0)
  if (calculation.discount > 0) {
    productRows.push([
      { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255], borderBottomWidth: 0 } },
      { content: 'Discount', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [220, 38, 38] } },
      { content: `- ${calculation.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [220, 38, 38] } }
    ]);
  }

  // GST Row
  productRows.push([
    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255], borderBottomWidth: 0 } },
    { content: `GST (${calculation.gstPercent || 18}%)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } },
    { content: calculation.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } }
  ]);

  // GRAND TOTAL Row (Visually highlighted in dark slate)
  productRows.push([
    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
    { content: 'GRAND TOTAL', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9.5 } },
    { content: calculation.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9.5 } }
  ]);

  // Render Product Table with jsPDF AutoTable
  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: productRows,
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 2.8,
      lineColor: [180, 190, 205],
      lineWidth: 0.2
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.6,
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' }, // Sr. No.
      1: { cellWidth: 96, halign: 'left' },   // Particular
      2: { cellWidth: 16, halign: 'center' }, // Qty
      3: { cellWidth: 30, halign: 'right' },  // Rate
      4: { cellWidth: 30, halign: 'right' }   // Amount
    },
    margin: { left: margin, right: margin, bottom: 22 },
    showHead: 'everyPage',
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 10, margin + contentWidth, pageHeight - 10);

      doc.text('Shree Balaji Enterprises • Commercial Kitchen Equipment Manufacturer', margin, pageHeight - 6);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, margin + contentWidth, pageHeight - 6, { align: 'right' });
    }
  });

  // -------------------------------------------------------------
  // 5. AMOUNT IN WORDS BOX
  // -------------------------------------------------------------
  let finalY = doc.lastAutoTable.finalY + 4;

  if (finalY + 68 > pageHeight - 18) {
    doc.addPage();
    finalY = 16;
  }

  const wordsText = numberToWords(calculation.grandTotal);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, finalY, contentWidth, 7, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, finalY, contentWidth, 7, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Amount in Words:', margin + 3, finalY + 4.6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(wordsText, margin + 37, finalY + 4.6);

  finalY += 10.5;

  // -------------------------------------------------------------
  // 6. TERMS & CONDITIONS
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS & CONDITIONS', margin, finalY);
  
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, finalY + 1, margin + 38, finalY + 1);

  finalY += 4.5;

  const termsList = Array.isArray(estimateData.terms) && estimateData.terms.length > 0
    ? estimateData.terms
    : DEFAULT_TERMS_AND_CONDITIONS;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  termsList.forEach((term, idx) => {
    const label = term.label || `Term ${idx + 1}`;
    const val = term.value || term;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}. ${label}:`, margin + 1, finalY);
    
    doc.setFont('helvetica', 'normal');
    const labelWidth = doc.getTextWidth(`${idx + 1}. ${label}:`) + 1.5;
    const splitVal = doc.splitTextToSize(String(val), contentWidth - labelWidth - 3);
    doc.text(splitVal, margin + 1 + labelWidth, finalY);
    
    finalY += 3.8 * splitVal.length;
  });

  finalY += 3;

  // -------------------------------------------------------------
  // 7. COMPANY SIGNATURE & ACCEPTANCE FOOTER
  // -------------------------------------------------------------
  if (finalY + 28 > pageHeight - 15) {
    doc.addPage();
    finalY = 16;
  }

  // Left Side: Customer Acceptance Block
  const sigBoxY = finalY + 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Customer Acceptance & Confirmation:', margin + 1, sigBoxY);
  
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin + 1, sigBoxY + 14, margin + 65, sigBoxY + 14);
  doc.text('Signature & Stamp', margin + 1, sigBoxY + 18);

  // Right Side: Company Signatory Block
  const rightFooterX = margin + contentWidth - 65;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('For', rightFooterX, sigBoxY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SHREE BALAJI ENTERPRISES', rightFooterX, sigBoxY + 4.5);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(rightFooterX, sigBoxY + 14, margin + contentWidth, sigBoxY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Authorized Signatory', rightFooterX, sigBoxY + 18);

  doc.text(`Office: ${COMPANY_DETAILS.office || '+91 9604597979'} | Phone: +91 9604386808`, rightFooterX, sigBoxY + 22);

  // -------------------------------------------------------------
  // 8. OUTPUT / DOWNLOAD / PRINT
  // -------------------------------------------------------------
  const fileName = getQuotationFileName(estimateData.customerName || estimateData.clientName, estNumber);

  if (shouldPrint) {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(fileName);
  }

  return doc;
}
