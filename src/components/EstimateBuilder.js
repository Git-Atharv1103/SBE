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
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Package,
  Layers,
  Wrench,
  Scale,
  PlusCircle,
  FileText,
  Percent,
  IndianRupee,
  ChevronRight,
  Copy
} from 'lucide-react';
import {
  COUNTER_TYPES,
  COUNTER_TYPES_CONFIG,
  COUNTER_CONFIG,
  SHEET_GRADES,
  STAINLESS_STEEL_GRADES,
  STANDARD_GAUGES,
  STANDARD_GAUGE_WEIGHTS,
  PIPE_GAUGE_OPTIONS,
  PIPE_SIZE_OPTIONS,
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
  calculateSheetWeight,
  calculatePipeWeight,
  calculateAngleWeight,
  calculateRowWeight,
  calculateSheetTotalWeight,
  calculatePipeTotalWeight,
  calculateAngleTotalWeight,
  calculateGrandTotalWeight,
  calculateEstimate,
  calculatePurchasedItemPrice,
  formatCurrency,
  formatWeight,
  formatPurchasedPrice
} from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';

export default function EstimateBuilder({ projectToEdit, onSaveSuccess }) {
  // 4-Step Commercial Fabrication Wizard
  // Step 1: Client & Counter Selection
  // Step 2: Material Specifications
  // Step 3: Weight Summary & Labour Cost
  // Step 4: Selling Price, GST, Discount & Final Estimate
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);
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
    counterType: 'Working Table',
    counterSubtype: '',
    counterQuantity: '1',
    estimateNumber: 'EST 01',
    date: new Date().toISOString().split('T')[0]
  });
  const [phoneTouched, setPhoneTouched] = useState(false);

  // Phone Validation: mandatory, exactly 10 digits, numbers only
  const isPhoneValid = useMemo(() => {
    return /^\d{10}$/.test((clientData.phone || '').trim());
  }, [clientData.phone]);

  // Form State - Step 2: Material Specifications
  const [sheets, setSheets] = useState([]);
  const [pipes, setPipes] = useState([]);
  const [angles, setAngles] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [compressor, setCompressor] = useState([]);

  // Form State - Pricing & Financial Inputs
  const [pricingInputs, setPricingInputs] = useState({
    sheetRate: '',
    pipeRate: '',
    angleRate: '',
    materialRate: '',      // Initially completely empty per user requirement
    labourRate: '',        // Initially completely empty per user requirement
    labourCost: '',        // Auto-calculated = Material Weight * labourRate
    sellingPercentage: '', // initially empty
    gst: '',               // initially empty
    discount: ''           // initially empty
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

  // Fast Rate Refresh Handler (Requirement 17)
  const handleRefreshRates = async () => {
    try {
      setIsRefreshingRates(true);
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
      showStatus('success', 'Rates and master catalog refreshed successfully!');
    } catch (err) {
      console.error('Failed to refresh rates:', err);
      showStatus('error', 'Failed to refresh rates. Please check network connection.');
    } finally {
      setIsRefreshingRates(false);
    }
  };

  // Derive active counter type configuration
  const currentCounterConfig = useMemo(() => {
    if (!clientData.counterType) return { hasSubtypes: false, subtypes: [], hasDepth: false, requiresAngle: false };
    const base = COUNTER_TYPES_CONFIG[clientData.counterType] || { hasSubtypes: false, subtypes: [], hasDepth: false, requiresAngle: false };
    if (clientData.counterSubtype && COUNTER_TYPES_CONFIG[clientData.counterSubtype]) {
      return {
        ...base,
        ...COUNTER_TYPES_CONFIG[clientData.counterSubtype]
      };
    }
    return base;
  }, [clientData.counterType, clientData.counterSubtype]);

  // Helper to check if a counter name is a Gas Range subtype
  const isGasRangeSubtype = (name) => {
    const n = (name || '').toLowerCase().trim();
    return n === 'single gas range' ||
      n === 'double gas range' ||
      n === 'triple gas range' ||
      n === 'four gas range' ||
      n === 'chinese gas range' ||
      n === '2x gas range' ||
      (n.startsWith('gas range ') && n !== 'gas range');
  };

  // Canonical Counter Name Normalizer
  const normalizeCounterName = (rawName) => {
    const clean = (rawName || '').trim();
    const lower = clean.toLowerCase();
    if (lower === 'table' || lower === 'work table') return 'Working Table';
    if (lower === 'storage' || lower === 'storage bin' || lower.includes('onion') || lower.includes('potato')) return 'Storage Bin';
    if (lower === 'chapati plate' || lower === 'chapati puffer plate') return 'Chapati Puffer Plate';
    if (lower.includes('gn pan') || lower.includes('round pot') || lower.includes('round. pot')) return 'GN PAN / ROUND POT';
    if (lower === 'dish rack') return 'SS Dish Rack';
    return clean;
  };

  // Helper to exclude Gas Range subtypes from the active main dropdown
  const isExcludedFromActiveDropdown = (name) => {
    const n = (name || '').toLowerCase().trim();
    if (!n) return true;
    if (isGasRangeSubtype(n)) return true;
    return false;
  };

  // Dynamically derive all available main counter types (Deduplicated strictly)
  const availableCounterTypes = useMemo(() => {
    const seen = new Set();
    const result = [];

    // First, standard counter types from constants
    COUNTER_TYPES.forEach(ct => {
      const canonical = normalizeCounterName(ct);
      const lower = canonical.toLowerCase();
      if (!isExcludedFromActiveDropdown(canonical) && !seen.has(lower)) {
        seen.add(lower);
        result.push(canonical);
      }
    });

    // Then master counter types from DB
    masterCounterTypes.forEach(ct => {
      if (ct.name && ct.status !== 'Inactive') {
        const canonical = normalizeCounterName(ct.name);
        const lower = canonical.toLowerCase();
        if (!isExcludedFromActiveDropdown(canonical) && !seen.has(lower)) {
          seen.add(lower);
          result.push(canonical);
        }
      }
    });

    return result;
  }, [masterCounterTypes]);

  // Load Material Component Structure for Selected Counter Type from Central Configuration
  const loadMaterialsForCounterType = useCallback((counterType, counterSubtype) => {
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

    // Load from central fallback template (single source of truth)
    const template = getFallbackCounterTemplate(counterType, counterSubtype);
    setSheets(JSON.parse(JSON.stringify(template.sheets || [])));
    setPipes(JSON.parse(JSON.stringify(template.pipes || [])));
    setAngles(JSON.parse(JSON.stringify(template.angles || [])));
    setPurchased(JSON.parse(JSON.stringify(template.purchased || [])));
    setCompressor(JSON.parse(JSON.stringify(template.compressor || [])));
  }, []);

  // Handle Counter Type Selection Change in Step 1
  const handleCounterTypeChange = (newType) => {
    const config = COUNTER_TYPES_CONFIG[newType] || { hasSubtypes: false, subtypes: [] };
    setClientData(prev => ({ ...prev, counterType: newType, counterSubtype: '' }));
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

  // Set default counter on initial mount if empty
  useEffect(() => {
    if (!projectToEdit && sheets.length === 0 && clientData.counterType) {
      loadMaterialsForCounterType(clientData.counterType, clientData.counterSubtype);
    }
  }, [projectToEdit, loadMaterialsForCounterType, clientData.counterType, clientData.counterSubtype, sheets.length]);

  // Initialize or Reopen Project
  useEffect(() => {
    if (projectToEdit) {
      const cType = projectToEdit.counterType === 'Table' ? 'Working Table' : (projectToEdit.counterType || 'Working Table');
      setClientData({
        customerName: projectToEdit.customerName || '',
        companyName: projectToEdit.companyName || '',
        phone: projectToEdit.phone || '',
        email: projectToEdit.email || '',
        address: projectToEdit.address || '',
        counterType: cType,
        counterSubtype: projectToEdit.counterSubtype || '',
        counterQuantity: projectToEdit.counterQuantity ? String(projectToEdit.counterQuantity) : '1',
        estimateNumber: projectToEdit.estimateNumber || 'EST 01',
        date: projectToEdit.date ? new Date(projectToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setPhoneTouched(true);

      setSheets(projectToEdit.sheets || []);
      setPipes(projectToEdit.pipes || []);
      setAngles(projectToEdit.angles || []);
      setPurchased(projectToEdit.purchased || []);
      setCompressor(projectToEdit.compressor || []);

      setPricingInputs({
        sheetRate: projectToEdit.sheetRate !== undefined && projectToEdit.sheetRate !== null && projectToEdit.sheetRate !== '' ? String(projectToEdit.sheetRate) : (projectToEdit.materialRate ? String(projectToEdit.materialRate) : ''),
        pipeRate: projectToEdit.pipeRate !== undefined && projectToEdit.pipeRate !== null && projectToEdit.pipeRate !== '' ? String(projectToEdit.pipeRate) : '',
        angleRate: projectToEdit.angleRate !== undefined && projectToEdit.angleRate !== null && projectToEdit.angleRate !== '' ? String(projectToEdit.angleRate) : '',
        materialRate: projectToEdit.materialRate !== undefined && projectToEdit.materialRate !== null && projectToEdit.materialRate !== '' ? String(projectToEdit.materialRate) : '',
        labourRate: projectToEdit.labourRate !== undefined && projectToEdit.labourRate !== null && projectToEdit.labourRate !== '' ? String(projectToEdit.labourRate) : '',
        labourCost: projectToEdit.labourCost ? String(projectToEdit.labourCost) : '',
        sellingPercentage: projectToEdit.sellingPercentage !== undefined && projectToEdit.sellingPercentage !== null && projectToEdit.sellingPercentage !== '' ? String(projectToEdit.sellingPercentage) : '',
        gst: projectToEdit.gst !== undefined && projectToEdit.gst !== null && projectToEdit.gst !== '' ? String(projectToEdit.gst) : '',
        discount: projectToEdit.discount !== undefined && projectToEdit.discount !== null && projectToEdit.discount !== '' ? String(projectToEdit.discount) : ''
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

  // Master Reactive Calculation Engine
  const calculation = useMemo(() => {
    const matRate = (pricingInputs.materialRate !== '' && !isNaN(parseFloat(pricingInputs.materialRate)))
      ? parseFloat(pricingInputs.materialRate)
      : ((pricingInputs.sheetRate !== '' && !isNaN(parseFloat(pricingInputs.sheetRate))) ? parseFloat(pricingInputs.sheetRate) : 0);
    const lRate = (pricingInputs.labourRate !== '' && !isNaN(parseFloat(pricingInputs.labourRate))) ? parseFloat(pricingInputs.labourRate) : 0;
    const sPct = pricingInputs.sellingPercentage !== '' ? (parseFloat(pricingInputs.sellingPercentage) || 0) : 0;
    const cQty = Math.max(1, parseInt(clientData.counterQuantity, 10) || 1);
    const disc = pricingInputs.discount !== '' ? (parseFloat(pricingInputs.discount) || 0) : 0;
    const gstVal = pricingInputs.gst !== '' ? pricingInputs.gst : '';

    return calculateEstimate({
      sheets,
      pipes,
      angles,
      purchased,
      compressor,
      materialRate: matRate,
      labourRate: lRate,
      sellingPercentage: sPct,
      counterQuantity: cQty,
      discount: disc,
      gst: gstVal
    });
  }, [sheets, pipes, angles, purchased, compressor, pricingInputs, clientData.counterQuantity]);

  // Customer-Facing Quotation / Bill Line Items (Clean format per Requirement 13, 14, 31)
  const quotationBillItems = useMemo(() => {
    const mainEquipmentName = clientData.counterSubtype
      ? `${clientData.counterType || 'Commercial Kitchen Equipment'} (${clientData.counterSubtype})`
      : (clientData.counterType || 'Commercial Kitchen Equipment');

    const counterQty = Math.max(1, parseInt(clientData.counterQuantity, 10) || 1);
    // Amount in bill row is Selling Price per Unit × Quantity
    const rowAmount = calculation.totalSellingPrice;

    return [{
      srNo: 1,
      counterName: mainEquipmentName,
      quantity: counterQty,
      rate: calculation.unitSellingPrice,
      amount: rowAmount
    }];
  }, [clientData.counterType, clientData.counterSubtype, clientData.counterQuantity, calculation.unitSellingPrice, calculation.totalSellingPrice]);

  // =========================================================================
  // ROW CRUD & UNIVERSAL "+ ADD MORE" INSERTION DIRECTLY BELOW SOURCE ROW
  // =========================================================================

  // 1. Sheet Rows
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

  // Dynamic clone/insert directly below the clicked row
  const handleAddMoreSheetRow = (index) => {
    setSheets(prev => {
      const source = prev[index];
      const newRow = {
        ...source,
        id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        length: '',
        width: source?.width !== undefined ? '' : undefined,
        height: source?.height !== undefined ? '' : undefined,
        quantity: '',
        isRepeatable: true
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
  };

  // 2. Pipe Rows
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

  const handleAddMorePipeRow = (index) => {
    setPipes(prev => {
      const source = prev[index];
      const newRow = {
        ...source,
        id: `pipe-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        length: '',
        unit: source?.unit || 'ft',
        quantity: '',
        isRepeatable: true
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
  };

  // 3. Angle Rows
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

  const handleAddMoreAngleRow = (index) => {
    setAngles(prev => {
      const source = prev[index];
      const newRow = {
        ...source,
        id: `angle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        length: '',
        quantity: '',
        isRepeatable: true
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
  };

  // 4. Purchased Rows
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

  const handleAddMorePurchasedRow = (index) => {
    setPurchased(prev => {
      const source = prev[index];
      const newRow = {
        ...source,
        id: `pur-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        quantity: '',
        price: '', // Intentionally empty per Requirement 8
        isRepeatable: true
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
  };

  // 5. Compressor Rows
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

  const handleAddMoreCompressorRow = (index) => {
    setCompressor(prev => {
      const source = prev[index];
      const newRow = {
        ...source,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        quantity: '',
        price: '',
        isRepeatable: true
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
  };

  // Add custom blank material row
  const handleAddNewMaterial = (type) => {
    setIsAddMaterialModalOpen(false);
    const newId = `custom-${Date.now()}`;
    if (type === 'SHEET') {
      setSheets(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'sheet', grade: '304', length: '', width: '', depth: currentCounterConfig.hasDepth ? '' : undefined, gauge: 1.2, quantity: '', unit: 'inch', isRepeatable: true }
      ]);
    } else if (type === 'PIPE') {
      setPipes(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'pipe', grade: '304', pipeSize: '1.5" (38 × 38 mm)', pipeGauge: '1.2 mm', length: '', unit: 'ft', quantity: '', isRepeatable: true }
      ]);
    } else if (type === 'ANGLE') {
      setAngles(prev => [
        ...prev,
        { id: newId, material: 'Angle', calculationType: 'angle', grade: '304', gauge: '25 × 3 mm', length: '', quantity: '', isRepeatable: true }
      ]);
    } else if (type === 'PURCHASED') {
      setPurchased(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'purchased', size: '', quantity: '', price: '', isRepeatable: true }
      ]);
    } else if (type === 'COMPRESSOR') {
      setCompressor(prev => [
        ...prev,
        { id: newId, material: '', calculationType: 'compressor', category: 'Compressor', size: '', quantity: '', price: '', isRepeatable: true }
      ]);
    }
  };

  // Add item from master catalog
  const handleAddFromCatalog = (mat) => {
    setIsAddMaterialModalOpen(false);
    const newId = `master-${mat._id || Date.now()}-${Date.now()}`;
    const cat = (mat.category || '').toLowerCase();

    if (cat === 'sheet') {
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
          depth: currentCounterConfig.hasDepth ? '' : undefined,
          gauge: mat.gauge || 1.2,
          quantity: '',
          unit: 'inch',
          isRepeatable: true
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
          pipeSize: mat.pipeSize || '1.5" (38 × 38 mm)',
          pipeGauge: mat.gauge || '1.2 mm',
          length: '',
          unit: 'ft',
          quantity: '',
          isRepeatable: true
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
          quantity: '',
          isRepeatable: true
        }
      ]);
    } else if (cat === 'compressor' || cat === 'special') {
      setCompressor(prev => [
        ...prev,
        {
          id: newId,
          materialId: mat._id,
          material: mat.materialName,
          calculationType: 'compressor',
          category: 'Compressor',
          size: '',
          quantity: '',
          price: mat.price !== null && mat.price !== undefined ? String(mat.price) : '',
          isRepeatable: true
        }
      ]);
    } else {
      const dropdownOpts = Array.isArray(mat.dropdownOptions) && mat.dropdownOptions.length > 0
        ? mat.dropdownOptions
        : getItemSizeOptions(mat.materialName);
      setPurchased(prev => [
        ...prev,
        {
          id: newId,
          materialId: mat._id,
          material: mat.materialName,
          calculationType: 'purchased',
          dropdownOptions: dropdownOpts,
          size: dropdownOpts ? dropdownOpts[0] : '',
          quantity: '',
          price: mat.price !== null && mat.price !== undefined ? String(mat.price) : '',
          isRepeatable: true
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
      counterType: 'Working Table',
      counterSubtype: '',
      counterQuantity: '1',
      estimateNumber: nextNum,
      date: new Date().toISOString().split('T')[0]
    });
    setPricingInputs({
      sheetRate: '',
      pipeRate: '',
      angleRate: '',
      materialRate: '',
      labourRate: '',
      labourCost: '',
      sellingPercentage: '',
      gst: '',
      discount: ''
    });
    loadMaterialsForCounterType('Working Table', '');
    setCurrentStep(1);
    showStatus('success', `Reset workspace for New Counter Estimate (${nextNum}).`);
  };

  // Action: Save Project / Save Estimate (Section 35)
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
          counterQuantity: Number(clientData.counterQuantity || 1),
          date: clientData.date,
          sheets,
          pipes,
          angles,
          purchased,
          compressor,
          totalSheetWeight: calculation.totalSheetWeight,
          totalPipeWeight: calculation.totalPipeWeight,
          totalAngleWeight: calculation.totalAngleWeight,
          totalMaterialWeight: calculation.totalWeight,
          sheetRate: parseFloat(pricingInputs.sheetRate) || parseFloat(pricingInputs.materialRate) || 250,
          pipeRate: parseFloat(pricingInputs.pipeRate) || 270,
          angleRate: parseFloat(pricingInputs.angleRate) || 220,
          materialRate: parseFloat(pricingInputs.sheetRate) || parseFloat(pricingInputs.materialRate) || 250,
          sheetCost: calculation.sheetCost,
          pipeCost: calculation.pipeCost,
          angleCost: calculation.angleCost,
          materialCost: calculation.materialCost,
          labourRate: parseFloat(pricingInputs.labourRate) || 0,
          labourCost: calculation.labourCost,
          purchasedItemCost: calculation.purchasedItemCost,
          subtotal: calculation.subtotal,
          sellingPercentage: pricingInputs.sellingPercentage !== '' ? (parseFloat(pricingInputs.sellingPercentage) || 0) : 0,
          sellingAmount: calculation.sellingAmount || 0,
          sellingPrice: calculation.unitSellingPrice,
          gst: pricingInputs.gst !== '' ? (parseFloat(pricingInputs.gst) || 0) : 0,
          gstAmount: calculation.gstAmount,
          discount: pricingInputs.discount !== '' ? (parseFloat(pricingInputs.discount) || 0) : 0,
          finalTotal: calculation.finalTotal,
          grandTotal: calculation.finalTotal,
          totalAmount: calculation.finalTotal
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
        showStatus('success', projectToEdit ? 'Estimate updated successfully!' : 'Estimate saved successfully!');
        if (onSaveSuccess) {
          setTimeout(() => onSaveSuccess(), 1000);
        }
      } else {
        const err = await res.json();
        showStatus('error', err.error || 'Failed to save estimate.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Network error. Could not connect to database.');
    } finally {
      setLoading(false);
    }
  };

  // Action: Generate Bill / Download Quotation PDF (Section 35)
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
        totalMaterialWeight: calculation.totalWeight,
        materialRate: parseFloat(pricingInputs.materialRate) || 0,
        labourRate: parseFloat(pricingInputs.labourRate) || 0,
        labourCost: calculation.labourCost,
        subtotal: calculation.subtotal,
        sellingPercentage: pricingInputs.sellingPercentage !== '' ? (parseFloat(pricingInputs.sellingPercentage) || 0) : 0,
        sellingPrice: calculation.unitSellingPrice,
        counterQuantity: clientData.counterQuantity || '1',
        discount: pricingInputs.discount !== '' ? (parseFloat(pricingInputs.discount) || 0) : 0,
        gst: pricingInputs.gst !== '' ? (parseFloat(pricingInputs.gst) || 0) : 0,
        finalTotal: calculation.finalTotal
      }, { shouldPrint: false });
      showStatus('success', 'Quotation / Bill generated and downloaded.');
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
        totalMaterialWeight: calculation.totalWeight,
        materialRate: parseFloat(pricingInputs.materialRate) || 0,
        labourRate: parseFloat(pricingInputs.labourRate) || 0,
        labourCost: calculation.labourCost,
        subtotal: calculation.subtotal,
        sellingPercentage: pricingInputs.sellingPercentage !== '' ? (parseFloat(pricingInputs.sellingPercentage) || 0) : 0,
        sellingPrice: calculation.unitSellingPrice,
        counterQuantity: clientData.counterQuantity || '1',
        discount: pricingInputs.discount !== '' ? (parseFloat(pricingInputs.discount) || 0) : 0,
        gst: pricingInputs.gst !== '' ? (parseFloat(pricingInputs.gst) || 0) : 0,
        finalTotal: calculation.finalTotal
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
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 ${statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
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
            Commercial Kitchen Equipment Fabrication Master Estimation & Bill Generator
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshRates}
            disabled={isRefreshingRates}
            className="btn-3d btn-3d-slate px-3.5 py-2 text-xs cursor-pointer disabled:opacity-50"
            title="Refresh Rates & Master Catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-blue-600 ${isRefreshingRates ? 'animate-spin' : ''}`} />
            {isRefreshingRates ? 'Refreshing...' : 'Refresh Rates'}
          </button>
          <button
            onClick={handleResetNewCounter}
            className="btn-3d btn-3d-slate px-3.5 py-2 text-xs cursor-pointer"
            title="Reset to New Counter"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            + New Counter
          </button>
          <button
            onClick={handlePrintQuotation}
            className="btn-3d btn-3d-slate px-3.5 py-2 text-xs cursor-pointer"
            title="Print Quotation"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print
          </button>
          <button
            onClick={handleGeneratePDF}
            className="btn-3d px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 border border-slate-700 cursor-pointer"
            title="Generate & Download Quotation Bill"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Generate Bill
          </button>
          <button
            onClick={handleSaveProject}
            disabled={loading}
            className="btn-3d btn-3d-emerald px-5 py-2 text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            {projectToEdit ? 'Update Estimate' : 'Save Estimate'}
          </button>
        </div>
      </div>

      {/* 4-Step Wizard Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            step: 1,
            label: 'Step 1',
            name: 'Client & Counter Selection',
            activeStyle: 'bg-linear-to-r from-blue-50/90 to-indigo-50/60 border-blue-400 text-blue-900 shadow-sm ring-2 ring-blue-500/15',
            badgeActive: 'bg-blue-600 text-white shadow-xs'
          },
          {
            step: 2,
            label: 'Step 2',
            name: 'Material Specifications',
            activeStyle: 'bg-linear-to-r from-teal-50/90 to-cyan-50/60 border-teal-400 text-teal-900 shadow-sm ring-2 ring-teal-500/15',
            badgeActive: 'bg-teal-600 text-white shadow-xs'
          },
          {
            step: 3,
            label: 'Step 3',
            name: 'Weight Summary & Labour',
            activeStyle: 'bg-linear-to-r from-violet-50/90 to-purple-50/60 border-violet-400 text-violet-900 shadow-sm ring-2 ring-violet-500/15',
            badgeActive: 'bg-violet-600 text-white shadow-xs'
          },
          {
            step: 4,
            label: 'Step 4',
            name: 'Selling Price & Bill',
            activeStyle: 'bg-linear-to-r from-emerald-50/90 to-teal-50/60 border-emerald-400 text-emerald-900 shadow-sm ring-2 ring-emerald-500/15',
            badgeActive: 'bg-emerald-600 text-white shadow-xs'
          }
        ].map((s) => {
          const isActive = currentStep === s.step;
          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`card-3d-interactive flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer transition-all ${isActive
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
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${isActive ? s.badgeActive : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                {s.step}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1 — CLIENT & COUNTER SELECTION */}
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

            {/* Mobile Number (Mandatory 10 digits) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">10 Digits</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                placeholder="e.g. 9604386808"
                value={clientData.phone}
                onBlur={() => setPhoneTouched(true)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setClientData({ ...clientData, phone: cleaned });
                }}
                className={`w-full bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border ${phoneTouched && !isPhoneValid
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
                  } focus:outline-none text-xs font-bold transition-all`}
              />
              {phoneTouched && !isPhoneValid && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  Enter a valid 10-digit mobile number.
                </p>
              )}
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

            {/* Counter Type Selector (Renamed Table -> Working Table, Bain Marie, etc.) */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  Select Counter Type *
                </label>
                <span className="text-[10px] text-blue-600 font-bold">Standard Templates</span>
              </div>
              <select
                value={clientData.counterType}
                onChange={(e) => handleCounterTypeChange(e.target.value)}
                className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none text-xs font-black shadow-2xs cursor-pointer"
              >
                <option value="">-- Choose Counter Type --</option>
                {availableCounterTypes.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Conditionally Render Subtype Selector (Storage Bin, Fridge, Pizza Makeline, Work Top, Gas Range, Shawarma) */}
            {currentCounterConfig.hasSubtypes ? (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-300 space-y-2 animate-in fade-in duration-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black text-blue-900 uppercase tracking-wider">
                    {currentCounterConfig.subtypeLabel || 'Counter Subtype'} *
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold">Required</span>
                </div>
                <select
                  value={clientData.counterSubtype}
                  onChange={(e) => handleSubtypeChange(e.target.value)}
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-xs font-black shadow-2xs cursor-pointer"
                >
                  <option value="">-- Select {currentCounterConfig.subtypeLabel} --</option>
                  {currentCounterConfig.subtypes.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Counter Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={clientData.counterQuantity || '1'}
                  onChange={(e) => setClientData({ ...clientData, counterQuantity: sanitizeNumericInput(e.target.value) || '1' })}
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none text-xs font-bold shadow-2xs"
                />
              </div>
            )}

            {currentCounterConfig.hasSubtypes && (
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Counter Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={clientData.counterQuantity || '1'}
                  onChange={(e) => setClientData({ ...clientData, counterQuantity: sanitizeNumericInput(e.target.value) || '1' })}
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none text-xs font-bold shadow-2xs"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-slate-100 mt-6">
            <button
              disabled={!clientData.customerName.trim() || !isPhoneValid || !clientData.counterType || (currentCounterConfig.hasSubtypes && !clientData.counterSubtype)}
              onClick={() => {
                setPhoneTouched(true);
                if (!clientData.customerName.trim()) {
                  showStatus('warning', 'Please enter a Customer Name.');
                  return;
                }
                if (!isPhoneValid) {
                  showStatus('warning', 'Enter a valid 10-digit mobile number.');
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
              className="btn-3d btn-3d-blue px-6 py-2.5 text-xs shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Material Specifications
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 — MATERIAL SPECIFICATIONS (WITHOUT 3D) */}
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
                className="btn-3d btn-3d-emerald px-4 py-2 text-xs shadow-sm cursor-pointer"
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
              {/* Estimate & Component Counts Verification Bar */}
              <div className="px-4 py-2.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Estimate:</span>
                  <span className="text-white font-bold bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">{clientData.estimateNumber}</span>
                </div>
                <div className="flex items-center gap-3.5 flex-wrap">
                  <span className="text-slate-300">Sheets: <strong className="text-teal-400 font-bold">{sheets.length}</strong></span>
                  <span className="text-slate-300">Pipes: <strong className="text-sky-400 font-bold">{pipes.length}</strong></span>
                  {currentCounterConfig.requiresAngle && (
                    <span className="text-slate-300">Angles: <strong className="text-amber-400 font-bold">{angles.length}</strong></span>
                  )}
                  <span className="text-slate-300">Purchase Items: <strong className="text-indigo-400 font-bold">{purchased.length}</strong></span>
                  {compressor.length > 0 && (
                    <span className="text-slate-300">Refrigeration: <strong className="text-rose-400 font-bold">{compressor.length}</strong></span>
                  )}
                </div>
              </div>

              {/* 1. SHEET MATERIALS TABLE */}
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
                      className="btn-3d btn-3d-teal px-3 py-1 text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Sheet
                    </button>
                  </div>
                </div>

                {sheets.length === 0 ? (
                  <div className="py-7 text-center bg-teal-50/20 rounded-xl border border-dashed border-teal-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No sheet materials configured for this counter.</p>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('SHEET')}
                      className="btn-3d btn-3d-teal px-4 py-1.5 text-xs inline-flex items-center cursor-pointer"
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
                          <th className="py-2.5 px-3 w-24">Width / Height (in)</th>
                          {currentCounterConfig.hasDepth && (
                            <th className="py-2.5 px-3 w-24 bg-blue-50/50 text-blue-900">Depth (in)</th>
                          )}
                          <th className="py-2.5 px-3 w-36">Gauge</th>
                          <th className="py-2.5 px-3 w-20">Quantity</th>
                          <th className="py-2.5 px-3 text-center w-16">Unit</th>
                          <th className="py-2.5 px-3 text-right w-28">Weight</th>
                          <th className="py-2.5 px-2 text-center w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        {sheets.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          const currentGrade = row.grade ? String(row.grade).replace(/^SS/i, '') : '304';
                          const hasCustomGaugeOpts = Array.isArray(row.gaugeOptions) && row.gaugeOptions.length > 0;
                          const isCovering = (row.material || '').toLowerCase().includes('covering');

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
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-semibold cursor-pointer"
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
                                  placeholder={isCovering ? 'Height' : 'Width'}
                                  value={(row.width !== undefined && row.width !== null && row.width !== '') ? row.width : (row.height !== undefined && row.height !== null ? row.height : '')}
                                  onChange={(e) => {
                                    const v = sanitizeNumericInput(e.target.value);
                                    setSheets(prev => {
                                      const copy = [...prev];
                                      copy[idx] = { ...copy[idx], width: v, height: v };
                                      return copy;
                                    });
                                  }}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              {currentCounterConfig.hasDepth && (
                                <td className="py-2 px-3 bg-blue-50/20">
                                  {(row.material || '').toLowerCase().includes('sink') || (row.material || '').toLowerCase().includes('bowl') ? (
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      placeholder="Depth"
                                      value={row.depth !== undefined && row.depth !== null ? row.depth : ''}
                                      onChange={(e) => updateSheetRow(idx, 'depth', sanitizeNumericInput(e.target.value))}
                                      className="w-full bg-white text-blue-900 px-2.5 py-1.5 rounded-lg border border-blue-200 focus:border-blue-500 focus:outline-none text-xs text-right font-bold"
                                    />
                                  ) : (
                                    <span className="text-slate-300 text-xs text-center block font-mono">—</span>
                                  )}
                                </td>
                              )}
                              <td className="py-2 px-3">
                                {hasCustomGaugeOpts ? (
                                  <select
                                    value={row.gauge !== undefined && row.gauge !== '' ? row.gauge : ''}
                                    onChange={(e) => updateSheetRow(idx, 'gauge', e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full bg-teal-50/80 text-teal-900 px-2.5 py-1.5 rounded-lg border border-teal-300 focus:border-teal-500 focus:outline-none text-xs font-black shadow-2xs cursor-pointer"
                                  >
                                    <option value="">Select Gauge</option>
                                    {row.gaugeOptions.map(g => (
                                      <option key={g} value={g}>{g} mm</option>
                                    ))}
                                  </select>
                                ) : (
                                  <select
                                    value={row.gauge !== undefined && row.gauge !== '' ? row.gauge : ''}
                                    onChange={(e) => updateSheetRow(idx, 'gauge', e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-teal-500 focus:outline-none text-xs font-semibold cursor-pointer"
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
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAddMoreSheetRow(idx)}
                                    className="p-1 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                    title="+ Add More directly below this row"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteSheetRow(idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

              {/* 2. PIPE MATERIALS TABLE (Dedicated Pipe Gauge on Every Row) */}
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
                      className="btn-3d btn-3d-sky px-3 py-1 text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Pipe
                    </button>
                  </div>
                </div>

                {pipes.length === 0 ? (
                  <div className="py-7 text-center bg-sky-50/20 rounded-xl border border-dashed border-sky-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No pipe materials configured for this counter.</p>
                    <button
                      type="button"
                      onClick={() => handleAddNewMaterial('PIPE')}
                      className="btn-3d btn-3d-sky px-4 py-1.5 text-xs inline-flex items-center cursor-pointer"
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
                          <th className="py-2.5 px-3 w-24">Grade</th>
                          <th className="py-2.5 px-3 w-36">Pipe Size</th>
                          <th className="py-2.5 px-3 w-28">Pipe Gauge</th>
                          <th className="py-2.5 px-3 w-24 text-right">Length</th>
                          <th className="py-2.5 px-3 w-20 text-center">Unit</th>
                          <th className="py-2.5 px-3 w-20 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right w-24">Weight</th>
                          <th className="py-2.5 px-2 text-center w-16">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        {pipes.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          const currentGrade = row.grade ? String(row.grade).replace(/^SS/i, '') : '304';
                          const currentSize = row.pipeSize || row.size || '1.5" (38 × 38 mm)';
                          const currentGauge = row.pipeGauge || row.gauge || '1.2 mm';

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
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs font-semibold cursor-pointer"
                                >
                                  {STAINLESS_STEEL_GRADES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </td>
                              {/* Dedicated Pipe Size Dropdown */}
                              <td className="py-2 px-3">
                                <select
                                  value={currentSize}
                                  onChange={(e) => updatePipeRow(idx, 'pipeSize', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs font-semibold cursor-pointer"
                                >
                                  {PIPE_SIZE_OPTIONS.map(ps => (
                                    <option key={ps} value={ps}>{ps}</option>
                                  ))}
                                </select>
                              </td>
                              {/* Dedicated Pipe Gauge Dropdown */}
                              <td className="py-2 px-3">
                                <select
                                  value={currentGauge}
                                  onChange={(e) => updatePipeRow(idx, 'pipeGauge', e.target.value)}
                                  className="w-full bg-sky-50 text-sky-950 px-2 py-1.5 rounded-lg border border-sky-300 focus:border-sky-500 focus:outline-none text-xs font-bold shadow-2xs cursor-pointer"
                                >
                                  {PIPE_GAUGE_OPTIONS.map(pg => (
                                    <option key={pg} value={pg}>{pg}</option>
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
                                  onChange={(e) => updatePipeRow(idx, 'length', sanitizeNumericInput(e.target.value))}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <select
                                  value={row.unit || 'ft'}
                                  onChange={(e) => updatePipeRow(idx, 'unit', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-1.5 py-1.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:outline-none text-xs font-semibold cursor-pointer text-center"
                                >
                                  <option value="ft">ft</option>
                                  <option value="inch">inch</option>
                                </select>
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
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAddMorePipeRow(idx)}
                                    className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                    title="+ Add More directly below this row"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deletePipeRow(idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

              {/* 3. ANGLE MATERIALS TABLE (CONDITIONAL: ONLY SHOWN IF REQUIRES ANGLE, E.G. GAS RANGE) */}
              {currentCounterConfig.requiresAngle && (
                <div className="card-3d p-5 w-full border-amber-200/80 bg-linear-to-b from-white to-amber-50/10 animate-in fade-in duration-200">
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
                        className="btn-3d btn-3d-amber px-3 py-1 text-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Angle
                      </button>
                    </div>
                  </div>

                  {angles.length === 0 ? (
                    <div className="py-7 text-center bg-amber-50/20 rounded-xl border border-dashed border-amber-200">
                      <p className="text-xs text-slate-500 font-medium mb-3">No angle structural materials added.</p>
                      <button
                        type="button"
                        onClick={() => handleAddNewMaterial('ANGLE')}
                        className="btn-3d btn-3d-amber px-4 py-1.5 text-xs inline-flex items-center cursor-pointer"
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
                            <th className="py-2.5 px-2 text-center w-20">Actions</th>
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
                                    className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none text-xs font-semibold cursor-pointer"
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
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleAddMoreAngleRow(idx)}
                                      className="p-1 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                      title="+ Add More directly below this row"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteAngleRow(idx)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
              )}

              {/* 4. PURCHASED ITEMS TABLE */}
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
                      className="btn-3d btn-3d-indigo px-3 py-1 text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Purchased Item
                    </button>
                  </div>
                </div>

                {purchased.length === 0 ? (
                  <div className="py-7 text-center bg-indigo-50/20 rounded-xl border border-dashed border-indigo-200">
                    <p className="text-xs text-slate-500 font-medium mb-3">No purchased items configured for this counter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCatalogCategory('Purchased');
                        setIsAddMaterialModalOpen(true);
                      }}
                      className="btn-3d btn-3d-indigo px-4 py-1.5 text-xs inline-flex items-center cursor-pointer"
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
                                    className="w-full bg-indigo-50/80 text-indigo-950 px-2 py-1.5 rounded-lg border border-indigo-300 focus:border-indigo-500 focus:outline-none text-xs font-bold shadow-2xs cursor-pointer"
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
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAddMorePurchasedRow(idx)}
                                    className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                    title="+ Add More directly below this row"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deletePurchasedRow(idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

              {/* 5. COMPRESSOR & REFRIGERATION MATERIALS TABLE (If applicable) */}
              {compressor.length > 0 && (
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
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3 text-left">Component</th>
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

                          return (
                            <tr key={row.id || idx} className="hover:bg-rose-50/30 transition-colors">
                              <td className="py-2 px-3 text-left">
                                <input
                                  type="text"
                                  placeholder="Component Name"
                                  value={row.material || ''}
                                  onChange={(e) => updateCompressorRow(idx, 'material', e.target.value)}
                                  className="w-full bg-slate-50/50 focus:bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-rose-500 focus:outline-none text-xs font-semibold"
                                />
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
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAddMoreCompressorRow(idx)}
                                    className="p-1 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="+ Add More directly below this row"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteCompressorRow(idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                </div>
              )}
            </>
          )}

          {/* Stepper Navigation to Step 3 */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-3d btn-3d-slate px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Client Data
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="btn-3d btn-3d-emerald px-6 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Proceed to Weight Summary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3 — WEIGHT SUMMARY & INTERNAL COST */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card-3d p-6 lg:p-8 border-violet-200/80 bg-white">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-violet-600 animate-pulse shadow-xs" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Step 3 – Weight Summary & Labour Cost
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold bg-violet-50 text-violet-900 border border-violet-200 px-3 py-1 rounded-lg">
                Estimate: {clientData.estimateNumber}
              </span>
            </div>

            {/* Counter Type Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Selected Equipment
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  {clientData.counterType || 'Working Table'}
                  {clientData.counterSubtype ? ` (${clientData.counterSubtype})` : ''}
                </span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                Commercial Kitchen Fabrication
              </span>
            </div>

            {/* ========================================================================= */}
            {/* 1. COMMON GRAND TOTAL MATERIAL WEIGHT SECTION */}
            {/* ========================================================================= */}
            <div className="p-6 rounded-2xl bg-linear-to-b from-amber-500 to-amber-600 text-white shadow-md shadow-amber-600/20 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black text-amber-100 uppercase tracking-widest block">
                    GRAND TOTAL MATERIAL WEIGHT
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mt-1">
                    {calculation.totalWeight.toFixed(2)} <span className="text-lg font-bold text-amber-200">kg</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-amber-100/90 font-medium block">Combined Fabrication Material Weight</span>
                  <span className="text-xs text-white font-bold bg-amber-700/60 px-3 py-1 rounded-full border border-amber-400/40 inline-block mt-1">
                    All Sheet &amp; Pipe Materials Included
                  </span>
                </div>
              </div>

              {/* Constituent breakdown underneath */}
              <div className="pt-3.5 mt-3.5 border-t border-amber-400/40 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-amber-100 font-medium">
                <span>Sheet: <strong className="text-white font-black">{calculation.totalSheetWeight.toFixed(2)} kg</strong> ({sheets.length} components)</span>
                <span>+</span>
                <span>Pipe: <strong className="text-white font-black">{calculation.totalPipeWeight.toFixed(2)} kg</strong> ({pipes.length} components)</span>
                {calculation.totalAngleWeight > 0 && (
                  <>
                    <span>+</span>
                    <span>Angle: <strong className="text-white font-black">{calculation.totalAngleWeight.toFixed(2)} kg</strong> ({angles.length} components)</span>
                  </>
                )}
                <span>=</span>
                <span className="text-white font-black bg-amber-700/90 px-2 py-0.5 rounded font-mono">{calculation.totalWeight.toFixed(2)} kg</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. MATERIAL & LABOUR COST SECTION */}
            {/* ========================================================================= */}
            <div className="border-t border-slate-100 pt-6 space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Cost
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Material Rate (₹/kg) & Material Cost */}
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-teal-900 uppercase tracking-wider">
                      MATERIAL RATE (₹/kg)
                    </label>
                    <span className="text-[10px] text-teal-700 font-bold bg-white px-2 py-0.5 rounded border border-teal-200">
                      Per kg
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-teal-600">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder=""
                      value={pricingInputs.materialRate}
                      onChange={(e) => {
                        const val = sanitizeNumericInput(e.target.value);
                        setPricingInputs({ ...pricingInputs, materialRate: val, sheetRate: val, pipeRate: val });
                      }}
                      className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-teal-300 focus:border-teal-500 focus:outline-none text-xs font-bold text-right shadow-2xs"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-teal-200 font-semibold text-teal-900">
                    <span>MATERIAL COST:</span>
                    <span className="text-teal-950 font-black font-mono text-sm">{formatCurrency(calculation.materialCost)}</span>
                  </div>
                </div>

                {/* Labour Rate (₹/kg) & Labour Cost */}
                <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-violet-900 uppercase tracking-wider">
                      LABOUR RATE (₹/kg)
                    </label>
                    <span className="text-[10px] text-violet-700 font-bold bg-white px-2 py-0.5 rounded border border-violet-200">
                      Per kg
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-violet-600">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder=""
                      value={pricingInputs.labourRate}
                      onChange={(e) => setPricingInputs({ ...pricingInputs, labourRate: sanitizeNumericInput(e.target.value) })}
                      className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-violet-300 focus:border-violet-500 focus:outline-none text-xs font-bold text-right shadow-2xs"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-violet-200 font-semibold text-violet-900">
                    <span>LABOUR COST:</span>
                    <span className="text-violet-950 font-black font-mono text-sm">{formatCurrency(calculation.labourCost)}</span>
                  </div>
                </div>
              </div>

              {/* Purchased & Components Cost Summary */}
              {calculation.purchasedItemCost > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between text-xs">
                  <span className="text-indigo-900 font-bold">PURCHASED &amp; HARDWARE ITEMS COST:</span>
                  <span className="text-indigo-950 font-black font-mono text-sm">{formatCurrency(calculation.purchasedItemCost)}</span>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 3. TOTAL SECTION (INTERNAL COST, SELLING % & UNIT SELLING PRICE) */}
            {/* ========================================================================= */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Total
                </h3>
              </div>

              {/* Grand Total Internal Cost */}
              <div className="p-4 rounded-xl bg-linear-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                    GRAND TOTAL INTERNAL COST
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Material Cost + Labour Cost + Purchased Items</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {formatCurrency(calculation.subtotal)}
                </div>
              </div>

              {/* Selling Percentage Card */}
              <div className="p-5 rounded-2xl bg-linear-to-b from-emerald-50/90 to-teal-50/50 border border-emerald-300 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Selling Percentage (%)
                    </label>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    Live Markup
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={pricingInputs.sellingPercentage}
                    onChange={(e) => setPricingInputs({ ...pricingInputs, sellingPercentage: sanitizeNumericInput(e.target.value) })}
                    className="w-full bg-white text-slate-900 px-4 py-2.5 rounded-xl border border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm font-black text-right shadow-2xs"
                  />
                  <span className="text-base font-black text-emerald-950">%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/80">
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Selling Amount</span>
                    </div>
                    <span className="text-sm font-black text-emerald-900 font-mono">
                      {formatCurrency(calculation.sellingAmount || 0)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[11px] font-black text-emerald-100 uppercase tracking-wider block">Selling Price / Unit</span>
                    </div>
                    <span className="text-base font-black text-white font-mono">
                      {formatCurrency(calculation.unitSellingPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Bottom Navigation Buttons */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-3d btn-3d-slate px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Material Specification
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="btn-3d btn-3d-emerald px-6 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Continue to Selling Price & Final Estimate
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4 — SELLING PRICE & BILL */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* SECTION 1 – SELLING PRICE & FINANCIAL ADJUSTMENTS */}
          <div className="card-3d p-6 border-slate-200/90 bg-white">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Step 4 – Selling Price & Bill Finalization
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                {clientData.estimateNumber}
              </span>
            </div>

            {/* 4-Box Primary Selling Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Box 1: Counter Name */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Counter Name
                </span>
                <span className="text-sm font-black text-slate-900 block">
                  {clientData.counterType || 'Working Table'}
                  {clientData.counterSubtype ? ` (${clientData.counterSubtype})` : ''}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">Stainless Steel Commercial Unit</span>
              </div>

              {/* Box 2: Counter Quantity Input (Editable in Step 4) */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black text-blue-900 uppercase tracking-wider">
                    Quantity
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold">Units</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={clientData.counterQuantity || '1'}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const parsed = parseInt(raw, 10);
                    const safeVal = isNaN(parsed) || parsed < 1 ? '' : String(parsed);
                    setClientData({ ...clientData, counterQuantity: safeVal });
                  }}
                  onBlur={() => {
                    if (!clientData.counterQuantity || parseInt(clientData.counterQuantity, 10) < 1) {
                      setClientData({ ...clientData, counterQuantity: '1' });
                    }
                  }}
                  className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none text-base font-black text-center shadow-2xs"
                />
                <span className="text-[10px] text-blue-600 font-medium text-center mt-1">Quantity of counters</span>
              </div>

              {/* Box 3: Selling Price per Unit */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Selling Price / Unit
                </span>
                <div className="text-lg font-black text-slate-800 font-mono">
                  {formatCurrency(calculation.unitSellingPrice)}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1">Single counter unit price</span>
              </div>

              {/* Box 4: Total Selling Price */}
              <div className="p-4 rounded-xl bg-linear-to-b from-blue-50 to-indigo-50/60 border border-blue-300 flex flex-col justify-between">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block mb-1">
                  Total Selling Price
                </span>
                <div className="text-lg font-black text-blue-800 font-mono tracking-tight">
                  {formatCurrency(calculation.totalSellingPrice)}
                </div>
                <span className="text-[10px] text-blue-600 font-medium mt-1">
                  {formatCurrency(calculation.unitSellingPrice)} × {calculation.counterQuantity}
                </span>
              </div>
            </div>

            {/* Financial Adjustments Grid: GST, Discount, Grand Total */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* GST (%) Input & GST Amount */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    GST (%)
                  </label>
                  <span className="text-[10px] text-amber-800 font-bold">Tax</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={pricingInputs.gst}
                    onChange={(e) => setPricingInputs({ ...pricingInputs, gst: sanitizeNumericInput(e.target.value) })}
                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-amber-300 focus:border-amber-500 focus:outline-none text-xs font-bold text-right shadow-2xs"
                  />
                  <span className="text-xs font-bold text-amber-900">%</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-amber-200/60 font-semibold text-amber-900">
                  <span>GST Amount:</span>
                  <span className="font-black font-mono">{formatCurrency(calculation.gstAmount)}</span>
                </div>
              </div>

              {/* Discount (₹) Input */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                    Discount (₹)
                  </label>
                  <span className="text-[10px] text-rose-800 font-bold">Manual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-600">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={pricingInputs.discount}
                    onChange={(e) => setPricingInputs({ ...pricingInputs, discount: sanitizeNumericInput(e.target.value) })}
                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-rose-300 focus:border-rose-500 focus:outline-none text-xs font-bold text-right shadow-2xs"
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-rose-200/60 font-semibold text-rose-900">
                  <span>Applied Discount:</span>
                  <span className="font-black font-mono">{formatCurrency(calculation.discount)}</span>
                </div>
              </div>

              {/* Grand Total Hero Box */}
              <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 text-white flex flex-col justify-between shadow-md shadow-emerald-700/20">
                <div>
                  <span className="text-[11px] font-black text-emerald-100 uppercase tracking-widest block mb-0.5">
                    Grand Total
                  </span>
                  <span className="text-[10px] text-emerald-200 font-medium">Final customer billing amount</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-2">
                  {formatCurrency(calculation.finalTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 – BILL PREVIEW */}
          <div className="card-3d p-6 border-slate-200/90 bg-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Customer Bill Preview
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Generated for {clientData.customerName || 'Customer'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                {quotationBillItems.length} Item(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs mb-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-3 text-center w-16">Sr. No.</th>
                    <th className="py-2.5 px-3">Counter Name</th>
                    <th className="py-2.5 px-3 text-center w-24">Qty</th>
                    <th className="py-2.5 px-3 text-right w-40">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                  {quotationBillItems.map((item) => (
                    <tr key={item.srNo} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {item.srNo}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 text-xs">{item.counterName}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-black font-mono text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-black font-mono text-slate-900 text-xs">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-900">
                    <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider font-black">
                      TOTAL
                    </td>
                    <td className="py-3 px-3 text-right font-black font-mono text-sm text-emerald-400">
                      {formatCurrency(calculation.finalTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Action Buttons: Generate Bill & Save Estimate */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="btn-3d btn-3d-slate px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Weight Summary
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleGeneratePDF}
                  className="btn-3d px-6 py-2.5 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 border border-slate-700 cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Generate Bill
                </button>

                <button
                  onClick={handleSaveProject}
                  disabled={loading}
                  className="btn-3d btn-3d-emerald px-6 py-2.5 text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {projectToEdit ? 'Update Estimate' : 'Save Estimate'}
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
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${selectedCatalogCategory === cat
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
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${mat.category === 'Sheet' ? 'bg-emerald-600' :
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
