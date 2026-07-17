import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Download, 
  X, 
  Loader2, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ProjectsList({ onEditProject, setActiveTab }) {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected project for detailed summary view modal
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, mRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/customers'),
        fetch('/api/materials')
      ]);

      if (pRes.ok && cRes.ok && mRes.ok) {
        const pData = await pRes.json();
        const cData = await cRes.json();
        const mData = await mRes.json();
        
        // Sort projects by date descending (latest first)
        setProjects(pData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setCustomers(cData);
        setMaterials(mData);
      }
    } catch (error) {
      console.error('Error fetching projects list:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (custId) => {
    const cust = customers.find(c => c._id === custId);
    return cust ? cust.customerName : 'Unknown Customer';
  };

  const getCustomerDetails = (custId) => {
    return customers.find(c => c._id === custId) || { customerName: 'Unknown', phone: '-', address: '-' };
  };

  const getMaterialName = (matId) => {
    const mat = materials.find(m => m._id === matId);
    return mat ? mat.materialName : 'Custom Material';
  };

  const getMaterialUnit = (matId) => {
    const mat = materials.find(m => m._id === matId);
    return mat ? mat.unit : '';
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this cost estimation?')) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete project');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleOpenDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const res = await fetch(`/api/projects?id=${id}`);
      if (res.ok) {
        const detailData = await res.json();
        setSelectedProjectDetails(detailData);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // REGENERATE PDF
  const handleDownloadPDF = async (projectSummary) => {
    const cust = getCustomerDetails(projectSummary.customerId);
    
    // Fetch full project details if we don't have materials loaded in this object
    let projectItems = projectSummary.materials || [];
    if (projectItems.length === 0) {
      try {
        const res = await fetch(`/api/projects?id=${projectSummary._id}`);
        if (res.ok) {
          const detailed = await res.json();
          projectItems = detailed.materials || [];
        }
      } catch (e) {
        console.error(e);
      }
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('ABC FABRICATION', 14, 16);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Industrial & Structural Metal Fabricators', 14, 22);
    doc.text('Phone: +91 98765 43210 | Email: billing@abcfab.com', 14, 27);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('COMMERCIAL QUOTATION', 130, 20);

    // Metadata details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text('CLIENT DETAILS', 14, 52);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Customer: ${cust.customerName}`, 14, 58);
    doc.text(`Phone: ${cust.phone}`, 14, 63);
    doc.text(`Address: ${cust.address}`, 14, 68);
    if (cust.email) doc.text(`Email: ${cust.email}`, 14, 73);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('QUOTATION DETAILS', 130, 52);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Project Name: ${projectSummary.projectName}`, 130, 58);
    doc.text(`Date: new Date(projectSummary.date).toISOString().split('T')[0]`, 130, 63);
    doc.text(`Quotation ID: QT-${projectSummary._id?.slice(-6) || 'N/A'}`, 130, 68);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 78, 196, 78);

    const tableHeaders = [['#', 'Material Description', 'Quantity', 'Unit', 'Rate', 'Amount']];
    const tableRows = projectItems.map((item, idx) => [
      idx + 1,
      getMaterialName(item.materialId),
      item.quantity,
      getMaterialUnit(item.materialId) || 'Kg',
      `Rs. ${item.unitPrice.toLocaleString('en-IN')}`,
      `Rs. ${item.total.toLocaleString('en-IN')}`
    ]);

    doc.autoTable({
      startY: 84,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { width: 10, halign: 'center' },
        1: { width: 70 },
        2: { width: 25, halign: 'right' },
        3: { width: 20, halign: 'center' },
        4: { width: 30, halign: 'right' },
        5: { width: 30, halign: 'right' }
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Remarks Box on Left
    if (projectSummary.remarks) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, finalY, 95, 38, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, finalY, 95, 38, 'S');
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Terms & Remarks:', 18, finalY + 6);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const splitRemarks = doc.splitTextToSize(projectSummary.remarks, 85);
      doc.text(splitRemarks, 18, finalY + 12);
    }

    // Calculations
    const materialTotal = projectItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const labourCostVal = Number(projectSummary.labourCost) || 0;
    const transportCostVal = Number(projectSummary.transportCost) || 0;
    const discountVal = Number(projectSummary.discount) || 0;
    const gstPercent = Number(projectSummary.gst) || 0;

    const taxableSubtotal = Math.max(0, materialTotal + labourCostVal + transportCostVal - discountVal);
    const gstAmount = Math.round(taxableSubtotal * (gstPercent / 100));
    const grandTotal = taxableSubtotal + gstAmount;

    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    
    let currentY = finalY + 5;
    const addSummaryRow = (label, value, isBold = false) => {
      if (isBold) {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
      } else {
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
      }
      doc.text(label, 130, currentY);
      doc.text(value, 196, currentY, { align: 'right' });
      currentY += 6;
    };

    addSummaryRow('Material Total:', `Rs. ${materialTotal.toLocaleString('en-IN')}`);
    addSummaryRow('Labour Cost:', `Rs. ${labourCostVal.toLocaleString('en-IN')}`);
    if (transportCostVal > 0) addSummaryRow('Transport Cost:', `Rs. ${transportCostVal.toLocaleString('en-IN')}`);
    if (discountVal > 0) addSummaryRow('Discount:', `- Rs. ${discountVal.toLocaleString('en-IN')}`);
    if (gstPercent > 0) addSummaryRow(`GST (${gstPercent}%):`, `Rs. ${gstAmount.toLocaleString('en-IN')}`);
    
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(130, currentY, 196, currentY);
    currentY += 6;
    
    addSummaryRow('Grand Total:', `Rs. ${grandTotal.toLocaleString('en-IN')}`, true);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a computer generated quotation and requires no physical signatures.', 14, 280);

    doc.save(`Quotation_${projectSummary.projectName.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredProjects = projects.filter(p => {
    return p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(p.customerId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.remarks || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Quotations</h1>
          <p className="text-slate-400 text-sm">Review, print, and manage saved fabrication estimations</p>
        </div>
        <button
          onClick={() => {
            onEditProject(null); // Clean state
            setActiveTab('builder');
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Create Estimation
        </button>
      </div>

      {/* Filter */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotations by project, customer, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 text-white placeholder-slate-500 pl-12 pr-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm transition-colors duration-300"
          />
        </div>
      </div>

      {/* Projects Table */}
      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl py-16 text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-1">No Quotations Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Generate a new project estimate in the Builder tab to populate this list.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Project Details</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6 text-center">Date</th>
                  <th className="py-4 px-6 text-right">Labour (₹)</th>
                  <th className="py-4 px-6 text-right">Grand Total (₹)</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-sm font-medium">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-slate-800/20 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white leading-tight">{project.projectName}</div>
                      {project.remarks && <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{project.remarks}</div>}
                    </td>
                    <td className="py-4 px-6 text-slate-300">{getCustomerName(project.customerId)}</td>
                    <td className="py-4 px-6 text-center text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {new Date(project.date).toISOString().split('T')[0]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400 font-semibold">
                      ₹{project.labourCost?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="py-4 px-6 text-right text-emerald-400 font-bold text-base">
                      ₹{project.totalAmount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => handleOpenDetails(project._id)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200"
                          title="View Cost Breakdown"
                        >
                          {loadingDetails && selectedProjectDetails?._id === project._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(project)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200"
                          title="Download PDF Quotation"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            onEditProject(project);
                            setActiveTab('builder');
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200"
                          title="Edit Cost Estimate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
                          title="Delete Estimate"
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

      {/* Summary View Modal */}
      {selectedProjectDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedProjectDetails.projectName}</h2>
                <span className="text-xs text-emerald-400 font-semibold">QT-{selectedProjectDetails._id?.slice(-6).toUpperCase()}</span>
              </div>
              <button
                onClick={() => setSelectedProjectDetails(null)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Summary */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              {/* Customer Profile Box */}
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-b border-slate-800 pb-4">
                <div>
                  <span className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Details</span>
                  <div className="text-white font-bold">{getCustomerDetails(selectedProjectDetails.customerId).customerName}</div>
                  <div>Phone: {getCustomerDetails(selectedProjectDetails.customerId).phone}</div>
                  <div className="truncate">Address: {getCustomerDetails(selectedProjectDetails.customerId).address}</div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Estimate Date</span>
                  <div className="text-white font-bold">{new Date(selectedProjectDetails.date).toISOString().split('T')[0]}</div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Itemized Materials</span>
                <div className="bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden">
                  <table className="w-full text-left text-xs font-medium">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Material</th>
                        <th className="py-2.5 px-4 text-right">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {selectedProjectDetails.materials?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/10">
                          <td className="py-2.5 px-4 font-bold text-slate-200">{getMaterialName(item.materialId)}</td>
                          <td className="py-2.5 px-4 text-right">{item.quantity} {getMaterialUnit(item.materialId)}</td>
                          <td className="py-2.5 px-4 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">₹{item.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Costs Breakdown */}
              <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-4 space-y-2.5 text-sm">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cost Summary</span>
                
                {/* Material Total */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Material Total</span>
                  <span className="text-white font-bold">
                    ₹{selectedProjectDetails.materials?.reduce((sum, item) => sum + (item.total || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Labour Cost */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Labour Cost</span>
                  <span className="text-white font-bold">₹{selectedProjectDetails.labourCost?.toLocaleString('en-IN')}</span>
                </div>

                {/* Transport Cost */}
                {selectedProjectDetails.transportCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Transport Cost</span>
                    <span className="text-white font-bold">₹{selectedProjectDetails.transportCost?.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Discount */}
                {selectedProjectDetails.discount > 0 && (
                  <div className="flex items-center justify-between text-red-400">
                    <span>Discount</span>
                    <span>- ₹{selectedProjectDetails.discount?.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* GST */}
                {selectedProjectDetails.gst > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GST ({selectedProjectDetails.gst}%)</span>
                    <span className="text-white font-bold">
                      ₹{Math.round(
                        Math.max(0, 
                          selectedProjectDetails.materials?.reduce((sum, item) => sum + (item.total || 0), 0) + 
                          selectedProjectDetails.labourCost + 
                          selectedProjectDetails.transportCost - 
                          selectedProjectDetails.discount
                        ) * (selectedProjectDetails.gst / 100)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <hr className="border-slate-800 my-1" />

                {/* Grand Total */}
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Grand Total</span>
                  <span className="text-lg font-black text-emerald-400">₹{selectedProjectDetails.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-950/20">
              <button
                onClick={() => setSelectedProjectDetails(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all duration-200"
              >
                Close Summary
              </button>
              <button
                onClick={() => {
                  handleDownloadPDF(selectedProjectDetails);
                  setSelectedProjectDetails(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
