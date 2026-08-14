import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Printer, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  X,
  RotateCcw,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { 
  COUNTER_TYPES, 
  COUNTER_TYPE_TEMPLATES, 
  STAINLESS_STEEL_GRADES, 
  STANDARD_GAUGES, 
  PIPE_MASTER,
  DEFAULT_GST_PERCENT 
} from '@/lib/constants';
import { 
  calculateRowWeight, 
  calculateEstimate, 
  calculatePurchasedItemWeight,
  formatCurrency, 
  formatWeight,
  formatPurchasedWeight 
} from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';

export default function EstimateBuilder({ projectToEdit, onSaveSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form State - Step 1: Client Data (Minimal & Clean)
  const [clientData, setClientData] = useState({
    customerName: '',
    companyName: '',
    phone: '',
    email: '',
    counterType: '',
    estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0]
  });

  // Form State - Step 2: Material Specifications (Sheet, Pipe, Purchased)
  const [sheets, setSheets] = useState([]);
  const [pipes, setPipes] = useState([]);
  const [purchased, setPurchased] = useState([]);

  // Form State - Step 3: Cost Summary Inputs (string-based to keep blank inputs visually empty)
  const [pricingInputs, setPricingInputs] = useState({
    materialRate: '',
    labourCost: '',
    gst: String(DEFAULT_GST_PERCENT),
    discount: ''
  });

  // Modal State for adding custom material row
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);

  // Initialize or Reopen Project
  useEffect(() => {
    if (projectToEdit) {
      setClientData({
        customerName: projectToEdit.customerName || '',
        companyName: projectToEdit.companyName || '',
        phone: projectToEdit.phone || '',
        email: projectToEdit.email || '',
        counterType: projectToEdit.counterType || '',
        estimateNumber: projectToEdit.estimateNumber || `EST-${Date.now().toString().slice(-6)}`,
        date: projectToEdit.date ? new Date(projectToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });

      setSheets(projectToEdit.sheets || []);
      setPipes(projectToEdit.pipes || []);
      setPurchased(projectToEdit.purchased || []);

      setPricingInputs({
        materialRate: projectToEdit.materialRate ? String(projectToEdit.materialRate) : '',
        labourCost: projectToEdit.labourCost ? String(projectToEdit.labourCost) : '',
        gst: projectToEdit.gst !== undefined ? String(projectToEdit.gst) : String(DEFAULT_GST_PERCENT),
        discount: projectToEdit.discount ? String(projectToEdit.discount) : ''
      });
    }
  }, [projectToEdit]);

  // Load Material Component Structure for Selected Counter Type (Without pre-filled dimensions or quantities)
  const loadCounterTemplate = (counterType) => {
    if (!counterType) {
      setSheets([]);
      setPipes([]);
      setPurchased([]);
      return;
    }
    const template = COUNTER_TYPE_TEMPLATES[counterType] || { sheets: [], pipes: [], purchased: [] };
    setSheets(JSON.parse(JSON.stringify(template.sheets || [])));
    setPipes(JSON.parse(JSON.stringify(template.pipes || [])));
    setPurchased(JSON.parse(JSON.stringify(template.purchased || [])));
  };

  const handleCounterTypeChange = (newType) => {
    setClientData(prev => ({ ...prev, counterType: newType }));
    loadCounterTemplate(newType);
  };

  // Helper to normalize numeric input (stripping non-numbers and invalid leading zeros)
  const sanitizeNumericInput = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return '';
    return String(val).replace(/^0+(?=\d)/, '');
  };

  // Master Reactive Calculation (Single Source of Truth)
  const calculation = useMemo(() => {
    const rate = parseFloat(pricingInputs.materialRate) || 0;
    const labour = parseFloat(pricingInputs.labourCost) || 0;
    const disc = parseFloat(pricingInputs.discount) || 0;
    const gstVal = pricingInputs.gst !== '' ? (parseFloat(pricingInputs.gst) || 0) : DEFAULT_GST_PERCENT;

    return calculateEstimate({
      materials: { sheets, pipes, purchased },
      materialRate: rate,
      labourCost: labour,
      discount: disc,
      gst: gstVal
    });
  }, [sheets, pipes, purchased, pricingInputs]);

  // Sheet Row Handlers
  const updateSheetRow = (index, field, value) => {
    setSheets(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const deleteSheetRow = (index) => {
    setSheets(prev => prev.filter((_, i) => i !== index));
  };

  // Pipe Row Handlers
  const updatePipeRow = (index, field, value) => {
    setPipes(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const deletePipeRow = (index) => {
    setPipes(prev => prev.filter((_, i) => i !== index));
  };

  // Purchased Row Handlers
  const updatePurchasedRow = (index, field, value) => {
    setPurchased(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const deletePurchasedRow = (index) => {
    setPurchased(prev => prev.filter((_, i) => i !== index));
  };

  // Add New Custom Material Row
  const handleAddNewMaterial = (type) => {
    setIsAddMaterialModalOpen(false);
    const newId = `custom-${Date.now()}`;
    if (type === 'SHEET') {
      setSheets(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
      ]);
    } else if (type === 'PIPE') {
      setPipes(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
      ]);
    } else if (type === 'PURCHASED') {
      setPurchased(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'purchased', quantity: '', unitWeight: '' }
      ]);
    }
  };

  // Action: + New Counter
  const handleResetNewCounter = () => {
    setClientData({
      customerName: '',
      companyName: '',
      phone: '',
      email: '',
      counterType: '',
      estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0]
    });
    setSheets([]);
    setPipes([]);
    setPurchased([]);
    setPricingInputs({
      materialRate: '',
      labourCost: '',
      gst: String(DEFAULT_GST_PERCENT),
      discount: ''
    });
    setCurrentStep(1);
    showStatus('success', 'Reset workspace for a New Counter Estimate.');
  };

  // Action: Save Project
  const handleSaveProject = async () => {
    if (!clientData.customerName.trim()) {
      showStatus('warning', 'Please provide a Customer Name.');
      setCurrentStep(1);
      return;
    }
    if (!clientData.counterType) {
      showStatus('warning', 'Please select a Counter Type in Step 1.');
      setCurrentStep(1);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        projectData: {
          estimateNumber: clientData.estimateNumber,
          projectName: `${clientData.counterType} - ${clientData.customerName}`,
          customerName: clientData.customerName,
          companyName: clientData.companyName,
          phone: clientData.phone,
          email: clientData.email,
          counterType: clientData.counterType,
          date: clientData.date,
          sheets,
          pipes,
          purchased,
          materialRate: parseFloat(pricingInputs.materialRate) || 0,
          labourCost: parseFloat(pricingInputs.labourCost) || 0,
          discount: parseFloat(pricingInputs.discount) || 0,
          gst: pricingInputs.gst !== '' ? parseFloat(pricingInputs.gst) : DEFAULT_GST_PERCENT,
          totalMaterialWeight: calculation.totalWeight,
          materialCost: calculation.materialCost,
          subtotal: calculation.subtotal,
          taxableAmount: calculation.taxableAmount,
          gstAmount: calculation.gstAmount,
          totalAmount: calculation.grandTotal,
          grandTotal: calculation.grandTotal
        }
      };

      const endpoint = '/api/projects';
      const method = projectToEdit ? 'PUT' : 'POST';
      const body = projectToEdit ? JSON.stringify({ id: projectToEdit._id, ...payload }) : JSON.stringify(payload);

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (res.ok) {
        showStatus('success', projectToEdit ? 'Project updated successfully!' : 'Project saved successfully!');
        if (onSaveSuccess) {
          setTimeout(() => onSaveSuccess(), 1000);
        }
      } else {
        const err = await res.json();
        showStatus('error', err.error || 'Failed to save project.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Network error. Could not connect to database.');
    } finally {
      setLoading(false);
    }
  };

  // Action: Generate Estimate (Download PDF)
  const handleGeneratePDF = () => {
    if (!clientData.customerName.trim()) {
      showStatus('warning', 'Please provide a Customer Name in Step 1.');
      setCurrentStep(1);
      return;
    }
    if (!clientData.counterType) {
      showStatus('warning', 'Please select a Counter Type in Step 1.');
      setCurrentStep(1);
      return;
    }

    try {
      generateQuotationPDF({
        ...clientData,
        sheets,
        pipes,
        purchased,
        materialRate: parseFloat(pricingInputs.materialRate) || 0,
        labourCost: parseFloat(pricingInputs.labourCost) || 0,
        discount: parseFloat(pricingInputs.discount) || 0,
        gst: pricingInputs.gst !== '' ? parseFloat(pricingInputs.gst) : DEFAULT_GST_PERCENT,
        totalMaterialWeight: calculation.totalWeight
      }, { shouldPrint: false });
      showStatus('success', 'Quotation PDF generated and downloaded.');
    } catch (e) {
      console.error('PDF Generation Error:', e);
      showStatus('error', 'Failed to generate PDF quotation.');
    }
  };

  // Action: Print
  const handlePrintQuotation = () => {
    if (!clientData.customerName.trim()) {
      showStatus('warning', 'Please provide a Customer Name in Step 1.');
      setCurrentStep(1);
      return;
    }
    if (!clientData.counterType) {
      showStatus('warning', 'Please select a Counter Type in Step 1.');
      setCurrentStep(1);
      return;
    }

    try {
      generateQuotationPDF({
        ...clientData,
        sheets,
        pipes,
        purchased,
        materialRate: parseFloat(pricingInputs.materialRate) || 0,
        labourCost: parseFloat(pricingInputs.labourCost) || 0,
        discount: parseFloat(pricingInputs.discount) || 0,
        gst: pricingInputs.gst !== '' ? parseFloat(pricingInputs.gst) : DEFAULT_GST_PERCENT,
        totalMaterialWeight: calculation.totalWeight
      }, { shouldPrint: true });
    } catch (e) {
      console.error('Print Error:', e);
      showStatus('error', 'Failed to trigger print quotation.');
    }
  };

  const showStatus = (type, message) => {
    setStatusMessage({ type, text: message });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-36 text-slate-800">
      {/* Toast Notification */}
      {statusMessage && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
          statusMessage.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-800' :
          'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
          <span className="text-xs font-bold">{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {projectToEdit ? 'Edit Estimate' : 'Estimate Builder'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">Shree Balaji Enterprises • Kitchen Equipment Cost Estimation</p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleResetNewCounter}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-sm"
            title="Clear and start a new estimate"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            + New Counter
          </button>
          <button
            onClick={handlePrintQuotation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-sm"
            title="Print Quotation"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print
          </button>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm"
            title="Download Quotation PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Generate Estimate
          </button>
          <button
            onClick={handleSaveProject}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {projectToEdit ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </div>

      {/* Exactly 3 Steps Navigation Wizard */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { step: 1, label: 'Step 1', name: 'Client Data' },
          { step: 2, label: 'Step 2', name: 'Material Specification' },
          { step: 3, label: 'Step 3', name: 'Weight Summary' }
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border transition-all duration-150 text-left ${
              currentStep === s.step
                ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm'
                : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${currentStep === s.step ? 'text-emerald-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-800 block mt-0.5">
                {s.name}
              </span>
            </div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-2 md:mt-0 ${
              currentStep === s.step ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {s.step}
            </div>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1 — CLIENT DATA */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Step 1 — Client Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                placeholder="Enter Customer Name"
                value={clientData.customerName}
                onChange={(e) => setClientData({ ...clientData, customerName: e.target.value })}
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs font-semibold"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                placeholder="Enter Company Name"
                value={clientData.companyName}
                onChange={(e) => setClientData({ ...clientData, companyName: e.target.value })}
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter Email Address"
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs"
              />
            </div>

            {/* Counter Type (REQUIRED DROPDOWN) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                Counter Type *
              </label>
              <select
                value={clientData.counterType}
                onChange={(e) => handleCounterTypeChange(e.target.value)}
                className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-lg border border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-xs font-bold"
              >
                <option value="">-- Select Counter Type --</option>
                {COUNTER_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stepper Proceed Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              Proceed to Material Specification
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 — MATERIAL SPECIFICATION */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 w-full">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Step 2 — Material Specification</h2>
              {clientData.counterType && (
                <span className="text-xs text-emerald-700 font-bold mt-0.5 inline-block">
                  {clientData.counterType}
                </span>
              )}
            </div>

            {clientData.counterType && (
              <button
                onClick={() => setIsAddMaterialModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                + New Material
              </button>
            )}
          </div>

          {/* Prompt if No Counter Type Selected */}
          {!clientData.counterType ? (
            <div className="bg-white border border-slate-200 rounded-xl py-20 px-6 text-center shadow-sm">
              <p className="text-slate-500 text-xs font-semibold">
                Please select a Counter Type in Step 1 (Client Data) to load the Material Specification.
              </p>
            </div>
          ) : (
            <>
              {/* 1. SHEET MATERIALS TABLE */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm w-full">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sheet Materials</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{sheets.length} component(s)</span>
                </div>

                {sheets.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">No sheet components configured.</p>
                ) : (
                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3">Material</th>
                          <th className="py-2.5 px-3 w-28">Grade</th>
                          <th className="py-2.5 px-3 w-24">Length</th>
                          <th className="py-2.5 px-3 w-24">Width</th>
                          <th className="py-2.5 px-3 w-28">Gauge</th>
                          <th className="py-2.5 px-3 w-20">Quantity</th>
                          <th className="py-2.5 px-3 text-center w-16">Unit</th>
                          <th className="py-2.5 px-3 text-right w-28">Weight</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {sheets.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          return (
                            <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="Material Name"
                                  value={row.material || ''}
                                  onChange={(e) => updateSheetRow(idx, 'material', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2.5 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={row.grade || 'SS304'}
                                  onChange={(e) => updateSheetRow(idx, 'grade', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                >
                                  {STAINLESS_STEEL_GRADES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  placeholder="Length"
                                  value={row.length !== undefined && row.length !== null ? row.length : ''}
                                  onChange={(e) => updateSheetRow(idx, 'length', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  placeholder="Width"
                                  value={row.width !== undefined && row.width !== null ? row.width : ''}
                                  onChange={(e) => updateSheetRow(idx, 'width', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={row.gauge !== undefined && row.gauge !== '' ? row.gauge : ''}
                                  onChange={(e) => updateSheetRow(idx, 'gauge', e.target.value ? parseFloat(e.target.value) : '')}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                >
                                  <option value="">Select Gauge</option>
                                  {STANDARD_GAUGES.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="Quantity"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updateSheetRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center text-slate-500 font-bold">
                                inch
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-700">
                                {formatWeight(rowWeight)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deleteSheetRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Remove Row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 2. PIPE MATERIALS TABLE */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm w-full">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-600"></div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pipe Materials</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{pipes.length} component(s)</span>
                </div>

                {pipes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">No pipe components configured.</p>
                ) : (
                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3">Material</th>
                          <th className="py-2.5 px-3 w-28">Grade</th>
                          <th className="py-2.5 px-3 w-48">Pipe Size</th>
                          <th className="py-2.5 px-3 w-28 text-right">Length (ft)</th>
                          <th className="py-2.5 px-3 w-24 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right w-28">Weight</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {pipes.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          return (
                            <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="Material Name"
                                  value={row.material || ''}
                                  onChange={(e) => updatePipeRow(idx, 'material', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2.5 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={row.grade || 'SS304'}
                                  onChange={(e) => updatePipeRow(idx, 'grade', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                >
                                  {STAINLESS_STEEL_GRADES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={row.pipeSize || ''}
                                  onChange={(e) => updatePipeRow(idx, 'pipeSize', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                >
                                  <option value="">Select Pipe Size</option>
                                  {PIPE_MASTER.map(p => (
                                    <option key={p.id} value={p.label}>{p.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  placeholder="Length (ft)"
                                  value={row.length !== undefined && row.length !== null ? row.length : ''}
                                  onChange={(e) => updatePipeRow(idx, 'length', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="Quantity"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updatePipeRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-cyan-700">
                                {formatWeight(rowWeight)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deletePipeRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Remove Row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 3. PURCHASED ITEMS TABLE */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm w-full">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Purchased Items</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{purchased.length} component(s)</span>
                </div>

                {purchased.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">No purchased items configured.</p>
                ) : (
                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3 text-left">Material</th>
                          <th className="py-2.5 px-3 w-36 text-center">Quantity</th>
                          <th className="py-2.5 px-3 w-44 text-center">Unit Weight (kg)</th>
                          <th className="py-2.5 px-3 text-center w-44">Total Weight (kg)</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {purchased.map((row, idx) => {
                          const purchasedWeight = calculatePurchasedItemWeight(row.quantity, row.unitWeight);
                          const totalWeightDisplay = purchasedWeight !== null ? purchasedWeight.toFixed(2) : '—';

                          return (
                            <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3 text-left">
                                <input
                                  type="text"
                                  placeholder="Item Name"
                                  value={row.material || ''}
                                  onChange={(e) => updatePurchasedRow(idx, 'material', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2.5 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Quantity"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updatePurchasedRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-center font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Unit Weight"
                                  value={row.unitWeight !== undefined && row.unitWeight !== null ? row.unitWeight : ''}
                                  onChange={(e) => updatePurchasedRow(idx, 'unitWeight', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-center font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-amber-700">
                                {totalWeightDisplay}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deletePurchasedRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Remove Row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Client Data
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              Review Weight Summary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3 — WEIGHT SUMMARY & PRICING */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Left Column: Weight Summary & Cost Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                Step 3 — Weight Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Counter Type */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Counter Type</span>
                  <span className="text-sm font-black text-slate-900">{clientData.counterType || 'N/A'}</span>
                </div>

                {/* Grand Total Material Weight */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Grand Total Material Weight</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {calculation.totalWeight > 0 ? `${calculation.totalWeight.toFixed(2)} kg` : '—'}
                  </span>
                </div>
              </div>

              {/* Estimate Cost Summary Inputs */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Estimate Cost Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Material Rate */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Material Rate (₹/kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Enter Rate per Kg"
                      value={pricingInputs.materialRate}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, materialRate: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs font-bold text-right"
                    />
                  </div>

                  {/* Labour Cost */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Labour Cost (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Enter Labour Cost"
                      value={pricingInputs.labourCost}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, labourCost: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs font-bold text-right"
                    />
                  </div>

                  {/* GST (%) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      GST (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      placeholder="18"
                      value={pricingInputs.gst}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, gst: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs font-bold text-right"
                    />
                  </div>

                  {/* Discount (₹) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Enter Discount"
                      value={pricingInputs.discount}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, discount: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs font-bold text-right"
                    />
                  </div>
                </div>

                {/* Back to Step 2 Navigation */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-start">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Material Specification
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 sticky top-8 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">
                Pricing Summary
              </h3>

              <div className="space-y-4">
                {/* Material Cost */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Material Cost</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(calculation.materialCost)}
                  </span>
                </div>

                {/* Grand Total Estimate */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Grand Total Estimate
                      </span>
                      <span className="text-xl font-black text-emerald-700 block mt-1">
                        {formatCurrency(calculation.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-5 border-t border-slate-100 mt-5">
                <button
                  onClick={handleGeneratePDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Generate Estimate
                </button>

                <button
                  onClick={handleSaveProject}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {projectToEdit ? 'Update Project' : 'Save Project'}
                </button>

                <button
                  onClick={handlePrintQuotation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Custom Material Row Modal */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Material Category</h3>
              <button
                onClick={() => setIsAddMaterialModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleAddNewMaterial('SHEET')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></div>
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">Sheet Material</span>
                  <span className="text-[10px] text-slate-500">Length & Width in inches, Gauge in mm</span>
                </div>
              </button>

              <button
                onClick={() => handleAddNewMaterial('PIPE')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-left transition-all group"
              >
                <div className="w-3 h-3 rounded-full bg-cyan-600 shrink-0"></div>
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 block">Pipe Material</span>
                  <span className="text-[10px] text-slate-500">Pipe Size & Length in ft</span>
                </div>
              </button>

              <button
                onClick={() => handleAddNewMaterial('PURCHASED')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 text-left transition-all group"
              >
                <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 block">Purchased Item</span>
                  <span className="text-[10px] text-slate-500">Quantity & Unit Weight in kg</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
