import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  IndianRupee, 
  Plus, 
  Loader2, 
  Scale,
  TrendingUp,
  PieChart as PieIcon,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const COLORS = ['#059669', '#0284c7', '#d97706', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b'];

export default function Dashboard({ setActiveTab, onNewProject }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupee = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs font-semibold">Loading Dashboard Analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalProjects: 0,
    totalEstimates: 0,
    totalMaterialWeight: 0,
    todayQuotations: 0,
    totalCustomers: 0,
    estimatedRevenue: 0
  };

  const revenueTimeline = data?.revenueTimeline || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const recentProjects = data?.recentProjects || [];

  const hasTimelineData = revenueTimeline.some(d => (d.value || 0) > 0 || (d.count || 0) > 0);
  const hasCounterData = categoryDistribution.length > 0 && categoryDistribution.some(d => (d.value || 0) > 0);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-36 text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          </div>
          <p className="text-slate-500 text-xs">Real-time commercial kitchen estimation pipeline, material metrics & analytics</p>
        </div>
        <button
          onClick={() => {
            if (onNewProject) onNewProject();
            setActiveTab('builder');
          }}
          className="btn-3d btn-3d-emerald px-5 py-2.5 text-xs shadow-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Estimate
        </button>
      </div>

      {/* 3D KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Estimated Pipeline Revenue */}
        <div className="card-3d-interactive p-5 bg-linear-to-b from-white to-emerald-50/20 border-emerald-200/70">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
            {formatRupee(metrics.estimatedRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Commercial Pipeline
          </div>
        </div>

        {/* Total Material Weight */}
        <div className="card-3d-interactive p-5 bg-linear-to-b from-white to-cyan-50/20 border-cyan-200/70">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Material Weight</span>
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
            {(Number(metrics.totalMaterialWeight) || 0).toFixed(1)} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            Stainless Steel Fabricated
          </div>
        </div>

        {/* Total Cost Estimates */}
        <div className="card-3d-interactive p-5 bg-linear-to-b from-white to-indigo-50/20 border-indigo-200/70">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Estimates</span>
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
            {metrics.totalEstimates}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Generated Quotations
          </div>
        </div>

        {/* Customer Accounts */}
        <div className="card-3d-interactive p-5 bg-linear-to-b from-white to-amber-50/20 border-amber-200/70">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Commercial Clients</span>
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
            {metrics.totalCustomers}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Active Client Accounts
          </div>
        </div>
      </div>

      {/* 3D Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Growth Trend Area Chart (Green Accent) */}
        <div className="lg:col-span-2 card-3d p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Estimation Value Trend
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Monthly commercial quotation aggregate (₹)</p>
            </div>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              Live Saved Data
            </span>
          </div>

          <div className="h-64 w-full relative">
            {!hasTimelineData ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Estimation Data Recorded Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Saved projects will automatically plot monthly quotation value trends here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val >= 1000 ? `₹${(val/1000).toFixed(0)}k` : `₹${val}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '12px', 
                      color: '#0f172a', 
                      fontSize: '11px', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' 
                    }}
                    formatter={(val) => [formatRupee(val), 'Quotation Value']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullMonth || label}
                  />
                  <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#emeraldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Counter Types Breakdown Donut Chart (Multi Accent) */}
        <div className="card-3d p-6 flex flex-col">
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Counter Distribution
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Quotations grouped by equipment type</p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center my-auto">
            {!hasCounterData ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <PieIcon className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Counter Data Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Counter types will show once estimates are saved.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '12px', 
                      color: '#0f172a', 
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }}
                    formatter={(val, name) => [`${val} estimate(s)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Modern Legend */}
          {hasCounterData && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
              {categoryDistribution.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-700 font-semibold truncate">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3D Recent Estimations Table Card */}
      <div className="card-3d p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Recent Project Quotations
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Latest commercial kitchen cost estimations saved in the system</p>
          </div>
          <button 
            onClick={() => setActiveTab('projects')}
            className="btn-3d btn-3d-slate px-3.5 py-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50/50"
          >
            View All Projects →
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="py-14 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Inbox className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Recent Project Quotations</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">Click "Create New Estimate" above to start and save your first commercial project quotation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider bg-slate-50/90">
                  <th className="py-3 px-4">Estimate No</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Counter Type</th>
                  <th className="py-3 px-4 text-right">Material Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                {recentProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {project.estimateNumber || 'EST 01'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{project.customerName || project.projectName || 'Valued Customer'}</div>
                      {project.companyName && (
                        <div className="text-[10px] text-slate-400">{project.companyName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                        {project.counterType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {(Number(project.totalMaterialWeight) || 0).toFixed(2)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
