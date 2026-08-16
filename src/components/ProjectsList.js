import React, { useState, useEffect } from 'react';
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
  Printer
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { useAlert } from '@/context/AlertContext';

export default function ProjectsList({ onEditProject, setActiveTab }) {
  const { showConfirm, showAlert } = useAlert();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
        setProjects(data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
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

  const filteredProjects = projects.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.projectName || '').toLowerCase().includes(query) ||
      (p.customerName || '').toLowerCase().includes(query) ||
      (p.companyName || '').toLowerCase().includes(query) ||
      (p.estimateNumber || '').toLowerCase().includes(query) ||
      (p.counterType || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-36 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Estimations</h1>
          <p className="text-slate-500 text-xs">Review, manage, and print saved commercial fabrication quotations</p>
        </div>
        <button
          onClick={() => {
            if (onEditProject) onEditProject(null);
            setActiveTab('builder');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          + New Estimate
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by estimate #, project name, customer, or counter type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none text-xs transition-all"
          />
        </div>
      </div>

      {/* Projects Table */}
      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-800 font-bold text-sm mb-1">No Estimations Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">Create a new estimate in Project Estimate to populate your projects list.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Estimate Number</th>
                  <th className="py-3 px-4">Project & Customer</th>
                  <th className="py-3 px-4">Counter Type</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-right">Total Material Weight</th>
                  <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredProjects.map((project) => {
                  const weightVal = Number(project.totalMaterialWeight) || 0;
                  const totalVal = Number(project.totalAmount || project.grandTotal) || 0;
                  const dateStr = project.date
                    ? new Date(project.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={project._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {project.estimateNumber || `EST-${project._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{project.projectName}</div>
                        <div className="text-[11px] text-slate-500">
                          {project.customerName || 'Valued Customer'} {project.companyName ? `• ${project.companyName}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {project.counterType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-medium">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {weightVal > 0 ? `${weightVal.toFixed(2)} kg` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-black text-xs">
                        {formatCurrency(totalVal)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all"
                            title="View Summary"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(project, false)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(project, true)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all"
                            title="Print Quotation"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onEditProject(project);
                              setActiveTab('builder');
                            }}
                            className="p-1.5 rounded hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-all"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all"
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

      {/* Summary View Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">
                  {selectedProject.estimateNumber || 'ESTIMATE DETAILS'}
                </span>
                <h2 className="text-sm font-bold text-slate-900 mt-0.5">{selectedProject.projectName}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Customer & Counter</span>
                  <p className="font-bold text-slate-900">{selectedProject.customerName || 'N/A'}</p>
                  {selectedProject.companyName && <p className="text-slate-500">{selectedProject.companyName}</p>}
                  <p className="text-emerald-700 font-semibold mt-1">{selectedProject.counterType}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Estimate Date</span>
                  <p className="font-bold text-slate-900">
                    {selectedProject.date ? new Date(selectedProject.date).toLocaleDateString('en-IN') : '—'}
                  </p>
                  <p className="text-slate-500 mt-1">{selectedProject.phone || ''}</p>
                </div>
              </div>

              {/* Weight and Pricing Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Material Weight</span>
                  <span className="text-lg font-black text-slate-900">
                    {(Number(selectedProject.totalMaterialWeight) || 0).toFixed(2)} kg
                  </span>
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Grand Total Estimate</span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatCurrency(selectedProject.totalAmount || selectedProject.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 p-3.5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadPDF(selectedProject, false);
                  setSelectedProject(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
