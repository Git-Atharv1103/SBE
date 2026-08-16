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
    counterType: '',
    counterSubtype: '',
    estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
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

  // Fetch all materials & counter types from Master on mount
  useEffect(() => {
    fetchMasterData();
  }, []);

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

      // 4. Purchased Items
      const purchasedRows = configuredMaterials
        .filter(m => (m.category || '').toLowerCase() === 'purchased' || (m.calculationType || '').toLowerCase() === 'purchased')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((m, idx) => {
          const dropdownOpts = Array.isArray(m.dropdownOptions) && m.dropdownOptions.length > 0 
            ? m.dropdownOptions 
            : (Array.isArray(m.options) && m.options.length > 0 ? m.options : getItemSizeOptions(m.materialName));
          return {
            id: `pur-${m._id || idx}-${Date.now()}-${idx}`,
            materialId: m._id,
            material: m.materialName,
            calculationType: 'purchased',
            dropdownOptions: dropdownOpts,
            allowMultiple: Boolean(m.allowMultiple) || (dropdownOpts && dropdownOpts.length > 0),
            size: dropdownOpts ? dropdownOpts[0] : '',
            quantity: '',
            price: m.price !== null && m.price !== undefined && m.price !== '' ? String(m.price) : ''
          };
        });

      // 5. Compressor / Refrigeration Items
      const compressorRows = configuredMaterials
        .filter(m => (m.category || '').toLowerCase() === 'compressor' || (m.category || '').toLowerCase() === 'special' || (m.calculationType || '').toLowerCase() === 'compressor')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((m, idx) => {
          const dropdownOpts = Array.isArray(m.dropdownOptions) && m.dropdownOptions.length > 0 
            ? m.dropdownOptions 
            : (Array.isArray(m.options) && m.options.length > 0 ? m.options : null);
          return {
            id: `comp-${m._id || idx}-${Date.now()}-${idx}`,
            materialId: m._id,
            material: m.materialName,
            calculationType: 'compressor',
            category: 'Compressor',
            dropdownOptions: dropdownOpts,
            allowMultiple: Boolean(m.allowMultiple),
            size: dropdownOpts ? dropdownOpts[0] : '',
            quantity: '',
            price: m.price !== null && m.price !== undefined && m.price !== '' ? String(m.price) : ''
          };
        });

      setSheets(sheetRows);
      setPipes(pipeRows);
      setAngles(angleRows);
      setPurchased(purchasedRows);
      setCompressor(compressorRows);
    } else {
      // Fallback from central templates
      const fallback = getFallbackCounterTemplate(targetKey);
      setSheets(JSON.parse(JSON.stringify(fallback.sheets || [])));
      setPipes(JSON.parse(JSON.stringify(fallback.pipes || [])));
      setAngles(JSON.parse(JSON.stringify(fallback.angles || [])));
      setPurchased(JSON.parse(JSON.stringify(fallback.purchased || [])));
      setCompressor(JSON.parse(JSON.stringify(fallback.compressor || [])));
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
        counterType: projectToEdit.counterType || '',
        counterSubtype: projectToEdit.counterSubtype || '',
        estimateNumber: projectToEdit.estimateNumber || `EST-${Date.now().toString().slice(-6)}`,
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
          quantity: '',
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
          quantity: '',
          price: mat.price !== null && mat.price !== undefined ? String(mat.price) : ''
        }
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
      counterSubtype: '',
      estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
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
    showStatus('success', 'Reset workspace for a New Counter Estimate.');
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Project Estimate
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Single-source Material Master driven commercial fabrication estimate generator
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetNewCounter}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            title="Reset to New Counter"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            + New Counter
          </button>
          <button
            onClick={handlePrintQuotation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            title="Print Quotation"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print
          </button>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            title="Download Quotation PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Generate Estimate
          </button>
          <button
            onClick={handleSaveProject}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {projectToEdit ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </div>

      {/* 3-Step Wizard Header */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { step: 1, label: 'Step 1', name: 'Client Data' },
          { step: 2, label: 'Step 2', name: 'Material Specification' },
          { step: 3, label: 'Step 3', name: 'Weight Summary' }
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border transition-all duration-150 text-left cursor-pointer ${
              currentStep === s.step
                ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <span className={`text-xs font-black block mt-0.5 ${currentStep === s.step ? 'text-emerald-700' : 'text-slate-700'}`}>
                {s.name}
              </span>
            </div>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-2 md:mt-0 ${
              currentStep === s.step ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
            }`}>
              {s.step}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1 — CLIENT DATA */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Step 1 — Client Information & Counter Selection</h2>
              <p className="text-xs text-slate-500 mt-0.5">Define estimate metadata and choose the target fabrication counter type</p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-mono text-[11px] font-bold border border-emerald-200">
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
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs font-bold"
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
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs"
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
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs"
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
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs"
              />
            </div>

            {/* Counter Type Selector */}
            <div className={`p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 ${currentCounterConfig.hasSubtypes ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  Select Counter Type *
                </label>
              </div>
              <select
                value={clientData.counterType}
                onChange={(e) => handleCounterTypeChange(e.target.value)}
                className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none text-xs font-black"
              >
                <option value="">-- Choose Counter Type --</option>
                {availableCounterTypes.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Conditionally Render Subtype Selector (e.g. Storage Bin, Fridge, Gas Range, Shawarma Cabin) */}
            {currentCounterConfig.hasSubtypes && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-300 space-y-2 md:col-span-1 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                    {currentCounterConfig.subtypeLabel || 'Counter Subtype'} *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold">Required</span>
                </div>
                <select
                  value={clientData.counterSubtype}
                  onChange={(e) => handleSubtypeChange(e.target.value)}
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-lg border border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-xs font-black"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Continue to Material Specifications
              <ArrowRight className="w-4 h-4" />
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
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Counter Template</span>
                <h2 className="text-sm font-black text-slate-900">
                  {clientData.counterType || 'Not Selected'}
                  {clientData.counterSubtype ? ` — ${clientData.counterSubtype}` : ''}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMaterialModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Component Row
              </button>
            </div>
          </div>

          {!clientData.counterType || (currentCounterConfig.hasSubtypes && !clientData.counterSubtype) ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-bold">
                {!clientData.counterType 
                  ? 'Please select a Counter Type in Step 1 to load material specifications.' 
                  : `Please select ${currentCounterConfig.subtypeLabel} in Step 1 to load material specifications.`}
              </p>
              <button
                onClick={() => setCurrentStep(1)}
                className="mt-3 text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Go back to Step 1
              </button>
            </div>
          ) : (
            <>
              {/* 1. SHEET MATERIALS TABLE */}
              {sheets.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs w-full">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sheet Materials</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{sheets.length} component(s)</span>
                  </div>

                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
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
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {sheets.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          const currentGrade = row.grade ? String(row.grade).replace(/^SS/i, '') : '304';
                          const hasCustomGaugeOpts = Array.isArray(row.gaugeOptions) && row.gaugeOptions.length > 0;

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
                                  value={currentGrade}
                                  onChange={(e) => updateSheetRow(idx, 'grade', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
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
                                {hasCustomGaugeOpts ? (
                                  <select
                                    value={row.gauge !== undefined && row.gauge !== '' ? row.gauge : ''}
                                    onChange={(e) => updateSheetRow(idx, 'gauge', e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-emerald-300 focus:border-emerald-500 focus:outline-none text-xs font-bold text-emerald-800"
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
                                    className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
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
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                </div>
              )}

              {/* 2. PIPE MATERIALS TABLE */}
              {pipes.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs w-full">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-600"></div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pipe Materials</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{pipes.length} component(s)</span>
                  </div>

                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
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
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {pipes.map((row, idx) => {
                          const rowWeight = calculateRowWeight(row);
                          const currentGrade = row.grade ? String(row.grade).replace(/^SS/i, '') : '304';
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
                                  value={currentGrade}
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
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
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
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-cyan-700">
                                {formatWeight(rowWeight)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deletePipeRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                </div>
              )}

              {/* 3. ANGLE MATERIALS TABLE (RENDERED ONLY WHEN CONFIGURED OR ADDED) */}
              {angles.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs w-full">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Angle Materials</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{angles.length} component(s)</span>
                  </div>

                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
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
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {angles.map((row, idx) => {
                          const rowWeight = calculateAngleWeight(row);
                          return (
                            <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="Angle Material Name"
                                  value={row.material || ''}
                                  onChange={(e) => updateAngleRow(idx, 'material', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2.5 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={row.gauge || '25 × 3 mm'}
                                  onChange={(e) => updateAngleRow(idx, 'gauge', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
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
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
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
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-right font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-indigo-700">
                                {formatWeight(rowWeight)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => deleteAngleRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                </div>
              )}

              {/* 4. PURCHASED ITEMS TABLE (PRICED-BASED CALCULATION: TOTAL PRICE = QUANTITY × PRICE) */}
              {purchased.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs w-full">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Purchased Items</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{purchased.length} component(s)</span>
                  </div>

                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
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
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {purchased.map((row, idx) => {
                          const totalPrice = calculatePurchasedItemPrice(row.quantity, row.price);
                          const totalPriceDisplay = totalPrice !== null ? formatPurchasedPrice(totalPrice) : '—';
                          const opts = Array.isArray(row.dropdownOptions) && row.dropdownOptions.length > 0 
                            ? row.dropdownOptions 
                            : getItemSizeOptions(row.material);

                          return (
                            <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3 text-left">
                                <input
                                  type="text"
                                  placeholder="Material / Item Name"
                                  value={row.material || ''}
                                  onChange={(e) => updatePurchasedRow(idx, 'material', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2.5 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                {opts && opts.length > 0 ? (
                                  <select
                                    value={row.size || opts[0]}
                                    onChange={(e) => updatePurchasedRow(idx, 'size', e.target.value)}
                                    className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-amber-300 focus:border-amber-500 focus:outline-none text-xs font-bold"
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
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-center font-semibold"
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
                                  className="w-full px-2 py-1 rounded border text-xs text-center font-bold bg-white text-slate-900 border-slate-200 focus:border-amber-500 focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-amber-700">
                                {totalPriceDisplay}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {(row.allowMultiple || (opts && opts.length > 0)) && (
                                    <button
                                      type="button"
                                      onClick={() => handleAddRepeatablePurchasedItem(row)}
                                      className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                      title={`+ Add Another ${row.material || 'Item'}`}
                                    >
                                      <PlusCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deletePurchasedRow(idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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

              {/* 5. COMPRESSOR & REFRIGERATION MATERIALS TABLE */}
              {compressor.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs w-full">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Compressor & Refrigeration Materials</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{compressor.length} component(s)</span>
                  </div>

                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
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
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {compressor.map((row, idx) => {
                          const totalPrice = calculatePurchasedItemPrice(row.quantity, row.price);
                          const totalPriceDisplay = totalPrice !== null ? formatPurchasedPrice(totalPrice) : '—';
                          const opts = Array.isArray(row.dropdownOptions) && row.dropdownOptions.length > 0 ? row.dropdownOptions : null;

                          return (
                            <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3 text-left">
                                <input
                                  type="text"
                                  placeholder="Component Name"
                                  value={row.material || ''}
                                  onChange={(e) => updateCompressorRow(idx, 'material', e.target.value)}
                                  className="w-full bg-white text-slate-900 px-2.5 py-1 rounded border border-slate-200 focus:border-purple-500 focus:outline-none text-xs font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                {opts && opts.length > 0 ? (
                                  <select
                                    value={row.size || opts[0]}
                                    onChange={(e) => updateCompressorRow(idx, 'size', e.target.value)}
                                    className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-purple-300 focus:border-purple-500 focus:outline-none text-xs font-bold"
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
                                  className="w-full bg-white text-slate-900 px-2 py-1 rounded border border-slate-200 focus:border-purple-500 focus:outline-none text-xs text-center font-semibold"
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
                                  className="w-full px-2 py-1 rounded border text-xs text-center font-bold bg-white text-slate-900 border-slate-200 focus:border-purple-500 focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-purple-700">
                                {totalPriceDisplay}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {(row.allowMultiple || (opts && opts.length > 0)) && (
                                    <button
                                      type="button"
                                      onClick={() => handleAddRepeatableCompressorItem(row)}
                                      className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                                      title={`+ Add Another ${row.material || 'Component'}`}
                                    >
                                      <PlusCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteCompressorRow(idx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Client Data
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
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
            <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                Step 3 — Weight Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Counter Type */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Counter Type</span>
                  <span className="text-sm font-black text-slate-900">
                    {clientData.counterType || 'N/A'}
                    {clientData.counterSubtype ? ` (${clientData.counterSubtype})` : ''}
                  </span>
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-2xs cursor-pointer"
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
            <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 sticky top-8 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">
                Pricing Summary
              </h3>

              <div className="space-y-3.5">
                {/* Material Cost */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Material Cost</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(calculation.materialCost)}
                  </span>
                </div>

                {/* Purchased Item & Compressor Cost */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Purchased & Components Cost</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(calculation.purchasedItemCost)}
                  </span>
                </div>

                {/* Labour Cost */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Labour Cost</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(calculation.labourCost)}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Discount</span>
                  <span className="text-sm font-bold text-slate-900">
                    {calculation.discount > 0 ? `- ${formatCurrency(calculation.discount)}` : formatCurrency(0)}
                  </span>
                </div>

                {/* GST */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">GST</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(calculation.gstAmount)}
                  </span>
                </div>

                {/* Grand Total Estimate */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mt-2">
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Generate Estimate
                </button>

                <button
                  onClick={handleSaveProject}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {projectToEdit ? 'Update Project' : 'Save Project'}
                </button>

                <button
                  onClick={handlePrintQuotation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Print
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
