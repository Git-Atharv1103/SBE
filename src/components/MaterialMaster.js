import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Layers, 
  Sparkles, 
  Info,
  CheckCircle,
  AlertCircle,
  Filter,
  Check,
  Package,
  Boxes,
  Wrench,
  Scale,
  Tag,
  LayoutGrid,
  ListFilter,
  Settings2,
  FolderPlus,
  ArrowRight,
  MinusCircle,
  PlusCircle,
  GripVertical,
  MousePointerClick
} from 'lucide-react';
import { 
  SHEET_GRADES,
  STAINLESS_STEEL_GRADES, 
  STANDARD_GAUGES, 
  PIPE_MASTER,
  ANGLE_MASTER,
  ANGLE_GAUGE_OPTIONS,
  COUNTER_TYPES,
  COUNTER_TYPES_CONFIG 
} from '@/lib/constants';
import { useAlert } from '@/context/AlertContext';

export default function MaterialMaster() {
  const { showConfirm, showAlert } = useAlert();
  // Main Sub-Tab Switcher: 'catalog' (Products) | 'counterTypes' (Types of Counter)
  const [activeSubTab, setActiveSubTab] = useState('catalog');

  // Master Data States
  const [materials, setMaterials] = useState([]);
  const [counterTypes, setCounterTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Search and Filter States for Products Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [counterTypeFilter, setCounterTypeFilter] = useState('All');

  // Search State for Counter Types Table
  const [counterTypeSearch, setCounterTypeSearch] = useState('');

  // Modals for Material Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [newCounterTypeTagInput, setNewCounterTypeTagInput] = useState('');

  const [productFormData, setProductFormData] = useState({
    materialName: '',
    category: 'Sheet',
    calculationType: 'Sheet',
    materialType: '',
    grade: '304',
    gauge: '',
    gaugeOptions: '',
    pipeSize: '',
    dropdownOptions: '',
    allowMultiple: false,
    defaultUnitWeight: '',
    allowCustomUnitWeight: false,
    counterTypes: ['Stainless Steel Kitchen'],
    order: 0,
    unit: 'kg',
    price: '',
    description: '',
    status: 'Active'
  });
  const [productFormErrors, setProductFormErrors] = useState({});

  // Modals for Counter Types
  const [isCounterTypeModalOpen, setIsCounterTypeModalOpen] = useState(false);
  const [editingCounterType, setEditingCounterType] = useState(null);
  const [counterTypeFormData, setCounterTypeFormData] = useState({
    name: '',
    description: '',
    category: 'Kitchen Equipment',
    order: 1,
    status: 'Active',
    materialIds: []
  });
  const [counterTypeFormErrors, setCounterTypeFormErrors] = useState({});

  // Modal for "Manage Materials for Counter Type" (with Drag & Drop)
  const [managingCounterType, setManagingCounterType] = useState(null);
  const [assignMaterialSearch, setAssignMaterialSearch] = useState('');
  const [assignMaterialCategory, setAssignMaterialCategory] = useState('ALL');

  // Drag & Drop States
  const [draggedMaterial, setDraggedMaterial] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const dragCounters = useRef({ Sheet: 0, Pipe: 0, Angle: 0, Purchased: 0, Compressor: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [mRes, ctRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/counter-types')
      ]);
      
      if (mRes.ok && ctRes.ok) {
        const mData = await mRes.json();
        const ctData = await ctRes.json();
        setMaterials(mData);
        setCounterTypes(ctData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showStatus('error', 'Failed to fetch Master data.');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, message) => {
    setStatusMessage({ type, text: message });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Derive dynamic list of all counter type names and subtypes
  const allAvailableCounterTypes = useMemo(() => {
    const set = new Set();
    counterTypes.forEach(ct => { if (ct.name) set.add(ct.name.trim()); });
    COUNTER_TYPES.forEach(ct => {
      set.add(ct);
      const cfg = COUNTER_TYPES_CONFIG[ct];
      if (cfg && cfg.hasSubtypes && Array.isArray(cfg.subtypes)) {
        cfg.subtypes.forEach(st => set.add(st));
      }
    });
    materials.forEach(m => {
      if (Array.isArray(m.counterTypes)) {
        m.counterTypes.forEach(t => { if (t) set.add(t.trim()); });
      }
    });
    return Array.from(set);
  }, [counterTypes, materials]);

  // =========================================================================
  // MATERIAL PRODUCT HANDLERS
  // =========================================================================
  const handleOpenAddProductModal = () => {
    setEditingMaterial(null);
    setProductFormData({
      materialName: '',
      category: 'Sheet',
      calculationType: 'Sheet',
      materialType: '',
      grade: '304',
      gauge: '',
      gaugeOptions: '',
      pipeSize: '',
      dropdownOptions: '',
      allowMultiple: false,
      defaultUnitWeight: '',
      allowCustomUnitWeight: false,
      counterTypes: counterTypeFilter !== 'All' ? [counterTypeFilter] : ['Stainless Steel Kitchen'],
      order: 1,
      unit: 'kg',
      price: '',
      description: '',
      status: 'Active'
    });
    setNewCounterTypeTagInput('');
    setProductFormErrors({});
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (mat) => {
    setEditingMaterial(mat);
    setProductFormData({
      materialName: mat.materialName || '',
      category: mat.category || 'Sheet',
      calculationType: mat.calculationType || (mat.category === 'Compressor' ? 'Purchased' : (mat.category || 'Sheet')),
      materialType: mat.materialType || '',
      grade: mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304',
      gauge: mat.gauge !== undefined && mat.gauge !== null ? String(mat.gauge) : '',
      gaugeOptions: Array.isArray(mat.gaugeOptions) ? mat.gaugeOptions.join(', ') : '',
      pipeSize: mat.pipeSize || '',
      dropdownOptions: Array.isArray(mat.dropdownOptions) ? mat.dropdownOptions.join(', ') : (Array.isArray(mat.options) ? mat.options.join(', ') : ''),
      allowMultiple: Boolean(mat.allowMultiple),
      defaultUnitWeight: mat.defaultUnitWeight !== undefined && mat.defaultUnitWeight !== null ? String(mat.defaultUnitWeight) : '',
      allowCustomUnitWeight: Boolean(mat.allowCustomUnitWeight),
      counterTypes: Array.isArray(mat.counterTypes) ? [...mat.counterTypes] : [],
      order: mat.order !== undefined ? mat.order : 0,
      unit: mat.unit || 'kg',
      price: mat.price !== undefined && mat.price !== null ? String(mat.price) : '',
      description: mat.description || '',
      status: mat.status || 'Active'
    });
    setNewCounterTypeTagInput('');
    setProductFormErrors({});
    setIsProductModalOpen(true);
  };

  const handleProductCategoryChange = (newCat) => {
    const isPurchased = newCat === 'Purchased' || newCat === 'Compressor' || newCat === 'Special';
    const isAngle = newCat === 'Angle';
    setProductFormData(prev => ({
      ...prev,
      category: newCat,
      calculationType: newCat === 'Compressor' ? 'Purchased' : newCat,
      unit: isPurchased ? 'Piece' : 'kg',
      gauge: isAngle ? '25 × 3 mm' : prev.gauge,
      defaultUnitWeight: '',
      allowCustomUnitWeight: false
    }));
  };

  const toggleProductCounterType = (ct) => {
    setProductFormData(prev => {
      const current = prev.counterTypes || [];
      if (current.includes(ct)) {
        return { ...prev, counterTypes: current.filter(item => item !== ct) };
      } else {
        return { ...prev, counterTypes: [...current, ct] };
      }
    });
  };

  const handleAddNewCounterTypeTag = () => {
    const val = newCounterTypeTagInput.trim();
    if (!val) return;
    if (!productFormData.counterTypes.includes(val)) {
      setProductFormData(prev => ({
        ...prev,
        counterTypes: [...prev.counterTypes, val]
      }));
    }
    setNewCounterTypeTagInput('');
  };

  const validateProductForm = () => {
    const errors = {};
    if (!productFormData.materialName.trim()) errors.materialName = 'Material Name is required';
    if (!productFormData.category) errors.category = 'Category is required';
    if (productFormData.price && (isNaN(productFormData.price) || parseFloat(productFormData.price) < 0)) {
      errors.price = 'Invalid rate per unit';
    }
    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    try {
      setLoading(true);
      const parsedGaugeOpts = productFormData.gaugeOptions
        ? productFormData.gaugeOptions.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
        : null;

      const parsedDropdownOpts = productFormData.dropdownOptions
        ? productFormData.dropdownOptions.split(',').map(s => s.trim()).filter(Boolean)
        : null;

      const payload = {
        materialName: productFormData.materialName.trim(),
        category: productFormData.category,
        calculationType: productFormData.calculationType || (productFormData.category === 'Compressor' ? 'Purchased' : productFormData.category),
        materialType: productFormData.materialType.trim(),
        grade: productFormData.grade ? String(productFormData.grade).replace(/^SS/i, '') : '304',
        gauge: productFormData.category === 'Angle' 
          ? (productFormData.gauge || '25 × 3 mm')
          : (productFormData.category === 'Sheet' && productFormData.gauge !== '' ? parseFloat(productFormData.gauge) : ''),
        gaugeOptions: parsedGaugeOpts && parsedGaugeOpts.length > 0 ? parsedGaugeOpts : null,
        pipeSize: productFormData.category === 'Pipe' ? productFormData.pipeSize : '',
        dropdownOptions: parsedDropdownOpts && parsedDropdownOpts.length > 0 ? parsedDropdownOpts : null,
        allowMultiple: Boolean(productFormData.allowMultiple),
        defaultUnitWeight: null,
        allowCustomUnitWeight: false,
        counterTypes: productFormData.counterTypes,
        order: parseInt(productFormData.order, 10) || 0,
        unit: productFormData.unit,
        price: parseFloat(productFormData.price) || 0,
        description: productFormData.description.trim(),
        status: productFormData.status
      };

      let res;
      if (editingMaterial) {
        res = await fetch('/api/materials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingMaterial._id, ...payload })
        });
      } else {
        res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showStatus('success', editingMaterial ? 'Component updated successfully!' : 'Component created successfully!');
        setIsProductModalOpen(false);
        fetchInitialData();
      } else {
        const err = await res.json();
        showStatus('error', err.error || 'Failed to save component.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Network error. Could not save component.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const confirmed = await showConfirm({
      title: 'Delete Component',
      message: `Are you sure you want to delete component "${name}" from Material Master? This cannot be undone.`,
      type: 'danger',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('success', `Component "${name}" removed from Material Master.`);
        fetchInitialData();
      } else {
        showStatus('error', 'Failed to delete component.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // COUNTER TYPE HANDLERS
  // =========================================================================
  const handleOpenAddCounterTypeModal = () => {
    setEditingCounterType(null);
    setCounterTypeFormData({
      name: '',
      description: '',
      category: 'Kitchen Equipment',
      order: counterTypes.length + 1,
      status: 'Active',
      materialIds: []
    });
    setCounterTypeFormErrors({});
    setIsCounterTypeModalOpen(true);
  };

  const handleOpenEditCounterTypeModal = (ct) => {
    setEditingCounterType(ct);
    setCounterTypeFormData({
      name: ct.name || '',
      description: ct.description || '',
      category: ct.category || 'Kitchen Equipment',
      order: ct.order !== undefined ? ct.order : 1,
      status: ct.status || 'Active',
      materialIds: ct.materialIds || []
    });
    setCounterTypeFormErrors({});
    setIsCounterTypeModalOpen(true);
  };

  const validateCounterTypeForm = () => {
    const errors = {};
    if (!counterTypeFormData.name.trim()) errors.name = 'Counter Type Name is required';
    setCounterTypeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCounterTypeSubmit = async (e) => {
    e.preventDefault();
    if (!validateCounterTypeForm()) return;

    try {
      setLoading(true);
      const payload = {
        name: counterTypeFormData.name.trim(),
        description: counterTypeFormData.description.trim(),
        category: counterTypeFormData.category.trim(),
        order: parseInt(counterTypeFormData.order, 10) || 1,
        status: counterTypeFormData.status
      };

      let res;
      if (editingCounterType) {
        res = await fetch('/api/counter-types', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCounterType._id, ...payload })
        });
      } else {
        res = await fetch('/api/counter-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showStatus('success', editingCounterType ? 'Counter Type updated!' : 'Counter Type created!');
        setIsCounterTypeModalOpen(false);
        fetchInitialData();
      } else {
        const err = await res.json();
        showStatus('error', err.error || 'Failed to save Counter Type.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCounterType = async (id, name) => {
    const confirmed = await showConfirm({
      title: 'Delete Counter Type',
      message: `Are you sure you want to delete Counter Type "${name}"? This cannot be undone.`,
      type: 'danger',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/counter-types?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('success', `Counter Type "${name}" deleted.`);
        fetchInitialData();
      } else {
        showStatus('error', 'Failed to delete Counter Type.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // MANAGE MATERIALS & DRAG AND DROP
  // =========================================================================
  const handleOpenManageCounterTypeMaterials = (ct) => {
    setManagingCounterType(ct);
    setAssignMaterialSearch('');
    setAssignMaterialCategory('ALL');
    setDraggedMaterial(null);
    setDragOverCategory(null);
  };

  const handleToggleMaterialAssignment = async (material, shouldAssign) => {
    if (!managingCounterType) return;
    const currentTypes = Array.isArray(material.counterTypes) ? [...material.counterTypes] : [];
    let updatedTypes;

    if (shouldAssign) {
      if (currentTypes.includes(managingCounterType.name)) return;
      updatedTypes = [...currentTypes, managingCounterType.name];
    } else {
      updatedTypes = currentTypes.filter(t => t !== managingCounterType.name);
    }

    // Optimistic UI update
    setMaterials(prev => prev.map(m => m._id === material._id ? { ...m, counterTypes: updatedTypes } : m));

    try {
      const res = await fetch('/api/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: material._id,
          counterTypes: updatedTypes
        })
      });
      if (!res.ok) {
        fetchInitialData();
        showStatus('error', 'Failed to update material assignment.');
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Failed to update material assignment.');
    }
  };

  // Smooth Drag Handlers
  const handleDragStart = (e, mat) => {
    setDraggedMaterial(mat);
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: mat._id, name: mat.materialName, category: mat.category }));
    e.dataTransfer.effectAllowed = 'copy';
    dragCounters.current = { Sheet: 0, Pipe: 0, Angle: 0, Purchased: 0 };
  };

  const handleDragEnd = () => {
    setDraggedMaterial(null);
    setDragOverCategory(null);
    dragCounters.current = { Sheet: 0, Pipe: 0, Angle: 0, Purchased: 0 };
  };

  const handleDragEnter = (e, category) => {
    e.preventDefault();
    dragCounters.current[category] = (dragCounters.current[category] || 0) + 1;
    if (dragCounters.current[category] === 1) {
      setDragOverCategory(category);
    }
  };

  const handleDragLeave = (e, category) => {
    e.preventDefault();
    dragCounters.current[category] = Math.max(0, (dragCounters.current[category] || 1) - 1);
    if (dragCounters.current[category] === 0) {
      setDragOverCategory(prev => (prev === category ? null : prev));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropOnBox = (e, targetCategory) => {
    e.preventDefault();
    dragCounters.current = { Sheet: 0, Pipe: 0, Angle: 0, Purchased: 0 };
    setDragOverCategory(null);

    let mat = draggedMaterial;
    if (!mat) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) {
          const parsed = JSON.parse(raw);
          mat = materials.find(m => m._id === parsed.id);
        }
      } catch (err) {
        console.error('Drag data parse error:', err);
      }
    }

    if (!mat || !managingCounterType) return;

    handleToggleMaterialAssignment(mat, true);
    setDraggedMaterial(null);
  };

  // =========================================================================
  // FILTERED DATA & STATS
  // =========================================================================
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (m.materialName || '').toLowerCase().includes(q) ||
        (m.materialType || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.grade || '').toLowerCase().includes(q) ||
        (m.pipeSize || '').toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
      const matchesCounterType = counterTypeFilter === 'All' || 
        (Array.isArray(m.counterTypes) && m.counterTypes.includes(counterTypeFilter));

      return matchesSearch && matchesCategory && matchesCounterType;
    });
  }, [materials, searchQuery, categoryFilter, counterTypeFilter]);

  const filteredCounterTypes = useMemo(() => {
    return counterTypes.filter(ct => {
      const q = counterTypeSearch.toLowerCase();
      return (ct.name || '').toLowerCase().includes(q) ||
             (ct.description || '').toLowerCase().includes(q) ||
             (ct.category || '').toLowerCase().includes(q);
    });
  }, [counterTypes, counterTypeSearch]);

  const stats = useMemo(() => {
    const total = materials.length;
    const sheetCount = materials.filter(m => m.category === 'Sheet').length;
    const pipeCount = materials.filter(m => m.category === 'Pipe').length;
    const angleCount = materials.filter(m => m.category === 'Angle').length;
    const purchasedCount = materials.filter(m => m.category === 'Purchased').length;
    const compressorCount = materials.filter(m => m.category === 'Compressor' || m.category === 'Special').length;
    const totalCounterTypes = counterTypes.length;
    return { total, sheetCount, pipeCount, angleCount, purchasedCount, compressorCount, totalCounterTypes };
  }, [materials, counterTypes]);

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

      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-emerald-600" />
            Material Master
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Single source of truth for Counter Types, Material Components, Gauges and Formulas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleOpenAddProductModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Master Material
          </button>
          <button
            onClick={handleOpenAddCounterTypeModal}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Counter Type
          </button>
        </div>
      </div>

      {/* Sub-Tabs Nav */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'catalog'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Master Products Catalog ({stats.total})
        </button>
        <button
          onClick={() => setActiveSubTab('counterTypes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'counterTypes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-teal-400" />
          Types of Counters & Templates ({stats.totalCounterTypes})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PRODUCTS / COMPONENTS CATALOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Items</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{stats.total}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Sheets</span>
              <span className="text-xl font-black text-emerald-700 block mt-1">{stats.sheetCount}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block">Pipes</span>
              <span className="text-xl font-black text-cyan-700 block mt-1">{stats.pipeCount}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Angles</span>
              <span className="text-xl font-black text-indigo-700 block mt-1">{stats.angleCount}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Purchased</span>
              <span className="text-xl font-black text-amber-700 block mt-1">{stats.purchasedCount}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Compressor</span>
              <span className="text-xl font-black text-purple-700 block mt-1">{stats.compressorCount}</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search component name, grade, pipe gauge, or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold shrink-0">Counter Type:</span>
              <select
                value={counterTypeFilter}
                onChange={(e) => setCounterTypeFilter(e.target.value)}
                className="bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-bold"
              >
                <option value="All">All Counter Types</option>
                {allAvailableCounterTypes.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold shrink-0">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-bold"
              >
                <option value="All">All Categories</option>
                <option value="Sheet">Sheet Materials</option>
                <option value="Pipe">Pipe Materials</option>
                <option value="Angle">Angle Materials</option>
                <option value="Purchased">Purchased Items</option>
                <option value="Compressor">Compressor / Refrigeration</option>
              </select>
            </div>
          </div>

          {/* Materials Table */}
          {loading && materials.length === 0 ? (
            <div className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-16 text-center shadow-xs">
              <p className="text-slate-500 text-xs font-semibold">No materials match the selected filters.</p>
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setCounterTypeFilter('All'); }}
                className="mt-3 text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Material / Product Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Calculation / Specs</th>
                      <th className="py-3 px-4">Assigned Counter Types</th>
                      <th className="py-3 px-3 text-right">Standard Rate</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredMaterials.map((mat) => {
                      const isPurchased = mat.category === 'Purchased';
                      const isSheet = mat.category === 'Sheet';
                      const isPipe = mat.category === 'Pipe';
                      const isAngle = mat.category === 'Angle';
                      const counterTypesCount = Array.isArray(mat.counterTypes) ? mat.counterTypes.length : 0;

                      return (
                        <tr key={mat._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block text-xs">{mat.materialName}</span>
                            {mat.materialType && (
                              <span className="text-[10px] text-slate-500 block font-medium mt-0.5">{mat.materialType}</span>
                            )}
                            {mat.description && (
                              <span className="text-[10px] text-slate-400 block italic line-clamp-1">{mat.description}</span>
                            )}
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isSheet ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              isPipe ? 'bg-cyan-50 text-cyan-800 border-cyan-200' :
                              isAngle ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {mat.category || 'Sheet'}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            {isSheet && (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-700 block">{mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304'}</span>
                                {mat.gauge && <span className="text-[10px] text-slate-500 font-semibold block">{mat.gauge} mm Gauge</span>}
                              </div>
                            )}
                            {isPipe && (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-700 block">{mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304'}</span>
                                {mat.pipeSize && <span className="text-[10px] text-cyan-700 font-semibold block">{mat.pipeSize}</span>}
                              </div>
                            )}
                            {isAngle && (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-700 block">{mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304'}</span>
                                <span className="text-[10px] text-indigo-700 font-semibold block">{mat.gauge || '25 × 3 mm'}</span>
                              </div>
                            )}
                            {isPurchased && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                  Purchased Item
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {counterTypesCount === 0 ? (
                              <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {mat.counterTypes.slice(0, 2).map((ct, idx) => (
                                  <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 truncate max-w-[130px]">
                                    {ct}
                                  </span>
                                ))}
                                {counterTypesCount > 2 && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    +{counterTypesCount - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <span className="font-bold text-slate-900 block">
                              {mat.price ? `₹ ${mat.price}` : '—'}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">per {mat.unit || 'kg'}</span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              mat.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {mat.status || 'Active'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditProductModal(mat)}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(mat._id, mat.materialName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Product"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: TYPES OF COUNTER & TEMPLATES */}
      {/* ========================================================================= */}
      {activeSubTab === 'counterTypes' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search counter types..."
                value={counterTypeSearch}
                onChange={(e) => setCounterTypeSearch(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCounterTypes.map((ct) => {
              const assignedMaterials = materials.filter(m => Array.isArray(m.counterTypes) && m.counterTypes.includes(ct.name));
              const sheetCount = assignedMaterials.filter(m => (m.category || '').toLowerCase() === 'sheet').length;
              const pipeCount = assignedMaterials.filter(m => (m.category || '').toLowerCase() === 'pipe').length;
              const angleCount = assignedMaterials.filter(m => (m.category || '').toLowerCase() === 'angle').length;
              const purCount = assignedMaterials.filter(m => (m.category || '').toLowerCase() === 'purchased').length;

              return (
                <div key={ct._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-sm text-slate-900 tracking-tight">{ct.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ct.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {ct.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px]">
                      {ct.description || 'Standard Stainless Steel Kitchen Commercial Counter'}
                    </p>

                    {/* Component Composition Tags */}
                    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sheetCount} Sheets
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {pipeCount} Pipes
                      </span>
                      {angleCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {angleCount} Angles
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {purCount} Purchased
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => handleOpenManageCounterTypeMaterials(ct)}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Configure Components ({assignedMaterials.length})
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCounterTypeModal(ct)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCounterType(ct._id, ct.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Counter Type"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PRODUCT COMPONENT */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/45 backdrop-blur-xs overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {editingMaterial ? 'Edit Material Component' : 'Add New Material Component'}
                  </h3>
                  <span className="text-[10px] text-slate-500 block">Configure dimensions, gauge, and workshop rates</span>
                </div>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleProductSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
                {/* Component Name & Sub-Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Material Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Top, Leg Pipe, Bush, Burner"
                      value={productFormData.materialName}
                      onChange={(e) => setProductFormData({ ...productFormData, materialName: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none font-bold text-xs"
                    />
                    {productFormErrors.materialName && <p className="text-[10px] text-rose-600 mt-0.5 font-semibold">{productFormErrors.materialName}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Component Role (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Top Work Surface, Base Bracing"
                      value={productFormData.materialType}
                      onChange={(e) => setProductFormData({ ...productFormData, materialType: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Component Category *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'Sheet', label: 'Sheet', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
                      { id: 'Pipe', label: 'Pipe', activeClass: 'bg-cyan-600 text-white border-cyan-600' },
                      { id: 'Angle', label: 'Angle', activeClass: 'bg-indigo-600 text-white border-indigo-600' },
                      { id: 'Purchased', label: 'Purchased', activeClass: 'bg-amber-600 text-white border-amber-600' },
                      { id: 'Compressor', label: 'Compressor', activeClass: 'bg-purple-600 text-white border-purple-600' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleProductCategoryChange(cat.id)}
                        className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                          productFormData.category === cat.id
                            ? `${cat.activeClass} shadow-2xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Engine & Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Calculation Type
                    </label>
                    <select
                      value={productFormData.calculationType}
                      onChange={(e) => setProductFormData({ ...productFormData, calculationType: e.target.value })}
                      className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    >
                      <option value="Sheet">Sheet (Area × Gauge)</option>
                      <option value="Pipe">Pipe (Length × Pipe Gauge)</option>
                      <option value="Angle">Angle (Length × Gauge)</option>
                      <option value="Purchased">Purchased / Unit (Qty × Price)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Material Grade
                    </label>
                    <select
                      value={productFormData.grade ? String(productFormData.grade).replace(/^SS/i, '') : '304'}
                      onChange={(e) => setProductFormData({ ...productFormData, grade: e.target.value })}
                      className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    >
                      {SHEET_GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {productFormData.category === 'Sheet' && (
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Sheet Specifications</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Default Gauge (Optional)
                        </label>
                        <select
                          value={productFormData.gauge}
                          onChange={(e) => setProductFormData({ ...productFormData, gauge: e.target.value })}
                          className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none text-xs font-medium"
                        >
                          <option value="">-- No Default Gauge --</option>
                          {STANDARD_GAUGES.map(g => (
                            <option key={g.value} value={g.value}>{g.label} ({g.weightPerSqFt} kg/sq.ft)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Custom Gauge Options (e.g. 0.6, 0.8)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 0.6, 0.8 (comma-separated)"
                          value={productFormData.gaugeOptions}
                          onChange={(e) => setProductFormData({ ...productFormData, gaugeOptions: e.target.value })}
                          className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {productFormData.category === 'Pipe' && (
                  <div className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-200/80 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-cyan-700" />
                      <span className="text-[11px] font-bold text-cyan-900 uppercase tracking-wider">Pipe Specifications</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Default Pipe Gauge (Optional)
                        </label>
                        <select
                          value={productFormData.pipeSize}
                          onChange={(e) => setProductFormData({ ...productFormData, pipeSize: e.target.value })}
                          className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-cyan-500 focus:outline-none text-xs font-medium"
                        >
                          <option value="">-- Select Pipe Gauge --</option>
                          {PIPE_MASTER.map(p => (
                            <option key={p.id} value={p.label}>{p.label} ({p.weightPerFoot} kg/ft)</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-600 pt-3 sm:pt-4">
                        <span className="italic">Length in feet will be entered in Project Estimate.</span>
                      </div>
                    </div>
                  </div>
                )}

                {productFormData.category === 'Angle' && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-indigo-700" />
                      <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Angle Specifications</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Angle Gauge
                        </label>
                        <select
                          value={productFormData.gauge || '25 × 3 mm'}
                          onChange={(e) => setProductFormData({ ...productFormData, gauge: e.target.value })}
                          className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-indigo-500 focus:outline-none text-xs font-medium"
                        >
                          {ANGLE_GAUGE_OPTIONS.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-600 pt-3 sm:pt-4">
                        <span className="italic">Length in feet will be entered in Project Estimate.</span>
                      </div>
                    </div>
                  </div>
                )}

                {(productFormData.category === 'Purchased' || productFormData.category === 'Compressor' || productFormData.category === 'Special') && (
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Purchased / Compressor Item Configuration</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Standard Price (₹)
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="e.g. 50"
                          value={productFormData.price}
                          onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                          className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:outline-none font-bold text-xs"
                        />
                        {productFormErrors.price && <p className="text-[10px] text-rose-600 mt-0.5 font-semibold">{productFormErrors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Dropdown Options (Comma-Separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 25×3, 30×3 or G8, G9, G10 or 1, 1.2, 1.3"
                          value={productFormData.dropdownOptions}
                          onChange={(e) => setProductFormData({ ...productFormData, dropdownOptions: e.target.value })}
                          className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-amber-200/50">
                      <input
                        type="checkbox"
                        id="allowMultipleCheckbox"
                        checked={productFormData.allowMultiple}
                        onChange={(e) => setProductFormData({ ...productFormData, allowMultiple: e.target.checked })}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <label htmlFor="allowMultipleCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Allow Multiple Instances in Project Estimate (shows "+ Add More" button)
                      </label>
                    </div>
                  </div>
                )}

                {/* Counter Types Assignment */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-700" />
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        Assign to Counter Types ({productFormData.counterTypes.length} selected)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProductFormData(prev => ({ ...prev, counterTypes: [...allAvailableCounterTypes] }))}
                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setProductFormData(prev => ({ ...prev, counterTypes: [] }))}
                        className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-0.5">
                    {allAvailableCounterTypes.map(ct => {
                      const isSelected = productFormData.counterTypes.includes(ct);
                      return (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => toggleProductCounterType(ct)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-md border text-left text-[10px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-2 h-2" />}
                          </div>
                          <span className="truncate">{ct}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/80">
                    <input
                      type="text"
                      placeholder="+ New Counter Type name..."
                      value={newCounterTypeTagInput}
                      onChange={(e) => setNewCounterTypeTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewCounterTypeTag(); } }}
                      className="flex-1 bg-white text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 focus:border-emerald-500 focus:outline-none text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCounterTypeTag}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Add Type
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Standard Rate (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 250"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="kg or Piece"
                      value={productFormData.unit}
                      onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="1, 2..."
                      value={productFormData.order}
                      onChange={(e) => setProductFormData({ ...productFormData, order: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={productFormData.status}
                      onChange={(e) => setProductFormData({ ...productFormData, status: e.target.value })}
                      className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description / Workshop Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Optional material specification notes or grade standards..."
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors active:scale-95"
                >
                  {editingMaterial ? 'Update Component' : 'Save Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT COUNTER TYPE */}
      {/* ========================================================================= */}
      {isCounterTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/45 backdrop-blur-xs overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[86vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Pinned Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {editingCounterType ? 'Edit Counter Type' : 'Add New Counter Type'}
                  </h3>
                  <span className="text-[10px] text-slate-500 block">Manage fabrication counter structure definition</span>
                </div>
              </div>
              <button 
                onClick={() => setIsCounterTypeModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCounterTypeSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Counter Type Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stainless Steel Kitchen, Gas Range"
                    value={counterTypeFormData.name}
                    onChange={(e) => setCounterTypeFormData({ ...counterTypeFormData, name: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none font-bold text-xs"
                  />
                  {counterTypeFormErrors.name && <p className="text-[10px] text-rose-600 mt-0.5 font-semibold">{counterTypeFormErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Equipment Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen Station, Washing Station, Cooking Range"
                    value={counterTypeFormData.category}
                    onChange={(e) => setCounterTypeFormData({ ...counterTypeFormData, category: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description / Purpose
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the counter structure and standard use..."
                    value={counterTypeFormData.description}
                    onChange={(e) => setCounterTypeFormData({ ...counterTypeFormData, description: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={counterTypeFormData.order}
                      onChange={(e) => setCounterTypeFormData({ ...counterTypeFormData, order: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={counterTypeFormData.status}
                      onChange={(e) => setCounterTypeFormData({ ...counterTypeFormData, status: e.target.value })}
                      className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none font-bold text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCounterTypeModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors active:scale-95"
                >
                  {editingCounterType ? 'Update Counter Type' : 'Save Counter Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANAGE MATERIALS WITH DRAG & DROP FOR COUNTER TYPE */}
      {/* ========================================================================= */}
      {managingCounterType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/45 backdrop-blur-xs overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[86vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    Configure Components: <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">{managingCounterType.name}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Drag and drop materials from right into category boxes on the left, or click the Add button
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setManagingCounterType(null)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* D&D Instruction Banner */}
            <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-cyan-50/80 px-6 py-2 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-950 font-medium">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  <strong>Drag & Drop Ready:</strong> Drag any material from the catalog on the right and drop it into <strong>Sheet</strong>, <strong>Pipe</strong>, <strong>Angle</strong>, or <strong>Purchased</strong> boxes.
                </span>
              </div>
              {draggedMaterial && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                  Dragging: {draggedMaterial.materialName}
                </span>
              )}
            </div>

            {/* Modal Body: Split 2 Columns */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs min-h-0">
              
              {/* LEFT COLUMN: DROP TARGET BOXES */}
              <div className="lg:col-span-6 space-y-4 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Assigned Materials ({materials.filter(m => Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Loaded in Project Estimate</span>
                </div>

                <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                  {/* 1. SHEET MATERIALS DROP ZONE */}
                  <div 
                    onDragEnter={(e) => handleDragEnter(e, 'Sheet')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'Sheet')}
                    onDrop={(e) => handleDropOnBox(e, 'Sheet')}
                    className={`rounded-xl p-4 transition-colors duration-150 relative ${
                      dragOverCategory === 'Sheet'
                        ? 'border-2 border-dashed border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/20'
                        : draggedMaterial
                          ? 'border-2 border-dashed border-emerald-300 bg-emerald-50/30'
                          : 'border border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sheet Materials</span>
                      </div>
                      {dragOverCategory === 'Sheet' ? (
                        <span className="text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full animate-pulse shadow-2xs">
                          + Drop to Add
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          {materials.filter(m => (m.category || '').toLowerCase() === 'sheet' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length} items
                        </span>
                      )}
                    </div>

                    <div className={`space-y-1.5 ${draggedMaterial ? 'pointer-events-none' : ''}`}>
                      {materials
                        .filter(m => (m.category || '').toLowerCase() === 'sheet' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name))
                        .map(m => (
                          <div key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 block text-xs truncate">{m.materialName}</span>
                              <span className="text-[10px] text-slate-400 block">{m.grade ? String(m.grade).replace(/^SS/i, '') : '304'} {m.gauge ? `• ${m.gauge}mm` : ''}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleMaterialAssignment(m, false)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0 pointer-events-auto"
                              title="Remove from this Counter Type"
                            >
                              <MinusCircle className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        ))}
                      {materials.filter(m => (m.category || '').toLowerCase() === 'sheet' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-2 text-center border border-dashed border-slate-200 rounded-lg bg-white/50">
                          Drop Sheet materials here or click + Add from right
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. PIPE MATERIALS DROP ZONE */}
                  <div 
                    onDragEnter={(e) => handleDragEnter(e, 'Pipe')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'Pipe')}
                    onDrop={(e) => handleDropOnBox(e, 'Pipe')}
                    className={`rounded-xl p-4 transition-colors duration-150 relative ${
                      dragOverCategory === 'Pipe'
                        ? 'border-2 border-dashed border-cyan-500 bg-cyan-50 shadow-sm ring-2 ring-cyan-500/20'
                        : draggedMaterial
                          ? 'border-2 border-dashed border-cyan-300 bg-cyan-50/30'
                          : 'border border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pipe Materials</span>
                      </div>
                      {dragOverCategory === 'Pipe' ? (
                        <span className="text-[10px] font-bold text-white bg-cyan-600 px-2.5 py-0.5 rounded-full animate-pulse shadow-2xs">
                          + Drop to Add
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-full">
                          {materials.filter(m => (m.category || '').toLowerCase() === 'pipe' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length} items
                        </span>
                      )}
                    </div>

                    <div className={`space-y-1.5 ${draggedMaterial ? 'pointer-events-none' : ''}`}>
                      {materials
                        .filter(m => (m.category || '').toLowerCase() === 'pipe' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name))
                        .map(m => (
                          <div key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 block text-xs truncate">{m.materialName}</span>
                              <span className="text-[10px] text-cyan-700 font-semibold block">{m.grade ? String(m.grade).replace(/^SS/i, '') : '304'} {m.pipeSize ? `• ${m.pipeSize}` : ''}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleMaterialAssignment(m, false)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0 pointer-events-auto"
                              title="Remove from this Counter Type"
                            >
                              <MinusCircle className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        ))}
                      {materials.filter(m => (m.category || '').toLowerCase() === 'pipe' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-2 text-center border border-dashed border-slate-200 rounded-lg bg-white/50">
                          Drop Pipe materials here or click + Add from right
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. ANGLE MATERIALS DROP ZONE */}
                  <div 
                    onDragEnter={(e) => handleDragEnter(e, 'Angle')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'Angle')}
                    onDrop={(e) => handleDropOnBox(e, 'Angle')}
                    className={`rounded-xl p-4 transition-colors duration-150 relative ${
                      dragOverCategory === 'Angle'
                        ? 'border-2 border-dashed border-indigo-500 bg-indigo-50 shadow-sm ring-2 ring-indigo-500/20'
                        : draggedMaterial
                          ? 'border-2 border-dashed border-indigo-300 bg-indigo-50/30'
                          : 'border border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Angle Materials</span>
                      </div>
                      {dragOverCategory === 'Angle' ? (
                        <span className="text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-full animate-pulse shadow-2xs">
                          + Drop to Add
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                          {materials.filter(m => (m.category || '').toLowerCase() === 'angle' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length} items
                        </span>
                      )}
                    </div>

                    <div className={`space-y-1.5 ${draggedMaterial ? 'pointer-events-none' : ''}`}>
                      {materials
                        .filter(m => (m.category || '').toLowerCase() === 'angle' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name))
                        .map(m => (
                          <div key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 block text-xs truncate">{m.materialName}</span>
                              <span className="text-[10px] text-indigo-700 font-semibold block">{m.grade ? String(m.grade).replace(/^SS/i, '') : '304'} {m.gauge ? `• ${m.gauge}` : ''}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleMaterialAssignment(m, false)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0 pointer-events-auto"
                              title="Remove from this Counter Type"
                            >
                              <MinusCircle className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        ))}
                      {materials.filter(m => (m.category || '').toLowerCase() === 'angle' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-2 text-center border border-dashed border-slate-200 rounded-lg bg-white/50">
                          Drop Angle materials here or click + Add from right
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. PURCHASED ITEMS DROP ZONE */}
                  <div 
                    onDragEnter={(e) => handleDragEnter(e, 'Purchased')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'Purchased')}
                    onDrop={(e) => handleDropOnBox(e, 'Purchased')}
                    className={`rounded-xl p-4 transition-colors duration-150 relative ${
                      dragOverCategory === 'Purchased'
                        ? 'border-2 border-dashed border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-500/20'
                        : draggedMaterial
                          ? 'border-2 border-dashed border-amber-300 bg-amber-50/30'
                          : 'border border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Purchased Items</span>
                      </div>
                      {dragOverCategory === 'Purchased' ? (
                        <span className="text-[10px] font-bold text-white bg-amber-600 px-2.5 py-0.5 rounded-full animate-pulse shadow-2xs">
                          + Drop to Add
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                          {materials.filter(m => (m.category || '').toLowerCase() === 'purchased' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length} items
                        </span>
                      )}
                    </div>

                    <div className={`space-y-1.5 ${draggedMaterial ? 'pointer-events-none' : ''}`}>
                      {materials
                        .filter(m => (m.category || '').toLowerCase() === 'purchased' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name))
                        .map(m => (
                          <div key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 block text-xs truncate">{m.materialName}</span>
                              <span className="text-[10px] text-amber-700 font-bold block">
                                {m.price ? `Price: ₹ ${m.price}` : 'Purchased Item'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleMaterialAssignment(m, false)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0 pointer-events-auto"
                              title="Remove from this Counter Type"
                            >
                              <MinusCircle className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        ))}
                      {materials.filter(m => (m.category || '').toLowerCase() === 'purchased' && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-2 text-center border border-dashed border-slate-200 rounded-lg bg-white/50">
                          Drop Purchased items here or click + Add from right
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 5. COMPRESSOR / SPECIAL ITEMS DROP ZONE */}
                  <div 
                    onDragEnter={(e) => handleDragEnter(e, 'Compressor')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'Compressor')}
                    onDrop={(e) => handleDropOnBox(e, 'Compressor')}
                    className={`rounded-xl p-4 transition-colors duration-150 relative ${
                      dragOverCategory === 'Compressor'
                        ? 'border-2 border-dashed border-purple-500 bg-purple-50 shadow-sm ring-2 ring-purple-500/20'
                        : draggedMaterial
                          ? 'border-2 border-dashed border-purple-300 bg-purple-50/30'
                          : 'border border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Compressor / Refrigeration</span>
                      </div>
                      {dragOverCategory === 'Compressor' ? (
                        <span className="text-[10px] font-bold text-white bg-purple-600 px-2.5 py-0.5 rounded-full animate-pulse shadow-2xs">
                          + Drop to Add
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-full">
                          {materials.filter(m => ((m.category || '').toLowerCase() === 'compressor' || (m.category || '').toLowerCase() === 'special') && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length} items
                        </span>
                      )}
                    </div>

                    <div className={`space-y-1.5 ${draggedMaterial ? 'pointer-events-none' : ''}`}>
                      {materials
                        .filter(m => ((m.category || '').toLowerCase() === 'compressor' || (m.category || '').toLowerCase() === 'special') && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name))
                        .map(m => (
                          <div key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 block text-xs truncate">{m.materialName}</span>
                              <span className="text-[10px] text-purple-700 font-bold block">
                                {m.price ? `Price: ₹ ${m.price}` : 'Refrigeration Component'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleMaterialAssignment(m, false)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0 pointer-events-auto"
                              title="Remove from this Counter Type"
                            >
                              <MinusCircle className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        ))}
                      {materials.filter(m => ((m.category || '').toLowerCase() === 'compressor' || (m.category || '').toLowerCase() === 'special') && Array.isArray(m.counterTypes) && m.counterTypes.includes(managingCounterType.name)).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-2 text-center border border-dashed border-slate-200 rounded-lg bg-white/50">
                          Drop Compressor / Refrigeration items here or click + Add from right
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DRAGGABLE MATERIAL MASTER CATALOG */}
              <div className="lg:col-span-6 space-y-4 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Add from Material Master
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {['ALL', 'Sheet', 'Pipe', 'Angle', 'Purchased', 'Compressor'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAssignMaterialCategory(cat)}
                        className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          assignMaterialCategory === cat 
                            ? 'bg-slate-800 text-white shadow-2xs' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search in Master Catalog */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search materials to drag or add..."
                    value={assignMaterialSearch}
                    onChange={(e) => setAssignMaterialSearch(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none text-[11px] font-medium"
                  />
                </div>

                {/* Draggable Catalog List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                  {materials
                    .filter(m => {
                      const matchesCat = assignMaterialCategory === 'ALL' || m.category === assignMaterialCategory;
                      const q = assignMaterialSearch.toLowerCase();
                      const matchesSearch = (m.materialName || '').toLowerCase().includes(q) ||
                                            (m.materialType || '').toLowerCase().includes(q);
                      return matchesCat && matchesSearch;
                    })
                    .map(mat => {
                      const isAssigned = Array.isArray(mat.counterTypes) && mat.counterTypes.includes(managingCounterType.name);

                      return (
                        <div
                          key={mat._id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, mat)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none group ${
                            isAssigned
                              ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200/50'
                              : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-sm hover:bg-slate-50/50'
                          }`}
                          title="Drag this item and drop it into Sheet, Pipe, Angle, or Purchased box on the left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              mat.category === 'Sheet' ? 'bg-emerald-600' :
                              mat.category === 'Pipe' ? 'bg-cyan-600' :
                              mat.category === 'Angle' ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}></div>

                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block text-xs truncate group-hover:text-emerald-800 transition-colors">
                                {mat.materialName}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {mat.category} {mat.category !== 'Purchased' ? `• Grade ${mat.grade ? String(mat.grade).replace(/^SS/i, '') : '304'}` : ''} {mat.price ? `• ₹ ${mat.price}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isAssigned ? (
                              <button
                                type="button"
                                onClick={() => handleToggleMaterialAssignment(mat, false)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white shadow-2xs hover:bg-rose-600 transition-all cursor-pointer"
                                title="Click to remove from this Counter Type"
                              >
                                <Check className="w-3 h-3" />
                                Assigned
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleMaterialAssignment(mat, true)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95"
                                title="Click to add or drag into box on left"
                              >
                                <Plus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Components assigned here will dynamically appear in Project Estimate for <strong>{managingCounterType.name}</strong>.</span>
              </div>
              <button
                type="button"
                onClick={() => setManagingCounterType(null)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
