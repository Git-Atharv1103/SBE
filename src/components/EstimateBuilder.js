import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Printer, 
  Loader2, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { counterTypeOptions, counterTypeMaterialTemplates } from '@/lib/constants';

export default function EstimateBuilder({ projectToEdit, onSaveSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Status feedback
  const [statusMessage, setStatusMessage] = useState(null);

  // Form state
  const [projectData, setProjectData] = useState({
    projectName: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
    labourCost: 0,
    transportCost: 0,
    discount: 0,
    gst: 18,
    totalAmount: 0
  });

  const [selectedMaterialsList, setSelectedMaterialsList] = useState([
    { materialId: '', quantity: 1, unitPrice: 0, unit: '', total: 0 }
  ]);

  // Quick Add Customer modal state
  const [isCustModalOpen, setIsCustModalOpen] = useState(false);

  const [custFormData, setCustFormData] = useState({
    customerName: '',
    counterType: '',
    phone: '',
    address: '',
    email: ''
  });
  const [custErrors, setCustErrors] = useState({});
  const [templateValues, setTemplateValues] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const createTemplateValues = (counterType) => {
    const template = counterTypeMaterialTemplates[counterType] || [];
    return template.reduce((acc, item) => {
      acc[item.key] = {
        quantity: item.defaultQuantity !== undefined ? item.defaultQuantity : '',
        pipeSize: item.fields.pipeSize ? '' : '',
        noOfLegs: item.fields.noOfLegs ? (item.defaultQuantity !== undefined ? item.defaultQuantity : '') : '',
        dims: {
          length: item.fields.length ? '' : '',
          width: item.fields.width ? '' : '',
          height: item.fields.height ? '' : '',
          thickness: item.fields.thickness ? '' : ''
        }
      };
      return acc;
    }, {});
  };

  useEffect(() => {
    if (projectData.customerId && counterTypeMaterialTemplates[projectData.customerId]) {
      setTemplateValues(createTemplateValues(projectData.customerId));
    } else {
      setTemplateValues({});
    }
  }, [projectData.customerId]);

  useEffect(() => {
    if (projectToEdit) {
      setProjectData({
        projectName: projectToEdit.projectName,
        customerId: projectToEdit.customerId,
        date: new Date(projectToEdit.date).toISOString().split('T')[0],
        remarks: projectToEdit.remarks || '',
        labourCost: projectToEdit.labourCost || 0,
        transportCost: projectToEdit.transportCost || 0,
        discount: projectToEdit.discount || 0,
        gst: projectToEdit.gst !== undefined ? projectToEdit.gst : 18,
        totalAmount: projectToEdit.totalAmount || 0
      });

      if (projectToEdit.materials && projectToEdit.materials.length > 0) {
        setSelectedMaterialsList(projectToEdit.materials.map(m => ({
          materialId: m.materialId,
          quantity: m.quantity,
          unitPrice: m.unitPrice,
          unit: getMaterialUnit(m.materialId),
          total: m.total
        })));
      } else {
        setSelectedMaterialsList([{ materialId: '', quantity: 1, unitPrice: 0, unit: '', total: 0 }]);
      }
    }
  }, [projectToEdit, materials]);

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const [cRes, mRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/materials')
      ]);
      if (cRes.ok && mRes.ok) {
        const cData = await cRes.json();
        const mData = await mRes.json();
        setCustomers(cData);
        // Only active materials can be added to new estimates
        setMaterials(mData.filter(m => m.status === 'Active' || (projectToEdit && projectToEdit.materials?.some(pm => pm.materialId === m._id))));
      }
    } catch (e) {
      console.error('Error fetching builder dependencies:', e);
    } finally {
      setInitialLoading(false);
    }
  };

  const getMaterialUnit = (mId) => {
    const mat = materials.find(m => m._id === mId);
    return mat ? mat.unit : '';
  };

  const parseNumber = (value) => {
    const num = parseFloat(String(value).replace(/,/g, '.'));
    return Number.isFinite(num) ? num : 0;
  };

  const getSteelWeightForTemplateItem = (item, values) => {
    const density = 7850; // kg/m3 for steel
    const qty = parseNumber(values.quantity);
    const length = parseNumber(values.dims?.length);
    const width = parseNumber(values.dims?.width);
    const height = parseNumber(values.dims?.height);
    const thickness = parseNumber(values.dims?.thickness);
    const pipeSize = parseNumber(values.pipeSize);
    const noOfLegs = parseNumber(values.noOfLegs);

    const toMeters = (mm) => mm / 1000;
    const lengthM = toMeters(length);
    const widthM = toMeters(width);
    const heightM = toMeters(height);
    const thicknessM = toMeters(thickness);
    const pipeM = pipeSize / 1000;

    if (item.key === 'welding') {
      if (!lengthM || !qty) return 0;
      const weldCrossSection = 0.005 * 0.02; // 5mm by 20mm fillet approximation
      return lengthM * weldCrossSection * density * qty;
    }

    if (item.fields.pipeSize && item.fields.noOfLegs) {
      if (!pipeM || !heightM || !noOfLegs) return 0;
      const area = Math.PI * Math.pow(pipeM / 2, 2);
      return area * heightM * density * noOfLegs;
    }

    if (item.fields.pipeSize && heightM) {
      if (!pipeM || !heightM || !qty) return 0;
      const area = Math.PI * Math.pow(pipeM / 2, 2);
      return area * heightM * density * qty;
    }

    if (lengthM && widthM && thicknessM && qty) {
      return lengthM * widthM * thicknessM * density * qty;
    }

    return 0;
  };

  const totalSteelWeight = Object.entries(templateValues).reduce((sum, [key, values]) => {
    const item = counterTypeMaterialTemplates[projectData.customerId]?.find(i => i.key === key);
    if (!item) return sum;
    return sum + getSteelWeightForTemplateItem(item, values);
  }, 0);

  // Run calculations whenever list or summary costs change
  const materialTotal = selectedMaterialsList.reduce((sum, item) => sum + (item.total || 0), 0);
  const labourCostVal = Number(projectData.labourCost) || 0;
  const transportCostVal = Number(projectData.transportCost) || 0;
  const discountVal = Number(projectData.discount) || 0;
  const gstPercent = Number(projectData.gst) || 0;

  // Calculation formula:
  // Taxable subtotal = Material Total + Labour + Transport - Discount
  // GST Amount = Taxable Subtotal * (GST % / 100)
  // Grand Total = Taxable Subtotal + GST Amount
  const taxableSubtotal = Math.max(0, materialTotal + labourCostVal + transportCostVal - discountVal);
  // Special check: if the user needs GST to match the Module 7 exactly, we'll keep the dynamic calculation:
  const gstAmount = Math.round(taxableSubtotal * (gstPercent / 100));
  const grandTotal = taxableSubtotal + gstAmount;

  const handleRowChange = (index, field, value) => {
    const updated = [...selectedMaterialsList];
    
    if (field === 'materialId') {
      const mat = materials.find(m => m._id === value);
      updated[index].materialId = value;
      updated[index].unitPrice = mat ? mat.price : 0;
      updated[index].unit = mat ? mat.unit : '';
      updated[index].total = updated[index].quantity * (mat ? mat.price : 0);
    } else if (field === 'quantity') {
      const q = value === '' ? '' : (parseFloat(value) || 0);
      updated[index].quantity = q;
      const numQ = parseFloat(q) || 0;
      updated[index].total = Number((numQ * (parseFloat(updated[index].unitPrice) || 0)).toFixed(2));
    } else if (field === 'unitPrice') {
      const p = value === '' ? '' : (parseFloat(value) || 0);
      updated[index].unitPrice = p;
      const numP = parseFloat(p) || 0;
      updated[index].total = Number(((parseFloat(updated[index].quantity) || 0) * numP).toFixed(2));
    }

    setSelectedMaterialsList(updated);
  };

  const handleAddRow = () => {
    setSelectedMaterialsList([
      ...selectedMaterialsList,
      { materialId: '', quantity: 1, unitPrice: 0, unit: '', total: 0 }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (selectedMaterialsList.length === 1) return;
    const updated = selectedMaterialsList.filter((_, i) => i !== index);
    setSelectedMaterialsList(updated);
  };

  const updateTemplateValue = (itemKey, field, value, dimName) => {
    setTemplateValues((prev) => {
      const existing = prev[itemKey] || { quantity: '', pipeSize: '', noOfLegs: '', dims: {} };
      if (field === 'quantity' || field === 'pipeSize' || field === 'noOfLegs') {
        return {
          ...prev,
          [itemKey]: {
            ...existing,
            [field]: value
          }
        };
      }

      return {
        ...prev,
        [itemKey]: {
          ...existing,
          dims: {
            ...existing.dims,
            [dimName]: value
          }
        }
      };
    });
  };

  // QUICK ADD CUSTOMER SUBMISSION
  const handleQuickCustomerSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!custFormData.customerName.trim()) errors.customerName = 'Name is required';
    if (!custFormData.counterType.trim()) errors.counterType = 'Counter Type is required';
    if (!custFormData.phone.trim()) errors.phone = 'Phone is required';
    if (!custFormData.address.trim()) errors.address = 'Address is required';
    
    if (Object.keys(errors).length > 0) {
      setCustErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custFormData)
      });
      if (res.ok) {
        const newCust = await res.json();
        setCustomers([...customers, newCust]);
        setProjectData({ ...projectData, customerId: newCust._id });
        setIsCustModalOpen(false);
      } else {
        alert('Failed to save customer');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // SAVE ESTIMATE TO DATABASE
  const handleSaveEstimate = async () => {
    if (!projectData.projectName.trim()) {
      showStatus('warning', 'Project Name is required.');
      return;
    }
    if (!projectData.customerId) {
      showStatus('warning', 'Please select a counter type.');
      return;
    }

    const isAutoSpec = Boolean(counterTypeMaterialTemplates[projectData.customerId]);
    if (!isAutoSpec && selectedMaterialsList.some(item => !item.materialId)) {
      showStatus('warning', 'Please select a valid material for all rows.');
      return;
    }

    try {
      setLoading(true);
      const materialsList = isAutoSpec
        ? Object.entries(templateValues).map(([key, value]) => ({
            materialId: key,
            quantity: Number(value.quantity || 0),
            unitPrice: 0,
            total: 0
          }))
        : selectedMaterialsList.map(m => ({
            materialId: m.materialId,
            quantity: m.quantity,
            unitPrice: m.unitPrice,
            total: m.total
          }));

      const payload = {
        projectData: {
          ...projectData,
          totalAmount: grandTotal,
          labourCost: labourCostVal,
          transportCost: transportCostVal,
          discount: discountVal
        },
        materialsList
      };

      let res;
      if (projectToEdit) {
        res = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: projectToEdit._id, ...payload })
        });
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showStatus('success', projectToEdit ? 'Estimate updated successfully!' : 'Estimate saved successfully!');
        if (onSaveSuccess) {
          setTimeout(() => onSaveSuccess(), 1500);
        }
      } else {
        const err = await res.json();
        showStatus('error', err.error || 'Failed to save project.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Network error. Could not connect to API.');
    } finally {
      setLoading(false);
    }
  };

  // PDF GENERATION WITH jspdf & jspdf-autotable
  const handleGeneratePDF = (shouldPrint = false) => {
    const selectedCounterType = projectData.customerId;
    if (!projectData.projectName.trim() || !selectedCounterType) {
      showStatus('warning', 'Ensure Project Name and Counter Type are selected to generate PDF.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Header (Commercial Quotation styling)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('ABC FABRICATION', 14, 16);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Industrial & Structural Metal Fabricators', 14, 22);
    doc.text('Phone: +91 98765 43210 | Email: billing@abcfab.com', 14, 27);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('COMMERCIAL QUOTATION', 130, 20);

    // 2. Billing & Client Data Details
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text('CLIENT DETAILS', 14, 52);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Counter Type: ${selectedCounterType}`, 14, 58);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('QUOTATION DETAILS', 130, 52);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Project Name: ${projectData.projectName}`, 130, 58);
    doc.text(`Date: ${projectData.date}`, 130, 63);
    doc.text(`Quotation ID: QT-${Date.now().toString().slice(-6)}`, 130, 68);

    // Divider Line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, 78, 196, 78);

    // 3. Materials Table (Using autoTable)
    const tableHeaders = [['#', 'Material Description', 'Quantity', 'Unit', 'Rate', 'Amount']];
    const tableRows = selectedMaterialsList.map((item, idx) => {
      const mat = materials.find(m => m._id === item.materialId);
      return [
        idx + 1,
        mat ? mat.materialName : 'Custom Material',
        item.quantity,
        item.unit || 'Kg',
        `Rs. ${item.unitPrice.toLocaleString('en-IN')}`,
        `Rs. ${item.total.toLocaleString('en-IN')}`
      ];
    });

    doc.autoTable({
      startY: 84,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { width: 10, halign: 'center' },
        1: { width: 70 },
        2: { width: 25, halign: 'right' },
        3: { width: 20, halign: 'center' },
        4: { width: 30, halign: 'right' },
        5: { width: 30, halign: 'right' }
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    });

    // 4. Quotation Summary Details (Aligned on right side below table)
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Remarks Box on Left
    if (projectData.remarks) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(14, finalY, 95, 38, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, finalY, 95, 38, 'S');
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Terms & Remarks:', 18, finalY + 6);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const splitRemarks = doc.splitTextToSize(projectData.remarks, 85);
      doc.text(splitRemarks, 18, finalY + 12);
    }

    // Cost Breakdown on Right
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    
    let currentY = finalY + 5;
    const addSummaryRow = (label, value, isBold = false) => {
      if (isBold) {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
      } else {
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
      }
      doc.text(label, 130, currentY);
      doc.text(value, 196, currentY, { align: 'right' });
      currentY += 6;
    };

    addSummaryRow('Material Total:', `Rs. ${materialTotal.toLocaleString('en-IN')}`);
    addSummaryRow('Labour Cost:', `Rs. ${labourCostVal.toLocaleString('en-IN')}`);
    if (transportCostVal > 0) addSummaryRow('Transport Cost:', `Rs. ${transportCostVal.toLocaleString('en-IN')}`);
    if (discountVal > 0) addSummaryRow('Discount:', `- Rs. ${discountVal.toLocaleString('en-IN')}`);
    if (gstPercent > 0) addSummaryRow(`GST (${gstPercent}%):`, `Rs. ${gstAmount.toLocaleString('en-IN')}`);
    
    // Line before grand total
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(130, currentY, 196, currentY);
    currentY += 6;
    
    addSummaryRow('Grand Total:', `Rs. ${grandTotal.toLocaleString('en-IN')}`, true);

    // Signatures / Footer at very bottom
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a computer generated quotation and requires no physical signatures.', 14, 280);

    if (shouldPrint) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Quotation_${projectData.projectName.replace(/\s+/g, '_')}.pdf`);
      showStatus('success', 'PDF downloaded successfully!');
    }
  };

  const showStatus = (type, message) => {
    setStatusMessage({ type, text: message });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-sm font-medium tracking-wide">Loading workspace elements...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto relative">
      {/* Status Notifications */}
      {statusMessage && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
          statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
          statusMessage.type === 'warning' ? 'bg-amber-500/10 border-amber-500 text-amber-400' :
          'bg-red-500/10 border-red-500 text-red-400'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {projectToEdit ? 'Edit Cost Estimation' : 'New Cost Estimation'}
          </h1>
          <p className="text-slate-400 text-sm">Select materials and build real-time quotations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGeneratePDF(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all"
            title="Print Quotation"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => handleGeneratePDF(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all"
            title="Download PDF Invoice"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handleSaveEstimate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {projectToEdit ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Data */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4 border-b border-slate-800 pb-2">1. Client Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Shed Extension Structure"
                  value={projectData.projectName}
                  onChange={(e) => setProjectData({ ...projectData, projectName: e.target.value })}
                  className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm transition-all"
                />
              </div>

              {/* Counter Type Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Counter Type *</label>
                  <button
                    onClick={() => setIsCustModalOpen(true)}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    + New Customer
                  </button>
                </div>
                <select
                  value={projectData.customerId}
                  onChange={(e) => setProjectData({ ...projectData, customerId: e.target.value })}
                  className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm"
                >
                  <option value="">-- Select Counter Type --</option>
                  {counterTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  {projectData.customerId && !counterTypeOptions.includes(projectData.customerId) && (
                    <option value={projectData.customerId} hidden>{customers.find(c => c._id === projectData.customerId)?.counterType || customers.find(c => c._id === projectData.customerId)?.customerName || projectData.customerId}</option>
                  )}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
                <input
                  type="date"
                  value={projectData.date}
                  onChange={(e) => setProjectData({ ...projectData, date: e.target.value })}
                  className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              {/* Remarks */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Enter specifications, site notes, or instructions..."
                  value={projectData.remarks}
                  onChange={(e) => setProjectData({ ...projectData, remarks: e.target.value })}
                  className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Estimate Builder Table */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <h3 className="text-white font-bold text-base">2. Material Specifications</h3>
              <div className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Auto-generated from Counter Type
              </div>
            </div>


            {counterTypeMaterialTemplates[projectData.customerId] ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
                <table className="min-w-full border-separate border-spacing-0 text-sm text-left">
                  <thead className="sticky top-0 bg-slate-900 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">Material Component</th>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">Length</th>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">Width</th>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">Height</th>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">Thickness</th>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">Pipe Size</th>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">No. of Legs</th>
                      <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-b border-slate-800">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counterTypeMaterialTemplates[projectData.customerId].map((item, index) => (
                      <tr key={item.key} className={index % 2 === 0 ? 'bg-slate-950/70 hover:bg-slate-950' : 'bg-slate-950/40 hover:bg-slate-950'}>
                        <td className="px-4 py-4 text-white border-b border-slate-800">{item.name}</td>
                        <td className="px-4 py-4 border-b border-slate-800">
                          {item.fields.length ? (
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              value={templateValues[item.key]?.dims?.length || ''}
                              onChange={(e) => updateTemplateValue(item.key, 'dim', e.target.value, 'length')}
                              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-b border-slate-800">
                          {item.fields.width ? (
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              value={templateValues[item.key]?.dims?.width || ''}
                              onChange={(e) => updateTemplateValue(item.key, 'dim', e.target.value, 'width')}
                              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-b border-slate-800">
                          {item.fields.height ? (
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              value={templateValues[item.key]?.dims?.height || ''}
                              onChange={(e) => updateTemplateValue(item.key, 'dim', e.target.value, 'height')}
                              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-b border-slate-800">
                          {item.fields.thickness ? (
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              value={templateValues[item.key]?.dims?.thickness || ''}
                              onChange={(e) => updateTemplateValue(item.key, 'dim', e.target.value, 'thickness')}
                              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-b border-slate-800">
                          {item.fields.pipeSize ? (
                            <input
                              type="text"
                              value={templateValues[item.key]?.pipeSize || ''}
                              onChange={(e) => updateTemplateValue(item.key, 'pipeSize', e.target.value)}
                              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-b border-slate-800">
                          {item.fields.noOfLegs ? (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={templateValues[item.key]?.noOfLegs || ''}
                              onChange={(e) => updateTemplateValue(item.key, 'noOfLegs', e.target.value)}
                              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-b border-slate-800">
                          {item.fields.qty ? (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={templateValues[item.key]?.quantity || ''}
                              onChange={(e) => updateTemplateValue(item.key, 'quantity', e.target.value)}
                              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-slate-400 text-sm">
                Select a counter type to automatically load the Material Specification.
              </div>
            )}

            {!counterTypeMaterialTemplates[projectData.customerId] && (
              <div className="space-y-4">
                {selectedMaterialsList.map((row, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col md:flex-row md:items-end gap-3 p-4 bg-slate-950/40 border border-slate-800/50 rounded-xl relative group hover:border-slate-700/50 transition-all duration-300"
                  >
                    {/* Remove Button for row */}
                    <button
                      onClick={() => handleRemoveRow(index)}
                      disabled={selectedMaterialsList.length === 1}
                      className="absolute top-3 right-3 md:relative md:top-0 md:right-0 p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    {/* Material Selection */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 md:hidden">Material</label>
                      <select
                        value={row.materialId}
                        onChange={(e) => handleRowChange(index, 'materialId', e.target.value)}
                        className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                      >
                        <option value="">-- Choose Material --</option>
                        {materials.map(m => (
                          <option key={m._id} value={m._id}>{m.materialName} ({m.unit})</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity Input */}
                    <div className="w-full md:w-28">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 md:hidden">Quantity</label>
                      <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 focus-within:border-emerald-500 overflow-hidden pr-2">
                        <input
                          type="number"
                          step="any"
                          placeholder="Qty"
                          value={row.quantity}
                          onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                          className="w-full bg-transparent text-white px-3 py-2.5 focus:outline-none text-xs text-right font-semibold no-spinner"
                        />
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">{row.unit || '-'}</span>
                      </div>
                    </div>

                    {/* Rate Input */}
                    <div className="w-full md:w-32">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 md:hidden">Rate (₹)</label>
                      <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 focus-within:border-emerald-500 overflow-hidden pl-2">
                        <span className="text-xs text-slate-500 shrink-0 font-bold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Rate"
                          value={row.unitPrice}
                          onChange={(e) => handleRowChange(index, 'unitPrice', e.target.value)}
                          className="w-full bg-transparent text-white px-2 py-2.5 focus:outline-none text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="w-full md:w-36 text-right pb-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-left md:text-right">Line Total</span>
                      <span className="text-sm font-bold text-emerald-400 block pr-2">
                        ₹{row.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cost Summary & Actions Area */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 sticky top-8">
            <h3 className="text-white font-bold text-base mb-4 border-b border-slate-800 pb-2">3. Cost Summary</h3>
            <div className="space-y-4">
              {/* Material Total */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Material Total</span>
                <span className="text-white font-bold">₹{materialTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Labour Cost */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400 font-medium">Labour Cost (₹)</label>
                </div>
                <input
                  type="number"
                  placeholder="Enter labour amount"
                  value={projectData.labourCost || ''}
                  onChange={(e) => setProjectData({ ...projectData, labourCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-right"
                />
              </div>

              {/* Transport Cost */}
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">Transport Cost (₹)</label>
                <input
                  type="number"
                  placeholder="Optional delivery costs"
                  value={projectData.transportCost || ''}
                  onChange={(e) => setProjectData({ ...projectData, transportCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-right"
                />
              </div>

              {/* Discount Cost */}
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">Discount (₹)</label>
                <input
                  type="number"
                  placeholder="Optional deduction amount"
                  value={projectData.discount || ''}
                  onChange={(e) => setProjectData({ ...projectData, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-right"
                />
              </div>

              {/* Steel Weight */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-slate-400 text-sm uppercase tracking-wider">Steel Weight</p>
                    <p className="text-white text-lg font-bold">{totalSteelWeight.toFixed(2)} kg</p>
                  </div>
                  <div className="text-slate-400 text-xs">Automatically calculated from component dimensions</div>
                </div>
              </div>

              {/* GST Percent */}
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">GST Tax Rate (%)</label>
                <input
                  type="number"
                  placeholder="18"
                  value={projectData.gst}
                  onChange={(e) => setProjectData({ ...projectData, gst: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-right"
                />
              </div>

              <hr className="border-slate-800 my-2" />

              {/* GST Calculation Display */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Taxable Subtotal</span>
                <span>₹{taxableSubtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Calculated GST ({gstPercent}%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <hr className="border-slate-800 my-2" />

              {/* Grand Total */}
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-base">Grand Total</span>
                <span className="text-xl font-black text-emerald-400">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {isCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Create New Customer</h2>
              <button
                onClick={() => setIsCustModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleQuickCustomerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
                <input
                  type="text"
                  placeholder="Company name or person..."
                  value={custFormData.customerName}
                  onChange={(e) => setCustFormData({ ...custFormData, customerName: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border ${
                    custErrors.customerName ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-xs`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Counter Type *</label>
                <select
                  value={custFormData.counterType}
                  onChange={(e) => setCustFormData({ ...custFormData, counterType: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border ${
                    custErrors.counterType ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-xs`}
                >
                  <option value="">-- Select Counter Type --</option>
                  {counterTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {custErrors.counterType && (
                  <p className="text-red-400 text-[10px] mt-1.5 font-medium">{custErrors.counterType}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Optional email..."
                  value={custFormData.email}
                  onChange={(e) => setCustFormData({ ...custFormData, email: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address *</label>
                <textarea
                  rows="2"
                  placeholder="Billing address..."
                  value={custFormData.address}
                  onChange={(e) => setCustFormData({ ...custFormData, address: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border ${
                    custErrors.address ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-xs resize-none`}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
