import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Download, 
  X, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Filter,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { useAlert } from '@/context/AlertContext';

export default function ProjectsList({ onEditProject, setActiveTab }) {
  const { showConfirm, showAlert } = useAlert();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounterType, setSelectedCounterType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Selected project for modal detail preview
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        // Sort latest first
        setProjects(data.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)));
      }
    } catch (error) {
      console.error('Error fetching projects list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    const confirmed = await showConfirm({
      title: 'Delete Cost Estimation',
      message: 'Are you sure you want to delete this cost estimation? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProjects();
      } else {
        await showAlert({
          title: 'Error',
          message: 'Failed to delete estimation.',
          type: 'error'
        });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      await showAlert({
        title: 'Network Error',
        message: 'Could not connect to server.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const handleDownloadPDF = (project, shouldPrint = false) => {
    generateQuotationPDF(project, { shouldPrint });
  };

  // Derive unique counter types from saved projects for filter dropdown
  const uniqueCounterTypes = useMemo(() => {
    const set = new Set();
    projects.forEach(p => {
      if (p.counterType) set.add(p.counterType.trim());
    });
    return Array.from(set);
  }, [projects]);

  const hasActiveFilters = searchQuery !== '' || selectedCounterType !== '' || selectedDate !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCounterType('');
    setSelectedDate('');
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // 1. Search Query (Estimate No, Customer Name, Company Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const estMatch = (p.estimateNumber || '').toLowerCase().includes(q);
        const custMatch = (p.customerName || '').toLowerCase().includes(q);
        const compMatch = (p.companyName || '').toLowerCase().includes(q);
        const projMatch = (p.projectName || '').toLowerCase().includes(q);
        if (!estMatch && !custMatch && !compMatch && !projMatch) {
          return false;
        }
      }

      // 2. Counter Type Filter
      if (selectedCounterType) {
        if ((p.counterType || '').toLowerCase() !== selectedCounterType.toLowerCase()) {
          return false;
        }
      }

      // 3. Date Filter (matches YYYY-MM-DD)
      if (selectedDate) {
        const pDateStr = p.date ? new Date(p.date).toISOString().split('T')[0] : '';
        if (pDateStr !== selectedDate) {
          return false;
        }
      }

      return true;
    });
  }, [projects, searchQuery, selectedCounterType, selectedDate]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-36 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Estimations</h1>
          </div>
          <p className="text-slate-500 text-xs font-medium">Review, filter, manage, and print saved commercial fabrication quotations</p>
        </div>
        <button
          onClick={() => {
            if (onEditProject) onEditProject(null);
            setActiveTab('builder');
          }}
          className="btn-3d btn-3d-indigo px-5 py-2.5 text-xs shadow-md shadow-indigo-600/20"
        >
          <FileSpreadsheet className="w-4 h-4 mr-1.5" />
          + New Estimate
        </button>
      </div>

      {/* Filter / Search Bar in 3D Card */}
      <div className="card-3d p-4.5 mb-6 border-indigo-200/70 bg-linear-to-b from-white to-indigo-50/15 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input: Estimate No or Customer Name */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Estimate No, Customer, Company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/60 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:outline-none text-xs font-semibold transition-all"
            />
          </div>

          {/* Counter Type Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCounterType}
              onChange={(e) => setSelectedCounterType(e.target.value)}
              className="w-full bg-slate-50/60 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:outline-none text-xs font-bold transition-all shadow-2xs"
            >
              <option value="">All Counter Types</option>
              {uniqueCounterTypes.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="sm:col-span-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50/60 text-slate-900 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:outline-none text-xs font-bold transition-all shadow-2xs"
              title="Filter by Date"
            />
          </div>

          {/* Reset Filters */}
          <div className="sm:col-span-1 flex items-center justify-end">
            <button
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className={`btn-3d w-full h-full py-2.5 px-2.5 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                hasActiveFilters 
                  ? 'btn-3d-slate text-rose-700 bg-rose-50 border-rose-200' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Summary & Matching Count */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredProjects.length}</strong> of <strong className="text-slate-900 font-bold">{projects.length}</strong> saved estimate(s)
          </span>
          {hasActiveFilters && (
            <span className="text-indigo-700 font-black bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[10px]">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* Projects Table in 3D Card */}
      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card-3d py-16 text-center border-dashed">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-800 font-bold text-sm mb-1">
            {projects.length === 0 ? 'No Estimations Created Yet' : 'No Matching Estimations Found'}
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            {projects.length === 0 
              ? 'Click "+ New Estimate" above to create and save your first commercial kitchen estimate.'
              : 'Try clearing your search query or adjusting your filters.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn-3d btn-3d-slate mt-4 px-4 py-1.5 text-xs font-bold inline-flex items-center"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="card-3d overflow-hidden p-0 border-slate-200/90 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Estimate Number</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Counter Type</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-right">Total Material Weight</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                {filteredProjects.map((project) => {
                  const weightVal = Number(project.totalMaterialWeight) || 0;
                  const dateStr = project.date
                    ? new Date(project.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={project._id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/90 font-mono font-black text-xs shadow-2xs">
                          {project.estimateNumber || 'EST 01'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-indigo-500 to-blue-500 text-white font-black text-[11px] flex items-center justify-center shadow-2xs shrink-0">
                            {(project.customerName || project.projectName || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 leading-snug">
                              {project.customerName || project.projectName || 'Valued Customer'}
                            </div>
                            {project.companyName && (
                              <div className="text-[11px] text-slate-500 font-medium">
                                {project.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {project.counterType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {dateStr}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-amber-700">
                        {weightVal > 0 ? `${weightVal.toFixed(2)} kg` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
                            title="View Summary"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(project, false)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(project, true)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
                            title="Print Quotation"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onEditProject(project);
                              setActiveTab('builder');
                            }}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all shadow-2xs cursor-pointer"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all shadow-2xs cursor-pointer"
                            title="Delete"
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

      {/* Summary View 3D Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="card-3d w-full max-w-xl p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4.5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-indigo-50/20">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-1">
                  {selectedProject.estimateNumber || 'ESTIMATE DETAILS'}
                </span>
                <h2 className="text-sm font-black text-slate-900">{selectedProject.projectName}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Customer & Counter</span>
                  <p className="font-black text-slate-900">{selectedProject.customerName || 'N/A'}</p>
                  {selectedProject.companyName && <p className="text-slate-500 font-medium">{selectedProject.companyName}</p>}
                  <p className="text-indigo-700 font-bold mt-1">{selectedProject.counterType}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Estimate Date</span>
                  <p className="font-black text-slate-900">
                    {selectedProject.date ? new Date(selectedProject.date).toLocaleDateString('en-IN') : '—'}
                  </p>
                  <p className="text-slate-500 mt-1">{selectedProject.phone || ''}</p>
                </div>
              </div>

              {/* Weight and Pricing Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card-3d-interactive p-3.5 bg-amber-50/40 border-amber-200">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block mb-0.5">Total Material Weight</span>
                  <span className="text-lg font-black text-amber-700">
                    {(Number(selectedProject.totalMaterialWeight) || 0).toFixed(2)} kg
                  </span>
                </div>
                <div className="card-3d-interactive p-3.5 bg-emerald-50/50 border-emerald-200">
                  <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block mb-0.5">Final Total Estimate</span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatCurrency(selectedProject.finalTotal || selectedProject.totalAmount || selectedProject.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Cost Summary Breakdown Table */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Material Cost:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedProject.materialCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Labour Cost:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedProject.labourCost)}</span>
                </div>
                {selectedProject.sellingPrice > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Selling Price (+{selectedProject.sellingPercentage || 0}%):</span>
                    <span className="font-bold">{formatCurrency(selectedProject.sellingPrice)}</span>
                  </div>
                )}
                {selectedProject.gstAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({selectedProject.gst || 18}%):</span>
                    <span className="font-bold text-slate-900">{formatCurrency(selectedProject.gstAmount)}</span>
                  </div>
                )}
                {selectedProject.discount > 0 && (
                  <div className="flex justify-between text-rose-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-bold">- {formatCurrency(selectedProject.discount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedProject(null)}
                className="btn-3d btn-3d-slate px-4 py-2 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadPDF(selectedProject, false);
                  setSelectedProject(null);
                }}
                className="btn-3d btn-3d-emerald px-4 py-2 text-xs shadow-sm"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
