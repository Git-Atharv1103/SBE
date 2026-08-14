import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Layers, 
  Sparkles, 
  Info 
} from 'lucide-react';
import { 
  STAINLESS_STEEL_GRADES, 
  STANDARD_GAUGES, 
  PIPE_MASTER 
} from '@/lib/constants';

export default function MaterialMaster() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    materialName: '',
    category: 'Sheet',
    grade: 'SS304',
    unit: 'kg',
    price: '',
    description: '',
    status: 'Active'
  });
  
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, cRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/categories')
      ]);
      
      if (mRes.ok && cRes.ok) {
        const mData = await mRes.json();
        const cData = await cRes.json();
        setMaterials(mData);
        setCategories(cData);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      materialName: '',
      category: 'Sheet',
      grade: 'SS304',
      unit: 'kg',
      price: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mat) => {
    setEditingMaterial(mat);
    setFormData({
      materialName: mat.materialName || '',
      category: mat.category || 'Sheet',
      grade: mat.grade || 'SS304',
      unit: mat.unit || 'kg',
      price: mat.price !== undefined ? String(mat.price) : '',
      description: mat.description || '',
      status: mat.status || 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.materialName.trim()) errors.materialName = 'Material Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) < 0)) {
      errors.price = 'Invalid rate per unit';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        materialName: formData.materialName,
        category: formData.category,
        grade: formData.grade,
        unit: formData.unit,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        status: formData.status
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
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save material');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material configuration?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete material');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = (m.materialName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.grade || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-36 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Material Master</h1>
          <p className="text-slate-500 text-xs">Configure Stainless Steel components, grades, and hardware items</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          + Add SS Component
        </button>
      </div>

      {/* Info Badge Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Standard 1.0mm Sheet</span>
            <span className="text-xs font-black text-slate-900">0.812 kg / sq.ft</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-lg bg-cyan-50 text-cyan-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Supported Grades</span>
            <span className="text-xs font-black text-slate-900">{STAINLESS_STEEL_GRADES.join(' • ')}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Standard Gauges</span>
            <span className="text-xs font-bold text-slate-900">0.8mm, 1.0mm, 1.2mm, 1.5mm, 2.0mm</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material components or grades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
          >
            <option value="All">All Categories</option>
            <option value="Sheet">Sheet</option>
            <option value="Pipe">Pipe</option>
            <option value="Purchased">Purchased</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      {loading && materials.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center shadow-sm">
          <p className="text-slate-500 text-xs">No materials matching filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Component Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Standard Grade</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Standard Rate (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredMaterials.map((mat) => (
                  <tr key={mat._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{mat.materialName}</span>
                      {mat.description && <span className="text-[10px] text-slate-400 block">{mat.description}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        mat.category === 'Sheet' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        mat.category === 'Pipe' ? 'bg-cyan-50 text-cyan-800 border-cyan-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {mat.category || 'Sheet'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {mat.grade || 'SS304'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-bold">
                      {mat.unit || 'kg'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {mat.price ? `₹ ${parseFloat(mat.price).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {mat.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(mat)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mat._id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {editingMaterial ? 'Edit SS Component' : 'Add SS Component'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Component Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Top Sheet, Leg Pipe, Bush"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
                />
                {formErrors.materialName && <p className="text-[10px] text-rose-600 mt-1">{formErrors.materialName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
                  >
                    <option value="Sheet">Sheet</option>
                    <option value="Pipe">Pipe</option>
                    <option value="Purchased">Purchased</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    SS Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
                  >
                    {STAINLESS_STEEL_GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Standard Rate (₹/unit)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 250"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Description / Specification
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional material specification notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  {editingMaterial ? 'Update Component' : 'Save Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
