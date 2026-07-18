import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  AlertTriangle
} from 'lucide-react';
import { counterTypeOptions } from '@/lib/constants';

export default function CustomerMaster() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    counterType: '',
    phone: '',
    address: '',
    email: ''
  });
  
  // Validation state
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      customerName: '',
      counterType: '',
      phone: '',
      address: '',
      email: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      counterType: customer.counterType || '',
      phone: customer.phone,
      address: customer.address,
      email: customer.email || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customerName.trim()) errors.customerName = 'Customer Name is required';
    if (!formData.counterType.trim()) errors.counterType = 'Counter Type is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      const bodyData = editingCustomer 
        ? { _id: editingCustomer._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save customer');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer? All references in invoices will persist but customer records will be removed.')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete customer');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setLoading(false);
    }
  };

  // Filtered Customers
  const filteredCustomers = customers.filter(c => {
    return c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Master</h1>
          <p className="text-slate-400 text-sm">Manage customer records and billing contacts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, phone, email, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 text-white placeholder-slate-500 pl-12 pr-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm transition-colors duration-300"
          />
        </div>
      </div>

      {/* Customer Grid */}
      {loading && customers.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-1">No Customers Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Try refining your search keyword or create a new profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div 
              key={customer._id} 
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                      <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">{customer.counterType || customer.customerName}</h3>
                      <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Client Profile</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleOpenEditModal(customer)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-xs text-slate-400 font-medium pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="text-slate-300">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="truncate">{customer.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="text-slate-300">{customer.counterType || 'No counter type set'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed line-clamp-2">{customer.address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Engineering Ltd"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-4 py-3 rounded-xl border ${
                    formErrors.customerName ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-sm`}
                />
                {formErrors.customerName && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.customerName}</p>
                )}
              </div>

              {/* Counter Type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Counter Type *</label>
                <select
                  value={formData.counterType}
                  onChange={(e) => setFormData({ ...formData, counterType: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-4 py-3 rounded-xl border ${
                    formErrors.counterType ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-sm`}
                >
                  <option value="">-- Select Counter Type --</option>
                  {counterTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {formErrors.counterType && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.counterType}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-4 py-3 rounded-xl border ${
                    formErrors.phone ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-sm`}
                />
                {formErrors.phone && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. procurement@apexeng.co"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-4 py-3 rounded-xl border ${
                    formErrors.email ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-sm`}
                />
                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.email}</p>
                )}
              </div>

              {/* Billing Address */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Address *</label>
                <textarea
                  rows="3"
                  placeholder="Street, City, State, ZIP..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full bg-slate-950 text-white px-4 py-3 rounded-xl border ${
                    formErrors.address ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
                  } focus:outline-none text-sm resize-none`}
                />
                {formErrors.address && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.address}</p>
                )}
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
