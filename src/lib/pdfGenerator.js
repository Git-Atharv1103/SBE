/**
 * Shree Balaji Enterprises — Commercial Quotation PDF Generator
 * Built for A4 commercial quotation documents with multi-page automatic pagination.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateRowWeight, calculateEstimate, formatCurrency } from './calculations';

/**
 * Format material size cleanly for the quotation table
 * @param {Object} row - Material component row
 * @returns {string} Formatted size string
 */
export function formatMaterialSize(row) {
  if (!row) return '—';
  const type = String(row.calculationType || row.category || '').toLowerCase();

  if (type === 'sheet' || row.gauge !== undefined) {
    const l = row.length ? `${row.length}"` : '';
    const w = row.width ? `${row.width}"` : '';
    const g = row.gauge ? `${row.gauge} mm` : '';
    const dims = [l && w ? `${l} × ${w}` : (l || w), g].filter(Boolean).join(', ');
    return dims || '—';
  }

  if (type === 'pipe' || row.pipeSize !== undefined) {
    const pSize = row.pipeSize || 'Pipe';
    const l = row.length ? `${row.length} ft` : '';
    return [pSize, l].filter(Boolean).join(', ');
  }

  if (type === 'purchased' || row.unitWeight !== undefined) {
    return '—';
  }

  return '—';
}

