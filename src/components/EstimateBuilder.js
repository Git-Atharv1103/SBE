import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ArrowLeft,
  Package,
  Layers,
  Wrench,
  Scale,
  PlusCircle,
  Cpu
} from 'lucide-react';
import {
  COUNTER_TYPES,
  COUNTER_TYPES_CONFIG,
  SHEET_GRADES,
  STAINLESS_STEEL_GRADES,
  STANDARD_GAUGES,
  STANDARD_GAUGE_WEIGHTS,
  FRIDGE_GAUGES,
  PIPE_MASTER,
  ANGLE_MASTER,
  ANGLE_GAUGE_OPTIONS,
  BURNER_SIZES,
  COPPER_PIPE_SIZES,
  MIXING_TUBE_SIZES,
  DOSA_BURNER_SIZES,
  getItemSizeOptions,
  DEFAULT_GST_PERCENT,
  getFallbackCounterTemplate
} from '@/lib/constants';
import {
  calculateRowWeight,
  calculateAngleWeight,
  calculateEstimate,
  calculatePurchasedItemPrice,
  formatCurrency,
  formatWeight,
  formatPurchasedPrice
} from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';

export default function EstimateBuilder({ projectToEdit, onSaveSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Master Materials & Counter Types from API
  const [masterMaterials, setMasterMaterials] = useState([]);
  const [masterCounterTypes, setMasterCounterTypes] = useState([]);
  const [isMasterLoading, setIsMasterLoading] = useState(true);

  // Form State - Step 1: Client Data
  const [clientData, setClientData] = useState({
    customerName: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    counterType: '',
    counterSubtype: '',
    estimateNumber: 'EST 01',
    date: new Date().toISOString().split('T')[0]
  });

  // Form State - Step 2: Material Specifications (Sheet, Pipe, Angle, Purchased, Compressor)
  const [sheets, setSheets] = useState([]);
  const [pipes, setPipes] = useState([]);
  const [angles, setAngles] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [compressor, setCompressor] = useState([]);

  // Form State - Step 3: Cost Summary Inputs
  const [pricingInputs, setPricingInputs] = useState({
    materialRate: '',
    labourCost: '',
    gst: String(DEFAULT_GST_PERCENT),
    discount: ''
  });

  // Modal State for adding custom or catalog material row
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('ALL');

  // Fetch next sequential estimate number from API
  const fetchNextEstimateNumber = async () => {
    try {
      const res = await fetch('/api/projects?action=nextEstimateNumber');
      if (res.ok) {
        const json = await res.json();
        if (json.nextEstimateNumber) {
          setClientData(prev => ({
            ...prev,
            estimateNumber: json.nextEstimateNumber
          }));
          return json.nextEstimateNumber;
        }
      }
    } catch (err) {
      console.error('Failed to fetch next estimate number:', err);
    }
    return 'EST 01';
  };

  // Fetch all materials & counter types from Master on mount
  useEffect(() => {
    fetchMasterData();
    if (!projectToEdit) {
      fetchNextEstimateNumber();
    }
  }, [projectToEdit]);

  const fetchMasterData = async () => {
    try {
      setIsMasterLoading(true);
      const [mRes, ctRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/counter-types')
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMasterMaterials(mData);
      }
      if (ctRes.ok) {
        const ctData = await ctRes.json();
        setMasterCounterTypes(ctData);
      }
    } catch (err) {
      console.error('Failed to load Master data in Project Estimate:', err);
    } finally {
      setIsMasterLoading(false);
    }
  };

  // Derive active counter type configuration (check if it has subtypes)
  const currentCounterConfig = useMemo(() => {
    if (!clientData.counterType) return { hasSubtypes: false, subtypes: [] };
    return COUNTER_TYPES_CONFIG[clientData.counterType] || { hasSubtypes: false, subtypes: [] };
  }, [clientData.counterType]);

  // Dynamically derive all available main counter types from Master + constants
  const availableCounterTypes = useMemo(() => {
    const set = new Set();
    COUNTER_TYPES.forEach(ct => set.add(ct));
    masterCounterTypes.forEach(ct => { if (ct.name && ct.status !== 'Inactive') set.add(ct.name.trim()); });
    return Array.from(set);
  }, [masterCounterTypes]);

  // Load Material Component Structure for Selected Counter Type and Subtype from Material Master
  const loadMaterialsForCounterType = useCallback((counterType, counterSubtype, allMaterials = masterMaterials) => {
    if (!counterType) {
      setSheets([]);
      setPipes([]);
      setAngles([]);
      setPurchased([]);
      setCompressor([]);
      return;
    }

    const config = COUNTER_TYPES_CONFIG[counterType] || { hasSubtypes: false, subtypes: [] };
    if (config.hasSubtypes && !counterSubtype) {
      setSheets([]);
      setPipes([]);
      setAngles([]);
      setPurchased([]);
      setCompressor([]);
      return;
    }

    const targetKey = (config.hasSubtypes && counterSubtype) ? counterSubtype : counterType;

    // Filter active products configured for this Counter Type / Subtype in Material Master
    const configuredMaterials = (allMaterials || []).filter(m => 
      m.status !== 'Inactive' &&
      Array.isArray(m.counterTypes) && 
      (m.counterTypes.includes(targetKey) || m.counterTypes.includes(counterType))
    );

    if (configuredMaterials.length > 0) {
      // 1. Sheets
      const sheetRows = configuredMaterials
        .filter(m => (m.category || '').toLowerCase() === 'sheet' || (m.calculationType || '').toLowerCase() === 'sheet')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((m, idx) => {
          let gaugeOpts = Array.isArray(m.gaugeOptions) && m.gaugeOptions.length > 0 ? m.gaugeOptions : null;
          let initialGauge = m.gauge !== undefined && m.gauge !== null && m.gauge !== '' 
            ? parseFloat(m.gauge) 
            : (gaugeOpts ? gaugeOpts[0] : '');

          return {
            id: `sheet-${m._id || idx}-${Date.now()}-${idx}`,
            materialId: m._id,
            material: m.materialName,
            calculationType: 'sheet',
            grade: m.grade ? String(m.grade).replace(/^SS/i, '') : '304',
            length: '',
            width: '',
            gauge: initialGauge,
            gaugeOptions: gaugeOpts,
            quantity: '',
            unit: 'inch'
          };
        });

      // 2. Pipes
      const pipeRows = configuredMaterials
        .filter(m => (m.category || '').toLowerCase() === 'pipe' || (m.calculationType || '').toLowerCase() === 'pipe')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((m, idx) => ({
          id: `pipe-${m._id || idx}-${Date.now()}-${idx}`,
          materialId: m._id,
          material: m.materialName,
          calculationType: 'pipe',
          grade: m.grade ? String(m.grade).replace(/^SS/i, '') : '304',
          pipeSize: m.pipeSize || '',
          length: '',
          quantity: ''
        }));

      // 3. Angles (Only if configured)
      const angleRows = configuredMaterials
        .filter(m => (m.category || '').toLowerCase() === 'angle' || (m.calculationType || '').toLowerCase() === 'angle')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((m, idx) => ({
          id: `angle-${m._id || idx}-${Date.now()}-${idx}`,
          materialId: m._id,
          material: m.materialName,
          calculationType: 'angle',
          grade: m.grade ? String(m.grade).replace(/^SS/i, '') : '304',
          gauge: m.gauge || '25 × 3 mm',
          length: '',
          quantity: ''
        }));

      // Set sheets, pipes, and angles from template
      setSheets(sheetRows);
      setPipes(pipeRows);
      setAngles(angleRows);
      // Purchased and compressor items are explicitly added by the user as needed
      setPurchased([]);
      setCompressor([]);
    } else {
      // Fallback from central templates
      const fallback = getFallbackCounterTemplate(targetKey);
      setSheets(JSON.parse(JSON.stringify(fallback.sheets || [])));
      setPipes(JSON.parse(JSON.stringify(fallback.pipes || [])));
      setAngles(JSON.parse(JSON.stringify(fallback.angles || [])));
      setPurchased([]);
      setCompressor([]);
    }
  }, [masterMaterials]);

  // Handle Counter Type Selection Change in Step 1
  const handleCounterTypeChange = (newType) => {
    const config = COUNTER_TYPES_CONFIG[newType] || { hasSubtypes: false, subtypes: [] };
    const defaultSubtype = config.hasSubtypes ? '' : '';
    setClientData(prev => ({ ...prev, counterType: newType, counterSubtype: defaultSubtype }));
    if (!config.hasSubtypes) {
      loadMaterialsForCounterType(newType, '');
    } else {
      setSheets([]);
      setPipes([]);
      setAngles([]);
      setPurchased([]);
      setCompressor([]);
    }
  };

  // Handle Subtype Selection Change in Step 1
  const handleSubtypeChange = (newSubtype) => {
    setClientData(prev => ({ ...prev, counterSubtype: newSubtype }));
    if (newSubtype) {
      loadMaterialsForCounterType(clientData.counterType, newSubtype);
    } else {
      setSheets([]);
      setPipes([]);
      setAngles([]);
      setPurchased([]);
      setCompressor([]);
    }
  };

  // Initialize or Reopen Project
  useEffect(() => {
    if (projectToEdit) {
      setClientData({
        customerName: projectToEdit.customerName || '',
        companyName: projectToEdit.companyName || '',
        phone: projectToEdit.phone || '',
        email: projectToEdit.email || '',
        address: projectToEdit.address || '',
        counterType: projectToEdit.counterType || '',
        counterSubtype: projectToEdit.counterSubtype || '',
        estimateNumber: projectToEdit.estimateNumber || 'EST 01',
        date: projectToEdit.date ? new Date(projectToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });

      setSheets(projectToEdit.sheets || []);
      setPipes(projectToEdit.pipes || []);
      setAngles(projectToEdit.angles || []);
      setPurchased(projectToEdit.purchased || []);
      setCompressor(projectToEdit.compressor || []);

      setPricingInputs({
        materialRate: projectToEdit.materialRate ? String(projectToEdit.materialRate) : '',
        labourCost: projectToEdit.labourCost ? String(projectToEdit.labourCost) : '',
        gst: projectToEdit.gst !== undefined ? String(projectToEdit.gst) : String(DEFAULT_GST_PERCENT),
        discount: projectToEdit.discount ? String(projectToEdit.discount) : ''
      });
    }
  }, [projectToEdit]);

  // Helper to normalize numeric input
  const sanitizeNumericInput = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return '';
    return String(val).replace(/^0+(?=\d)/, '');
  };

  // Master Reactive Calculation
  const calculation = useMemo(() => {
    const rate = parseFloat(pricingInputs.materialRate) || 0;
    const labour = parseFloat(pricingInputs.labourCost) || 0;
    const disc = parseFloat(pricingInputs.discount) || 0;
    const gstVal = pricingInputs.gst !== '' ? (parseFloat(pricingInputs.gst) || 0) : DEFAULT_GST_PERCENT;

    return calculateEstimate({
      materials: { sheets, pipes, angles, purchased, compressor },
      materialRate: rate,
      labourCost: labour,
      discount: disc,
      gst: gstVal
    });
  }, [sheets, pipes, angles, purchased, compressor, pricingInputs]);

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

  // Angle Row Handlers
  const updateAngleRow = (index, field, value) => {
    setAngles(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const deleteAngleRow = (index) => {
    setAngles(prev => prev.filter((_, i) => i !== index));
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

  // Compressor Row Handlers
  const updateCompressorRow = (index, field, value) => {
    setCompressor(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const deleteCompressorRow = (index) => {
    setCompressor(prev => prev.filter((_, i) => i !== index));
  };

  // Duplicate / Add another instance of a repeatable purchased item (e.g. Burner, Copper Pipe, Mixing Tube, Patti, Bar, GN Pan, Round Vessel)
  const handleAddRepeatablePurchasedItem = (baseItem) => {
    const dropdownOpts = baseItem.dropdownOptions || getItemSizeOptions(baseItem.material);
    const newRow = {
      id: `pur-repeat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      materialId: baseItem.materialId || '',
      material: baseItem.material,
      calculationType: 'purchased',
      dropdownOptions: dropdownOpts,
      allowMultiple: true,
      size: dropdownOpts ? dropdownOpts[0] : (baseItem.size || ''),
      quantity: '',
      price: baseItem.price || ''
    };
    setPurchased(prev => [...prev, newRow]);
  };

  // Duplicate / Add another instance of a compressor item
  const handleAddRepeatableCompressorItem = (baseItem) => {
    const newRow = {
      id: `comp-repeat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      materialId: baseItem.materialId || '',
      material: baseItem.material,
      calculationType: 'compressor',
      category: 'Compressor',
      dropdownOptions: baseItem.dropdownOptions || null,
      allowMultiple: true,
      size: (baseItem.dropdownOptions && baseItem.dropdownOptions.length > 0) ? baseItem.dropdownOptions[0] : (baseItem.size || ''),
      quantity: '',
      price: baseItem.price || ''
    };
    setCompressor(prev => [...prev, newRow]);
  };

  // Add custom or catalog material row
  const handleAddNewMaterial = (type) => {
    setIsAddMaterialModalOpen(false);
    const newId = `custom-${Date.now()}`;
    if (type === 'SHEET') {
      setSheets(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'sheet', grade: '304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
      ]);
    } else if (type === 'PIPE') {
      setPipes(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'pipe', grade: '304', pipeSize: '', length: '', quantity: '' }
      ]);
    } else if (type === 'ANGLE') {
      setAngles(prev => [
        ...prev,
        { id: newId, material: 'Angle', calculationType: 'angle', grade: '304', gauge: '25 × 3 mm', length: '', quantity: '' }
      ]);
    } else if (type === 'PURCHASED') {
      setPurchased(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'purchased', size: '', quantity: '', price: '' }
      ]);
    } else if (type === 'COMPRESSOR') {
      setCompressor(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'compressor', category: 'Compressor', size: '', quantity: '', price: '' }
      ]);
    }
  };

  // Add selected item from Material Master catalog
  const handleAddFromCatalog = (mat) => {
    setIsAddMaterialModalOpen(false);
    const newId = `master-${mat._id || Date.now()}-${Date.now()}`;
    const cat = (mat.category || '').toLowerCase();

    if (cat === 'sheet') {
      const gaugeOpts = Array.isArray(mat.gaugeOptions) && mat.gaugeOptions.length > 0 ? mat.gaugeOptions : null;
      setSheets(prev => [
        ...prev,
        {
          id: newId,
          materialId: mat._id,
          material: mat.materialName,
          calculationType: 'sheet',
          grade: mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304',
          length: '',
          width: '',
          gauge: mat.gauge || (gaugeOpts ? gaugeOpts[0] : ''),
          gaugeOptions: gaugeOpts,
          quantity: '',
          unit: 'inch'
        }
      ]);
    } else if (cat === 'pipe') {
      setPipes(prev => [
        ...prev,
        {
          id: newId,
          materialId: mat._id,
          material: mat.materialName,
          calculationType: 'pipe',
          grade: mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304',
          pipeSize: mat.pipeSize || '',
          length: '',
          quantity: ''
        }
      ]);
    } else if (cat === 'angle') {
      setAngles(prev => [
        ...prev,
        {
          id: newId,
          materialId: mat._id,
          material: mat.materialName,
          calculationType: 'angle',
          grade: mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304',
          gauge: mat.gauge || '25 × 3 mm',
          length: '',
          quantity: ''
        }
      ]);
    } else if (cat === 'compressor' || cat === 'special') {
      const dropdownOpts = Array.isArray(mat.dropdownOptions) && mat.dropdownOptions.length > 0 ? mat.dropdownOptions : null;
      setCompressor(prev => [
        ...prev,
        {
          id: newId,
          materialId: mat._id,
          material: mat.materialName,
          calculationType: 'compressor',
          category: 'Compressor',
          dropdownOptions: dropdownOpts,
          allowMultiple: Boolean(mat.allowMultiple),
          size: dropdownOpts ? dropdownOpts[0] : '',
          quantity: '1',
          price: mat.price !== null && mat.price !== undefined ? String(mat.price) : ''
        }
      ]);
    } else {
      const dropdownOpts = Array.isArray(mat.dropdownOptions) && mat.dropdownOptions.length > 0 
        ? mat.dropdownOptions 
        : (Array.isArray(mat.options) && mat.options.length > 0 ? mat.options : getItemSizeOptions(mat.materialName));
      setPurchased(prev => [
        ...prev,
        {
          id: newId,
          materialId: mat._id,
          material: mat.materialName,
          calculationType: 'purchased',
          dropdownOptions: dropdownOpts,
          allowMultiple: Boolean(mat.allowMultiple) || (dropdownOpts && dropdownOpts.length > 0),
          size: dropdownOpts ? dropdownOpts[0] : '',
          quantity: '1',
          price: mat.price !== null && mat.price !== undefined ? String(mat.price) : ''
        }
      ]);
    }
  };

  // Action: + New Counter
  const handleResetNewCounter = async () => {
    let nextNum = 'EST 01';
    try {
      const res = await fetch('/api/projects?action=nextEstimateNumber');
      if (res.ok) {
        const json = await res.json();
        if (json.nextEstimateNumber) nextNum = json.nextEstimateNumber;
      }
    } catch (e) {
      console.error('Failed to fetch next estimate number on reset:', e);
    }

    setClientData({
      customerName: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      counterType: '',
      counterSubtype: '',
      estimateNumber: nextNum,
      date: new Date().toISOString().split('T')[0]
    });
    setSheets([]);
    setPipes([]);
    setAngles([]);
    setPurchased([]);
    setCompressor([]);
    setPricingInputs({
      materialRate: '',
      labourCost: '',
      gst: String(DEFAULT_GST_PERCENT),
      discount: ''
    });
    setCurrentStep(1);
    showStatus('success', `Reset workspace for New Counter Estimate (${nextNum}).`);
  };

  // Action: Save Project
  const handleSaveProject = async () => {
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
    if (currentCounterConfig.hasSubtypes && !clientData.counterSubtype) {
      showStatus('warning', `Please select ${currentCounterConfig.subtypeLabel} in Step 1.`);
      setCurrentStep(1);
      return;
    }

    try {
      setLoading(true);
      const displayProjectName = clientData.counterSubtype 
        ? `${clientData.counterType} (${clientData.counterSubtype}) - ${clientData.customerName}`
        : `${clientData.counterType} - ${clientData.customerName}`;

      const payload = {
        projectData: {
          estimateNumber: clientData.estimateNumber,
          projectName: displayProjectName,
          customerName: clientData.customerName,
          companyName: clientData.companyName,
          phone: clientData.phone,
          email: clientData.email,
          address: clientData.address,
          counterType: clientData.counterType,
          counterSubtype: clientData.counterSubtype,
          date: clientData.date,
          sheets,
          pipes,
          angles,
          purchased,
          compressor,
          materialRate: parseFloat(pricingInputs.materialRate) || 0,
          labourCost: parseFloat(pricingInputs.labourCost) || 0,
          discount: parseFloat(pricingInputs.discount) || 0,
          gst: pricingInputs.gst !== '' ? parseFloat(pricingInputs.gst) : DEFAULT_GST_PERCENT,
          totalMaterialWeight: calculation.totalWeight,
          materialCost: calculation.materialCost,
          purchasedItemCost: calculation.purchasedItemCost,
          discountedMaterialCost: calculation.discountedMaterialCost,
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
    if (currentCounterConfig.hasSubtypes && !clientData.counterSubtype) {
      showStatus('warning', `Please select ${currentCounterConfig.subtypeLabel} in Step 1.`);
      setCurrentStep(1);
      return;
    }

    try {
      generateQuotationPDF({
        ...clientData,
        sheets,
        pipes,
        angles,
        purchased,
        compressor,
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
    if (currentCounterConfig.hasSubtypes && !clientData.counterSubtype) {
      showStatus('warning', `Please select ${currentCounterConfig.subtypeLabel} in Step 1.`);
      setCurrentStep(1);
      return;
    }

    try {
      generateQuotationPDF({
        ...clientData,
        sheets,
        pipes,
        angles,
        purchased,
        compressor,
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
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Project Estimate Builder
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-medium">
            Single-source Material Master driven commercial fabrication estimate generator
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetNewCounter}
            className="btn-3d btn-3d-slate px-3.5 py-2 text-xs"
            title="Reset to New Counter"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            + New Counter
          </button>
          <button
            onClick={handlePrintQuotation}
            className="btn-3d btn-3d-slate px-3.5 py-2 text-xs"
            title="Print Quotation"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print
          </button>
          <button
            onClick={handleGeneratePDF}
            className="btn-3d px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 border border-slate-700"
            title="Download Quotation PDF"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Generate PDF
          </button>
          <button
            onClick={handleSaveProject}
            disabled={loading}
            className="btn-3d btn-3d-emerald px-5 py-2 text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            {projectToEdit ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </div>

      {/* Modern 3D 3-Step Wizard Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          { 
            step: 1, 
            label: 'Step 1', 
            name: 'Client & Counter Selection', 
            activeStyle: 'bg-linear-to-r from-blue-50/90 to-indigo-50/60 border-blue-400 text-blue-900 shadow-sm ring-2 ring-blue-500/15',
            badgeActive: 'bg-blue-600 text-white shadow-xs',
            themeColor: 'text-blue-600'
          },
          { 
            step: 2, 
            label: 'Step 2', 
            name: 'Material Specifications', 
            activeStyle: 'bg-linear-to-r from-teal-50/90 to-cyan-50/60 border-teal-400 text-teal-900 shadow-sm ring-2 ring-teal-500/15',
            badgeActive: 'bg-teal-600 text-white shadow-xs',
            themeColor: 'text-teal-600'
          },
          { 
            step: 3, 
            label: 'Step 3', 
            name: 'Weight & Pricing Summary', 
            activeStyle: 'bg-linear-to-r from-violet-50/90 to-purple-50/60 border-violet-400 text-violet-900 shadow-sm ring-2 ring-violet-500/15',
            badgeActive: 'bg-violet-600 text-white shadow-xs',
            themeColor: 'text-violet-600'
          }
        ].map((s) => {
          const isActive = currentStep === s.step;
          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`card-3d-interactive flex items-center justify-between p-4 text-left cursor-pointer transition-all ${
                isActive 
                  ? `${s.activeStyle} border-2` 
                  : 'bg-white hover:bg-slate-50/80 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest block text-slate-400">
                  {s.label}
                </span>
                <span className={`text-xs font-black block mt-0.5 ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                  {s.name}
                </span>
              </div>
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                isActive ? s.badgeActive : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {s.step}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1 — CLIENT DATA */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="card-3d p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Step 1 — Client Information & Counter Selection
                </h2>
              </div>
              <p className="text-xs text-slate-500">Define estimate metadata and choose the target commercial fabrication counter</p>
            </div>
            <div className="px-3.5 py-1.5 bg-blue-50 text-blue-900 rounded-xl font-mono text-xs font-black border border-blue-200 shadow-2xs">
              {clientData.estimateNumber}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer / Client Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={clientData.customerName}
                onChange={(e) => setClientData({ ...clientData, customerName: e.target.value })}
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none text-xs font-bold transition-all"
              />
            </div>

            {/* Company / Hotel Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company / Hotel Name
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Hospitality Group"
                value={clientData.companyName}
                onChange={(e) => setClientData({ ...clientData, companyName: e.target.value })}
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none text-xs transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none text-xs transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. contact@royalhospitality.in"
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none text-xs transition-all"
              />
            </div>

            {/* Customer Address / Site Location */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Address / Site Location
              </label>
              <input
                type="text"
                placeholder="e.g. Shop 4, Katraj-Kondhwa Road, Pune - 411046"
                value={clientData.address}
                onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none text-xs transition-all"
              />
            </div>

            {/* Counter Type Selector */}
            <div className={`p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2 ${currentCounterConfig.hasSubtypes ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  Select Counter Type *
                </label>
                <span className="text-[10px] text-blue-600 font-bold">Standard Templates</span>
              </div>
              <select
                value={clientData.counterType}
                onChange={(e) => handleCounterTypeChange(e.target.value)}
                className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none text-xs font-black shadow-2xs"
              >
                <option value="">-- Choose Counter Type --</option>
                {availableCounterTypes.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Conditionally Render Subtype Selector (e.g. Storage Bin, Fridge, Gas Range, Shawarma Cabin) */}
            {currentCounterConfig.hasSubtypes && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-300 space-y-2 md:col-span-1 animate-in fade-in duration-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black text-blue-900 uppercase tracking-wider">
                    {currentCounterConfig.subtypeLabel || 'Counter Subtype'} *
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold">Required</span>
                </div>
                <select
                  value={clientData.counterSubtype}
                  onChange={(e) => handleSubtypeChange(e.target.value)}
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-xs font-black shadow-2xs"
                >
                  <option value="">-- Select {currentCounterConfig.subtypeLabel} --</option>
                  {currentCounterConfig.subtypes.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={() => {
                if (!clientData.customerName.trim()) {
                  showStatus('warning', 'Please enter a Customer Name.');
                  return;
                }
                if (!clientData.counterType) {
                  showStatus('warning', 'Please select a Counter Type.');
                  return;
                }
                if (currentCounterConfig.hasSubtypes && !clientData.counterSubtype) {
                  showStatus('warning', `Please select ${currentCounterConfig.subtypeLabel}.`);
                  return;
                }
                setCurrentStep(2);
              }}
              className="btn-3d btn-3d-blue px-6 py-2.5 text-xs shadow-md"
            >
              Continue to Material Specifications
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 — MATERIAL SPECIFICATIONS */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 w-full">
          {/* Top Info & Actions Banner */}
          <div className="card-3d p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-teal-200/70 bg-linear-to-r from-white via-teal-50/20 to-cyan-50/20">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block">Active Counter Template</span>
                <h2 className="text-sm font-black text-slate-900 leading-snug">
                  {clientData.counterType || 'Not Selected'}
                  {clientData.counterSubtype ? ` — ${clientData.counterSubtype}` : ''}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMaterialModalOpen(true)}
                className="btn-3d btn-3d-emerald px-4 py-2 text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Component Row
              </button>
            </div>
          </div>

          {!clientData.counterType || (currentCounterConfig.hasSubtypes && !clientData.counterSubtype) ? (
            <div className="card-3d p-12 text-center">
              <AlertCircle className="w-9 h-9 text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-slate-700 font-bold">
                {!clientData.counterType 
                  ? 'Please select a Counter Type in Step 1 to load material specifications.' 
                  : `Please select ${currentCounterConfig.subtypeLabel} in Step 1 to load material specifications.`}
              </p>
              <button
                onClick={() => setCurrentStep(1)}
                className="mt-3 text-xs text-teal-700 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                ← Go back to Step 1
              </button>
            </div>
          ) : (
            <>
              {/* 1. SHEET MATERIALS TABLE (TEAL / CYAN THEME) */}
              <div className="card-3d p-5 w-full border-teal-200/80 bg-linear-to-b from-white to-teal-50/10">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-2xs"></span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Sheet Materials</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {sheets.length} component(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('SHEET')}
                      className="btn-3d btn-3d-teal px-3 py-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Sheet
                    </button>
                  </div>
                </div>

                {sheets.length === 0 ? (
                  <div className="py-7 text-center bg-teal-50/20 rounded-xl border border-dashed border-teal-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No sheet materials in this estimate specification.</p>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('SHEET')}
                      className="btn-3d btn-3d-teal px-4 py-1.5 text-xs inline-flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      + Add Sheet Material
                    </button>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3">Material</th>
                          <th className="py-2.5 px-3 w-28">Grade</th>
                          <th className="py-2.5 px-3 w-24">Length (in)</th>
                          <th className="py-2.5 px-3 w-24">Width (in)</th>
                          <th className="py-2.5 px-3 w-36">Gauge</th>
                          <th className="py-2.5 px-3 w-20">Quantity</th>
                          <th className="py-2.5 px-3 text-center w-16">Unit</th>
                          <th className="py-2.5 px-3 text-right w-28">Weight</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        {sheets.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          const currentGrade = row.grade ? String(row.grade).replace(/^SS/i, '') : '304';
                          const hasCustomGaugeOpts = Array.isArray(row.gaugeOptions) && row.gaugeOptions.length > 0;

                          return (
                            <tr key={row.id || idx} className="hover:bg-teal-50/30 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="Material Name"
                                  value={row.material || ''}
                                  onChange={(e) => updateSheetRow(idx, 'material', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={currentGrade}
                                  onChange={(e) => updateSheetRow(idx, 'grade', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-semibold"
                                >
                                  {SHEET_GRADES.map(g => (
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
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-right font-semibold"
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
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                {hasCustomGaugeOpts ? (
                                  <select
                                    value={row.gauge !== undefined && row.gauge !== '' ? row.gauge : ''}
                                    onChange={(e) => updateSheetRow(idx, 'gauge', e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full bg-teal-50/80 text-teal-900 px-2.5 py-1.5 rounded-lg border border-teal-300 focus:border-teal-500 focus:outline-none text-xs font-black shadow-2xs"
                                  >
                                    <option value="">Select Gauge</option>
                                    {row.gaugeOptions.map(g => (
                                      <option key={g} value={g}>
                                        {g} mm ({STANDARD_GAUGE_WEIGHTS[g] ? `${STANDARD_GAUGE_WEIGHTS[g]} kg/sq.ft` : `${g} mm`})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <select
                                    value={row.gauge !== undefined && row.gauge !== '' ? row.gauge : ''}
                                    onChange={(e) => updateSheetRow(idx, 'gauge', e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-semibold"
                                  >
                                    <option value="">Select Gauge</option>
                                    {STANDARD_GAUGES.map(g => (
                                      <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="Qty"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updateSheetRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-right font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center text-slate-400 font-bold">
                                inch
                              </td>
                              <td className="py-2 px-3 text-right font-black text-teal-700">
                                {formatWeight(rowWeight)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deleteSheetRow(idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

              {/* 2. PIPE MATERIALS TABLE (SKY / BLUE THEME) */}
              <div className="card-3d p-5 w-full border-sky-200/80 bg-linear-to-b from-white to-sky-50/10">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-2xs"></span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Pipe Materials</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-sky-800 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {pipes.length} component(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('PIPE')}
                      className="btn-3d btn-3d-sky px-3 py-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Pipe
                    </button>
                  </div>
                </div>

                {pipes.length === 0 ? (
                  <div className="py-7 text-center bg-sky-50/20 rounded-xl border border-dashed border-sky-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No pipe materials in this estimate specification.</p>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('PIPE')}
                      className="btn-3d btn-3d-sky px-4 py-1.5 text-xs inline-flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      + Add Pipe Material
                    </button>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3">Material</th>
                          <th className="py-2.5 px-3 w-28">Grade</th>
                          <th className="py-2.5 px-3 w-48">Pipe Gauge</th>
                          <th className="py-2.5 px-3 w-28 text-right">Length (ft)</th>
                          <th className="py-2.5 px-3 w-24 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right w-28">Weight</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        {pipes.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          const currentGrade = row.grade ? String(row.grade).replace(/^SS/i, '') : '304';
                          return (
                            <tr key={row.id || idx} className="hover:bg-sky-50/30 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="Material Name"
                                  value={row.material || ''}
                                  onChange={(e) => updatePipeRow(idx, 'material', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={currentGrade}
                                  onChange={(e) => updatePipeRow(idx, 'grade', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs font-semibold"
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
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs font-semibold"
                                >
                                  <option value="">Select Pipe Gauge</option>
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
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="Qty"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updatePipeRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs text-right font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-black text-sky-700">
                                {formatWeight(rowWeight)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deletePipeRow(idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

              {/* 3. ANGLE MATERIALS TABLE (AMBER / ORANGE THEME) */}
              <div className="card-3d p-5 w-full border-amber-200/80 bg-linear-to-b from-white to-amber-50/10">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Angle Materials</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {angles.length} component(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('ANGLE')}
                      className="btn-3d btn-3d-amber px-3 py-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Angle
                    </button>
                  </div>
                </div>

                {angles.length === 0 ? (
                  <div className="py-7 text-center bg-amber-50/20 rounded-xl border border-dashed border-amber-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No angle structural materials in this estimate specification.</p>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('ANGLE')}
                      className="btn-3d btn-3d-amber px-4 py-1.5 text-xs inline-flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      + Add Angle Material
                    </button>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3">Material</th>
                          <th className="py-2.5 px-3 w-48">Gauge</th>
                          <th className="py-2.5 px-3 w-28 text-right">Length (ft)</th>
                          <th className="py-2.5 px-3 w-24 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right w-28">Weight</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        {angles.map((row, idx) => {
                          const rowWeight = calculateAngleWeight(row);
                          return (
                            <tr key={row.id || idx} className="hover:bg-amber-50/30 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="Angle Material Name"
                                  value={row.material || ''}
                                  onChange={(e) => updateAngleRow(idx, 'material', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={row.gauge || '25 × 3 mm'}
                                  onChange={(e) => updateAngleRow(idx, 'gauge', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none text-xs font-semibold"
                                >
                                  {ANGLE_GAUGE_OPTIONS.map(g => (
                                    <option key={g} value={g}>{g}</option>
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
                                  onChange={(e) => updateAngleRow(idx, 'length', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="Qty"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updateAngleRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none text-xs text-right font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-black text-amber-700">
                                {formatWeight(rowWeight)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deleteAngleRow(idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

              {/* 4. PURCHASED ITEMS TABLE (INDIGO / VIOLET THEME) */}
              <div className="card-3d p-5 w-full border-indigo-200/80 bg-linear-to-b from-white to-indigo-50/10">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-2xs"></span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Purchased & Hardware Items</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-indigo-800 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {purchased.length} item(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCatalogCategory('Purchased');
                        setIsAddMaterialModalOpen(true);
                      }}
                      className="btn-3d btn-3d-indigo px-3 py-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Purchased Item
                    </button>
                  </div>
                </div>

                {purchased.length === 0 ? (
                  <div className="py-7 text-center bg-indigo-50/20 rounded-xl border border-dashed border-indigo-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No purchased or hardware items added to this estimate.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCatalogCategory('Purchased');
                        setIsAddMaterialModalOpen(true);
                      }}
                      className="btn-3d btn-3d-indigo px-4 py-1.5 text-xs inline-flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      + Add Purchased Item
                    </button>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3 text-left">Material</th>
                          <th className="py-2.5 px-3 w-44 text-center">Option / Spec</th>
                          <th className="py-2.5 px-3 w-28 text-center">Quantity</th>
                          <th className="py-2.5 px-3 w-36 text-center">Price (₹)</th>
                          <th className="py-2.5 px-3 text-right w-36">Total Price</th>
                          <th className="py-2.5 px-2 text-center w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        {purchased.map((row, idx) => {
                          const totalPrice = calculatePurchasedItemPrice(row.quantity, row.price);
                          const totalPriceDisplay = totalPrice !== null ? formatPurchasedPrice(totalPrice) : '—';
                          const opts = Array.isArray(row.dropdownOptions) && row.dropdownOptions.length > 0 
                            ? row.dropdownOptions 
                            : getItemSizeOptions(row.material);

                          return (
                            <tr key={row.id || idx} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="py-2 px-3 text-left">
                                <input
                                  type="text"
                                  placeholder="Material / Item Name"
                                  value={row.material || ''}
                                  onChange={(e) => updatePurchasedRow(idx, 'material', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                {opts && opts.length > 0 ? (
                                  <select
                                    value={row.size || opts[0]}
                                    onChange={(e) => updatePurchasedRow(idx, 'size', e.target.value)}
                                    className="w-full bg-indigo-50/80 text-indigo-950 px-2 py-1.5 rounded-lg border border-indigo-300 focus:border-indigo-500 focus:outline-none text-xs font-bold shadow-2xs"
                                  >
                                    {opts.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium">—</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Qty"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updatePurchasedRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs text-center font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Price (₹)"
                                  value={row.price !== undefined && row.price !== null ? row.price : ''}
                                  onChange={(e) => updatePurchasedRow(idx, 'price', sanitizeNumericInput(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs text-center font-bold bg-white text-slate-900 border-slate-300 focus:border-indigo-500 focus:outline-none shadow-2xs"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-black text-indigo-700">
                                {totalPriceDisplay}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {(row.allowMultiple || (opts && opts.length > 0)) && (
                                    <button
                                      type="button"
                                      onClick={() => handleAddRepeatablePurchasedItem(row)}
                                      className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                      title={`+ Add Another ${row.material || 'Item'}`}
                                    >
                                      <PlusCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deletePurchasedRow(idx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Remove Row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 5. COMPRESSOR & REFRIGERATION MATERIALS TABLE (ROSE / PURPLE THEME) */}
              <div className="card-3d p-5 w-full border-rose-200/80 bg-linear-to-b from-white to-rose-50/10">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs"></span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Compressor & Refrigeration Unit</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-rose-800 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {compressor.length} component(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCatalogCategory('Compressor');
                        setIsAddMaterialModalOpen(true);
                      }}
                      className="btn-3d px-3 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Refrigeration Component
                    </button>
                  </div>
                </div>

                {compressor.length === 0 ? (
                  <div className="py-7 text-center bg-rose-50/20 rounded-xl border border-dashed border-rose-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No compressor or cooling units added to this estimate.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCatalogCategory('Compressor');
                        setIsAddMaterialModalOpen(true);
                      }}
                      className="btn-3d px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      + Add Refrigeration Component
                    </button>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3 text-left">Component</th>
                          <th className="py-2.5 px-3 w-44 text-center">Specification / Rating</th>
                          <th className="py-2.5 px-3 w-28 text-center">Quantity</th>
                          <th className="py-2.5 px-3 w-36 text-center">Price (₹)</th>
                          <th className="py-2.5 px-3 text-right w-36">Total Price</th>
                          <th className="py-2.5 px-2 text-center w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        {compressor.map((row, idx) => {
                          const totalPrice = calculatePurchasedItemPrice(row.quantity, row.price);
                          const totalPriceDisplay = totalPrice !== null ? formatPurchasedPrice(totalPrice) : '—';
                          const opts = Array.isArray(row.dropdownOptions) && row.dropdownOptions.length > 0 ? row.dropdownOptions : null;

                          return (
                            <tr key={row.id || idx} className="hover:bg-rose-50/30 transition-colors">
                              <td className="py-2 px-3 text-left">
                                <input
                                  type="text"
                                  placeholder="Component Name"
                                  value={row.material || ''}
                                  onChange={(e) => updateCompressorRow(idx, 'material', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                {opts && opts.length > 0 ? (
                                  <select
                                    value={row.size || opts[0]}
                                    onChange={(e) => updateCompressorRow(idx, 'size', e.target.value)}
                                    className="w-full bg-rose-50/80 text-rose-950 px-2 py-1.5 rounded-lg border border-rose-300 focus:border-rose-500 focus:outline-none text-xs font-bold shadow-2xs"
                                  >
                                    {opts.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium">—</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Qty"
                                  value={row.quantity !== undefined && row.quantity !== null ? row.quantity : ''}
                                  onChange={(e) => updateCompressorRow(idx, 'quantity', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-rose-500 focus:outline-none text-xs text-center font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Price (₹)"
                                  value={row.price !== undefined && row.price !== null ? row.price : ''}
                                  onChange={(e) => updateCompressorRow(idx, 'price', sanitizeNumericInput(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs text-center font-bold bg-white text-slate-900 border-slate-300 focus:border-rose-500 focus:outline-none shadow-2xs"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-black text-rose-700">
                                {totalPriceDisplay}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {(row.allowMultiple || (opts && opts.length > 0)) && (
                                    <button
                                      type="button"
                                      onClick={() => handleAddRepeatableCompressorItem(row)}
                                      className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title={`+ Add Another ${row.material || 'Component'}`}
                                    >
                                      <PlusCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteCompressorRow(idx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Remove Row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
              className="btn-3d btn-3d-slate px-5 py-2.5 text-xs flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Client Data
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="btn-3d btn-3d-emerald px-6 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              Proceed to Weight & Pricing Summary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: WEIGHT BREAKDOWN & PRICING SUMMARY (VIOLET / SLATE THEME) */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Weight Summary & Cost Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-3d p-6 lg:p-7 border-violet-200/80">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-3 h-3 rounded-full bg-violet-600 animate-pulse shadow-xs" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Weight Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Counter Type */}
                <div className="card-3d-interactive p-4 bg-linear-to-b from-white to-slate-50/50 border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Counter Type</span>
                  <span className="text-sm font-black text-slate-900 block">
                    {clientData.counterType || '—'}
                    {clientData.counterSubtype ? ` (${clientData.counterSubtype})` : ''}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1">Commercial Kitchen Equipment</span>
                </div>

                {/* Grand Total Material Weight (Amber / Orange 3D Card) */}
                <div className="card-3d-interactive p-4 bg-linear-to-b from-white via-amber-50/30 to-amber-100/20 border-amber-300">
                  <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block mb-1">
                    Grand Total Material Weight
                  </span>
                  <div className="text-2xl font-black text-amber-700 tracking-tight">
                    {calculation.totalWeight > 0 ? `${calculation.totalWeight.toFixed(2)}` : '0.00'} <span className="text-sm font-bold text-amber-900/60">kg</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold block mt-0.5">Calculated from sheet, pipe & angle specifications</span>
                </div>
              </div>

              {/* Estimate Cost Summary Inputs */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Estimate Cost Summary
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Material Rate */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Material Rate (₹/kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 250"
                      value={pricingInputs.materialRate}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, materialRate: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 focus:outline-none text-xs font-bold text-right transition-all"
                    />
                  </div>

                  {/* Labour Cost */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Labour Cost (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 1500"
                      value={pricingInputs.labourCost}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, labourCost: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 focus:outline-none text-xs font-bold text-right transition-all"
                    />
                  </div>

                  {/* GST (%) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 focus:outline-none text-xs font-bold text-right transition-all"
                    />
                  </div>

                  {/* Discount (₹) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 500"
                      value={pricingInputs.discount}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, discount: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 focus:outline-none text-xs font-bold text-right transition-all"
                    />
                  </div>
                </div>

                {/* Back to Step 2 Navigation */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-start">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-3d btn-3d-slate px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Material Specification
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Pricing Summary & Grand Total */}
          <div className="space-y-6">
            <div className="card-3d p-6 lg:p-7 sticky top-8 shadow-md">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Pricing Summary
              </h3>

              <div className="space-y-3">
                {/* Material Cost */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-semibold">Material Cost</span>
                  <span className="text-xs font-black text-slate-900">
                    {formatCurrency(calculation.materialCost)}
                  </span>
                </div>

                {/* Purchased Item & Compressor Cost */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-semibold">Purchased & Components Cost</span>
                  <span className="text-xs font-black text-slate-900">
                    {formatCurrency(calculation.purchasedItemCost)}
                  </span>
                </div>

                {/* Labour Cost */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-semibold">Labour Cost</span>
                  <span className="text-xs font-black text-slate-900">
                    {formatCurrency(calculation.labourCost)}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                  <span className="text-rose-700 font-semibold">Discount</span>
                  <span className="text-xs font-black text-rose-700">
                    {calculation.discount > 0 ? `- ${formatCurrency(calculation.discount)}` : formatCurrency(0)}
                  </span>
                </div>

                {/* GST */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-semibold">GST</span>
                  <span className="text-xs font-black text-slate-900">
                    {formatCurrency(calculation.gstAmount)}
                  </span>
                </div>

                {/* Grand Total 3D Hero Card */}
                <div className="p-5 rounded-2xl bg-linear-to-b from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/25 border border-slate-700 mt-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                    Grand Total Estimate
                  </span>
                  <span className="text-2xl font-black text-white block mt-1 tracking-tight">
                    {formatCurrency(calculation.grandTotal)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 italic">
                    Includes Material, Components, Labour & GST
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-5 border-t border-slate-100 mt-5">
                <button
                  onClick={handleGeneratePDF}
                  className="btn-3d w-full py-2.5 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 border border-slate-700 cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Generate Quotation PDF
                </button>

                <button
                  onClick={handleSaveProject}
                  disabled={loading}
                  className="btn-3d btn-3d-emerald w-full py-2.5 text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  {projectToEdit ? 'Update Project' : 'Save Project'}
                </button>

                <button
                  onClick={handlePrintQuotation}
                  className="btn-3d btn-3d-slate w-full py-2 text-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Print Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD MATERIAL MODAL (CUSTOM OR FROM MATERIAL MASTER) */}
      {/* ========================================================================= */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add Material Component</h3>
                <span className="text-[10px] text-slate-500">Pick from Material Master catalog or create custom row</span>
              </div>
              <button
                onClick={() => setIsAddMaterialModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Blank Rows */}
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Add Blank Row:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={() => handleAddNewMaterial('SHEET')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 font-bold text-xs transition-all cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></div>
                  + Sheet
                </button>
                <button
                  onClick={() => handleAddNewMaterial('PIPE')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/70 text-cyan-900 font-bold text-xs transition-all cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-600 shrink-0"></div>
                  + Pipe
                </button>
                <button
                  onClick={() => handleAddNewMaterial('ANGLE')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900 font-bold text-xs transition-all cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></div>
                  + Angle
                </button>
                <button
                  onClick={() => handleAddNewMaterial('PURCHASED')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 font-bold text-xs transition-all cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                  + Purchased
                </button>
                <button
                  onClick={() => handleAddNewMaterial('COMPRESSOR')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900 font-bold text-xs transition-all cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></div>
                  + Compressor
                </button>
              </div>
            </div>

            {/* Material Master Catalog Picker */}
            <div className="flex-1 flex flex-col min-h-0 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Or Pick from Material Master:
                </span>
                <div className="flex items-center gap-1 text-[10px]">
                  {['ALL', 'Sheet', 'Pipe', 'Angle', 'Purchased', 'Compressor'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCatalogCategory(cat)}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        selectedCatalogCategory === cat 
                          ? 'bg-slate-800 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {masterMaterials
                  .filter(m => {
                    if (selectedCatalogCategory === 'ALL') return true;
                    if (selectedCatalogCategory === 'Compressor') {
                      return m.category === 'Compressor' || m.category === 'Special';
                    }
                    return m.category === selectedCatalogCategory;
                  })
                  .map(mat => (
                    <button
                      key={mat._id}
                      onClick={() => handleAddFromCatalog(mat)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          mat.category === 'Sheet' ? 'bg-emerald-600' :
                          mat.category === 'Pipe' ? 'bg-cyan-600' :
                          mat.category === 'Angle' ? 'bg-indigo-600' :
                          (mat.category === 'Compressor' || mat.category === 'Special') ? 'bg-purple-600' :
                          'bg-amber-500'
                        }`}></div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">
                            {mat.materialName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {mat.category} {mat.category !== 'Purchased' && mat.category !== 'Compressor' ? `• Grade ${mat.grade || '304'}` : ''} {mat.gauge ? `• ${mat.gauge}` : ''} {mat.price ? `• ₹ ${mat.price}` : ''}
                          </span>
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
