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
  const pipes = Array.isArray(estimateData.pipes) ? estimateData.pipes : [];
  
  // Find top sheet or primary sheet
  const primarySheet = sheets.find(s => s.length && s.width) || sheets[0];
  const grade = (primarySheet && primarySheet.grade) ? `SS ${primarySheet.grade}` : 'SS 304 Grade';
  
  const parts = [];
  if (primarySheet && primarySheet.length && primarySheet.width) {
    const l = primarySheet.length;
    const w = primarySheet.width;
    // Standard commercial equipment height is 34" or 30"
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

  const estNumber = estimateData.estimateNumber || `EST-${Date.now().toString().slice(-6)}`;
  const estDate = estimateData.date
    ? new Date(estimateData.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // -------------------------------------------------------------
  // 1. COMPANY HEADER (Shree Balaji Enterprises)
  // -------------------------------------------------------------
  let currentY = 12;

  // Header Container Top Line
  doc.setDrawColor(20, 30, 45);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 4.5;

  // Company Logo / Emblem Badge (Left)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, 14, 14, 2, 2, 'F');
  
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.circle(margin + 7, currentY + 7, 5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SBE', margin + 3.8, currentY + 8.2);

  // Company Name & Subtitle
  const headerTextLeft = margin + 17;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(COMPANY_DETAILS.name || 'SHREE BALAJI ENTERPRISES', headerTextLeft, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text(COMPANY_DETAILS.subtitle || 'Commercial/Hotel Kitchen Equipment', headerTextLeft, currentY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Canteen Kitchen Equipment • Refrigeration • Display Counters • Exhaust Systems', headerTextLeft, currentY + 12);

  // Right Side: Contact, Email & Website
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const rightAlignX = margin + contentWidth;
  doc.text(`Contact: ${COMPANY_DETAILS.phone || '+91 98220 54321 / +91 98500 12345'}`, rightAlignX, currentY + 3.5, { align: 'right' });
  doc.text(`Email: ${COMPANY_DETAILS.email || 'sales@shreebalajikitchenequipment.com'}`, rightAlignX, currentY + 7.5, { align: 'right' });
  doc.text(`Web: ${COMPANY_DETAILS.website || 'http://www.shreebalajikitchenequipment.com/'}`, rightAlignX, currentY + 11.5, { align: 'right' });

  currentY += 16;

  // Address Bar
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(`Works / Office: ${COMPANY_DETAILS.address || 'Plot No. 42, Sector 10, PCNTDA, Bhosari, Pune - 411026, Maharashtra, India'}`, margin, currentY);
  currentY += 3;

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 4;

  // -------------------------------------------------------------
  // 2. QUOTATION TITLE BAR & META (Quotation No & Date)
  // -------------------------------------------------------------
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, currentY, contentWidth, 7.5, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 7.5, 1, 1, 'S');

  // Quotation No (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Quotation No: ${estNumber}`, margin + 3, currentY + 5);

  // QUOTATION (Center)
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('QUOTATION', margin + (contentWidth / 2), currentY + 5.2, { align: 'center' });

  // Date (Right)
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Date: ${estDate}`, margin + contentWidth - 3, currentY + 5, { align: 'right' });

  currentY += 10.5;

  // -------------------------------------------------------------
  // 3. CUSTOMER DETAILS & SUBJECT CARD
  // -------------------------------------------------------------
  const custBoxHeight = 27;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, contentWidth, custBoxHeight, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, custBoxHeight, 1, 1, 'S');

  // "To,"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('To,', margin + 3, currentY + 4.5);

  // Customer Name
  const clientName = estimateData.customerName || estimateData.projectName || 'Valued Customer';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(clientName, margin + 3, currentY + 9);

  // Company Name / Phone / Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  
  let custLineY = currentY + 13;
  if (estimateData.companyName) {
    doc.text(estimateData.companyName, margin + 3, custLineY);
    custLineY += 3.8;
  }

  const addr = estimateData.address ? estimateData.address : '';
  if (addr) {
    const splitAddr = doc.splitTextToSize(`Address: ${addr}`, 115);
    doc.text(splitAddr[0], margin + 3, custLineY);
    custLineY += 3.8;
  }

  const phoneText = estimateData.phone ? `Contact No: ${estimateData.phone}` : '';
  const emailText = estimateData.email ? `Email: ${estimateData.email}` : '';
  const contactCombined = [phoneText, emailText].filter(Boolean).join(' • ');
  if (contactCombined && custLineY <= currentY + 21) {
    doc.text(contactCombined, margin + 3, custLineY);
  }

  // Right Column of Customer Box: Project / Site Reference
  const rightColX = margin + 122;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PROJECT / EQUIPMENT:', rightColX, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const equipHeading = estimateData.counterSubtype
    ? `${estimateData.counterType || 'Kitchen Equipment'} (${estimateData.counterSubtype})`
    : (estimateData.counterType || 'Stainless Steel Kitchen Equipment');
  
  const splitEquip = doc.splitTextToSize(equipHeading, 60);
  doc.text(splitEquip[0], rightColX, currentY + 9.5);

  // Subject Banner inside/below customer card
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY + custBoxHeight - 6.5, contentWidth, 6.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY + custBoxHeight - 6.5, margin + contentWidth, currentY + custBoxHeight - 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Subject: Quotation For Commercial Kitchen Equipment', margin + 3, currentY + custBoxHeight - 2.2);

  currentY += custBoxHeight + 3.5;

  // -------------------------------------------------------------
  // 4. PRODUCT TABLE (Sr. No. | Particular | Qty | Rate | Amount)
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

  // Build product line items dynamically
  const productRows = [];

  // Check if explicit products array is provided
  if (Array.isArray(estimateData.products) && estimateData.products.length > 0) {
    estimateData.products.forEach((prod, idx) => {
      const qty = parseFloat(prod.quantity || prod.qty || 1) || 1;
      const rate = parseFloat(prod.rate || prod.price || 0) || 0;
      const amount = parseFloat(prod.amount) || (qty * rate);

      const particularCell = [
        { text: prod.name || prod.particular || 'Commercial Kitchen Equipment', fontStyle: 'bold' },
        prod.size ? `\nSize: ${prod.size}` : '',
        prod.description ? `\n${prod.description}` : ''
      ].filter(Boolean).map(item => (typeof item === 'object' ? item.text : item)).join('');

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
    
    // Main Counter / Fabricated Equipment Row
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

    // Additional purchased / compressor accessory items (if present)
    const purchasedRows = [...purchased, ...compressor].filter(p => p.material);
    purchasedRows.forEach((item, index) => {
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
  // 5. PRICING SUMMARY ROWS AT BOTTOM OF TABLE
  // -------------------------------------------------------------
  const subtotalBeforeTax = calculation.materialCost + calculation.purchasedItemCost + calculation.labourCost;
  
  // Total (Subtotal) Row
  productRows.push([
    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255], borderBottomWidth: 0 } },
    { content: 'Total', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } },
    { content: subtotalBeforeTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } }
  ]);

  // Discount Row (if applicable)
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

  // GRAND TOTAL Row (Highlighted)
  productRows.push([
    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
    { content: 'GRAND TOTAL', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9 } },
    { content: calculation.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9 } }
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
      0: { cellWidth: 14 }, // Sr. No.
      1: { cellWidth: 96 }, // Particular
      2: { cellWidth: 16 }, // Qty
      3: { cellWidth: 30 }, // Rate
      4: { cellWidth: 30 }  // Amount
    },
    margin: { left: margin, right: margin, bottom: 22 },
    showHead: 'everyPage',
    didDrawPage: (data) => {
      // Repeat clean bottom bar on every page
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
  // 6. AMOUNT IN WORDS BOX
  // -------------------------------------------------------------
  let finalY = doc.lastAutoTable.finalY + 4;

  // If remaining space on current page is insufficient for words + terms + footer, create new page
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
  // 7. TERMS & CONDITIONS
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
  // 8. COMPANY SIGNATURE & ACCEPTANCE FOOTER
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Contact No: ${COMPANY_DETAILS.phone || '+91 98220 54321 / +91 98500 12345'}`, rightFooterX, sigBoxY + 22);

  // -------------------------------------------------------------
  // 9. OUTPUT / DOWNLOAD / PRINT
  // -------------------------------------------------------------
  const cleanEstNum = estNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Shree_Balaji_Enterprises_Quotation_${cleanEstNum}.pdf`;

  if (shouldPrint) {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(fileName);
  }

  return doc;
}