/**
 * Generate Professional A4 Commercial Quotation PDF
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
  const margin = 14;

  // Flatten all material components
  const sheets = Array.isArray(estimateData.sheets) ? estimateData.sheets : [];
  const pipes = Array.isArray(estimateData.pipes) ? estimateData.pipes : [];
  const purchased = Array.isArray(estimateData.purchased) ? estimateData.purchased : [];
  const allRows = [...sheets, ...pipes, ...purchased];

  // Universal Master Calculation
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
    ? new Date(estimateData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // 1. BRAND HEADER (Professional Slate & Emerald theme)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Brand Logo Badge
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(margin, 7, 12, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SB', margin + 2.2, 15.5);

  // Brand Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Shree Balaji Enterprises', margin + 16, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Commercial Kitchen Equipment • Refrigeration • Display Counters • Exhaust Systems', margin + 16, 18);
  doc.text('Website: http://www.shreebalajikitchenequipment.com/', margin + 16, 23);

  // Header Right Side Document Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('QUOTATION / ESTIMATE', pageWidth - margin, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Quotation No: ${estNumber}`, pageWidth - margin, 19, { align: 'right' });
  doc.text(`Date: ${estDate}`, pageWidth - margin, 24, { align: 'right' });

  // 2. CUSTOMER & PROJECT DETAILS CARD
  let currentY = 41;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 2, 2, 'S');

  // Customer Information (Left Column)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('CLIENT DETAILS', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  const clientName = estimateData.customerName || estimateData.projectName || 'Valued Customer';
  doc.text(clientName, margin + 4, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let leftOffset = currentY + 16;
  if (estimateData.companyName) {
    doc.text(estimateData.companyName, margin + 4, leftOffset);
    leftOffset += 4.5;
  }
  const contactText = [estimateData.phone, estimateData.email].filter(Boolean).join(' • ');
  if (contactText && leftOffset <= currentY + 22) {
    doc.text(contactText, margin + 4, leftOffset);
  }

  // Counter & Project Specification (Right Column)
  const colRightX = pageWidth / 2 + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('COUNTER SPECIFICATION', colRightX, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(estimateData.counterType || 'Stainless Steel Kitchen', colRightX, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let rightOffset = currentY + 16;
  if (estimateData.projectName && estimateData.projectName !== clientName) {
    doc.text(`Project: ${estimateData.projectName}`, colRightX, rightOffset);
    rightOffset += 4.5;
  }
  if (estimateData.address && rightOffset <= currentY + 22) {
    const splitAddr = doc.splitTextToSize(`Site: ${estimateData.address}`, 84);
    doc.text(splitAddr[0], colRightX, rightOffset);
  }

  currentY += 31;

  // 3. MATERIAL SPECIFICATION TABLE (AutoTable with multi-page flow)
  const tableHeaders = [
    [
      { content: 'Sr', styles: { halign: 'center' } },
      { content: 'Material', styles: { halign: 'left' } },
      { content: 'Grade', styles: { halign: 'center' } },
      { content: 'Size', styles: { halign: 'left' } },
      { content: 'Qty', styles: { halign: 'center' } },
      { content: 'Unit', styles: { halign: 'center' } },
      { content: 'Weight', styles: { halign: 'right' } }
    ]
  ];

  const tableRows = allRows.map((row, index) => {
    const rowWeight = calculateRowWeight(row);
    const weightDisplay = rowWeight > 0 ? `${rowWeight.toFixed(2)} kg` : '—';
    const type = String(row.calculationType || row.category || '').toLowerCase();
    const unitDisplay = type === 'pipe' ? 'ft' : (type === 'purchased' ? 'pc' : 'inch');
    const gradeDisplay = row.grade || (type === 'purchased' ? '—' : 'SS304');

    const qtyDisplay = row.quantity !== undefined && row.quantity !== null && row.quantity !== '' ? String(row.quantity) : '—';

    return [
      { content: String(index + 1), styles: { halign: 'center' } },
      { content: row.material || 'Material Component', styles: { fontStyle: 'bold' } },
      { content: gradeDisplay, styles: { halign: 'center' } },
      { content: formatMaterialSize(row) },
      { content: qtyDisplay, styles: { halign: 'center' } },
      { content: unitDisplay, styles: { halign: 'center' } },
      { content: weightDisplay, styles: { halign: 'right', fontStyle: 'bold' } }
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: tableRows.length > 0 ? tableRows : [
      [{ content: 'No material components configured for this counter.', colSpan: 7, styles: { halign: 'center', textColor: [148, 163, 184] } }]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.8
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 48 },
      2: { cellWidth: 18 },
      3: { cellWidth: 48 },
      4: { cellWidth: 14 },
      5: { cellWidth: 16 },
      6: { cellWidth: 28 }
    },
    margin: { left: margin, right: margin, bottom: 25 },
    didDrawPage: (data) => {
      // Repeat standard footer on every page
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.text('Shree Balaji Enterprises • http://www.shreebalajikitchenequipment.com/', margin, pageHeight - 7);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }
  });

  // 4. SUMMARY & PRICING SECTION
  let finalY = doc.lastAutoTable.finalY + 6;

  // If remaining space on the current page is less than 65mm, move summary to next page
  if (finalY + 65 > pageHeight - 20) {
    doc.addPage();
    finalY = 22;
  }

  const summaryWidth = 85;
  const summaryX = pageWidth - margin - summaryWidth;

  // Notes / Remarks Box on Left
  if (estimateData.remarks) {
    const remarksWidth = summaryX - margin - 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, finalY, remarksWidth, 34, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, finalY, remarksWidth, 34, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('NOTES & TERMS', margin + 4, finalY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(estimateData.remarks, remarksWidth - 8);
    doc.text(splitNotes, margin + 4, finalY + 11);
  }

  // Weight & Pricing Box on Right
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, finalY, summaryWidth, 34, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, finalY, summaryWidth, 34, 2, 2, 'S');

  // Total Material Weight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Grand Total Material Weight:', summaryX + 4, finalY + 6.5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.text(`${calculation.totalWeight.toFixed(2)} kg`, summaryX + summaryWidth - 4, finalY + 6.5, { align: 'right' });

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(summaryX + 4, finalY + 10, summaryX + summaryWidth - 4, finalY + 10);

  // Material Cost
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Material Cost:', summaryX + 4, finalY + 16);
  doc.text(formatCurrency(calculation.materialCost), summaryX + summaryWidth - 4, finalY + 16, { align: 'right' });

  // Grand Total Highlight Bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(summaryX + 2, finalY + 20, summaryWidth - 4, 11, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Grand Total Estimate:', summaryX + 5, finalY + 27);
  doc.setFontSize(9.5);
  doc.text(formatCurrency(calculation.grandTotal), summaryX + summaryWidth - 5, finalY + 27, { align: 'right' });

  // 5. SIGNATURE & COMPANY SEAL BLOCK
  let sigY = finalY + 40;
  if (sigY + 22 > pageHeight - 20) {
    doc.addPage();
    sigY = 25;
  }

  doc.setDrawColor(203, 213, 225);
  // Left: Customer Signature Line
  doc.line(margin + 5, sigY + 12, margin + 55, sigY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Customer Signature & Acceptance', margin + 5, sigY + 16);

  // Right: Authorized Signature & Seal Line
  doc.line(pageWidth - margin - 60, sigY + 12, pageWidth - margin - 5, sigY + 12);
  doc.text('Authorized Signature & Seal', pageWidth - margin - 60, sigY + 16);

  // 6. OUTPUT / DOWNLOAD / PRINT
  const fileName = `Shree_Balaji_Enterprises_Quotation_${estNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  if (shouldPrint) {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(fileName);
  }

  return doc;
}
