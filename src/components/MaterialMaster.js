import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle,
  Loader2,
  Filter
} from 'lucide-react';

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
    categoryId: '',
    unit: 'Kg',
    price: '',
    description: '',
    status: 'Active'
  });
  
  // Validation state
  const [formErrors, setFormErrors] = useState({});
  
  // Category Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ categoryName: '' });
  const [catFormErrors, setCatFormErrors] = useState({});

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
      console.error('Error fetching materials master:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      materialName: '',
      categoryId: categories[0]?._id || '',
      unit: 'Kg',
      price: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material) => {
    setEditingMaterial(material);
    setFormData({
      materialName: material.materialName,
      categoryId: material.categoryId,
      unit: material.unit,
      price: material.price.toString(),
      description: material.description || '',
      status: material.status || 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.materialName.trim()) errors.materialName = 'Material Name is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price per unit is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = '/api/materials';
      const method = editingMaterial ? 'PUT' : 'POST';
      const bodyData = editingMaterial 
        ? { _id: editingMaterial._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save material');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving material:', error);
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete material');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      setLoading(false);
    }
  };

  const handleCatFormSubmit = async (e) => {
    e.preventDefault();
    if (!catFormData.categoryName.trim()) {
      setCatFormErrors({ categoryName: 'Category Name is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catFormData)
      });

      if (response.ok) {
        const newCat = await response.json();
        setIsCatModalOpen(false);
        setCatFormData({ categoryName: '' });
        setCatFormErrors({});
        const cRes = await fetch('/api/categories');
        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(cData);
          setFormData(prev => ({ ...prev, categoryId: newCat._id }));
        }
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c._id === catId);
    return cat ? cat.categoryName : 'Uncategorized';
  };

  // Filtered Materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.materialName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Material Master</h1>
          <p className="text-slate-400 text-sm">Manage fabrication materials and raw cost rates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCatFormData({ categoryName: '' });
              setCatFormErrors({});
              setIsCatModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 text-white placeholder-slate-500 pl-12 pr-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm transition-colors duration-300"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
            <Filter className="w-4 h-4" />
            Category:
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 text-white border border-slate-800 px-4 py-3 rounded-xl text-sm font-semibold focus:border-emerald-500 focus:outline-none min-w-[150px] transition-colors duration-300"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.categoryName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Material Grid/Table */}
      {loading && materials.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-1">No Materials Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Try updating your filters or add a new material to pre-populate this list.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Material Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Unit</th>
                  <th className="py-4 px-6 text-right">Price per Unit</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-sm font-medium">
                {filteredMaterials.map((material) => (
                  <tr key={material._id} className="hover:bg-slate-800/20 transition-colors duration-200">
                    <td className="py-4 px-6 text-white font-bold">{material.materialName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                        {getCategoryName(material.categoryId)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">{material.unit}</td>
                    <td className="py-4 px-6 text-right text-emerald-400 font-semibold">₹{material.price.toFixed(2)}</td>
                    <td className="py-4 px-6 text-slate-400 max-w-xs truncate">{material.description || '-'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        material.status === 'Inactive' 
                          ? 'bg-red-500/10 text-red-400' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${material.status === 'Inactive' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                        {material.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(material)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Material Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Material Name *</label>
                <input
                  type="text"
                  placeholder="e.g. MS Pipe 40x40"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-4 py-3 rounded-xl border ${
                    formErrors.materialName ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-sm`}
                />
                {formErrors.materialName && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.materialName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="flex-1 bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm"
                    >
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.categoryName}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setCatFormData({ categoryName: '' });
                        setCatFormErrors({});
                        setIsCatModalOpen(true);
                      }}
                      className="px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-400 rounded-xl transition-all"
                      title="Add New Category"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Unit Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Sheet">Sheet</option>
                    <option value="Piece">Piece</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price per Unit (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 94"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full bg-slate-950 text-white px-4 py-3 rounded-xl border ${
                      formErrors.price ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                    } focus:outline-none text-sm`}
                  />
                  {formErrors.price && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.price}</p>
                  )}
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows="3"
                  placeholder="Optional material specs or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Create New Category</h2>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCatFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Pipes, Plates, Fasteners..."
                  value={catFormData.categoryName}
                  onChange={(e) => setCatFormData({ ...catFormData, categoryName: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border ${
                    catFormErrors.categoryName ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-xs`}
                />
                {catFormErrors.categoryName && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{catFormErrors.categoryName}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40 text-xs font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs transition-all duration-200"
                >
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
