import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  IndianRupee, 
  Plus, 
  Loader2,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const COLORS = ['#059669', '#0284c7', '#d97706', '#6366f1', '#ec4899'];

export default function Dashboard({ setActiveTab, onNewProject }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await fetch('/api/setup');
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
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-36 text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 text-xs">Stainless Steel Kitchen Fabrication Metrics & Activity</p>
        </div>
        <button
          onClick={() => {
            if (onNewProject) onNewProject();
            setActiveTab('builder');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Estimate
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Estimated Pipeline Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {formatRupee(metrics.estimatedRevenue)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Active Commercial Pipeline</span>
        </div>

        {/* Total Material Weight */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Material Weight</span>
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {(Number(metrics.totalMaterialWeight) || 0).toFixed(1)} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-cyan-700 font-semibold">Stainless Steel Fabricated</span>
        </div>

        {/* Total Cost Estimates */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Estimates</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {metrics.totalEstimates}
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold">Generated Quotations</span>
        </div>

        {/* Customer Accounts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Commercial Clients</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {metrics.totalCustomers}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">Active Client Profiles</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Growth Trend Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Estimation Value Trend</h3>
              <p className="text-[11px] text-slate-400">Monthly commercial quotation aggregate (₹)</p>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active FY
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTimeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => [formatRupee(val), 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#emeraldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Counter Types Breakdown Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Counter Distribution</h3>
            <p className="text-[11px] text-slate-400">Quotations by counter type</p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(data?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px]">
            {(data?.categoryDistribution || []).slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Estimations List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Project Quotations</h3>
            <p className="text-[11px] text-slate-400">Latest cost estimations created in Shree Balaji Enterprises</p>
          </div>
          <button 
            onClick={() => setActiveTab('projects')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            View All Projects →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Estimate No</th>
                <th className="py-2.5 px-3">Project & Customer</th>
                <th className="py-2.5 px-3">Counter Type</th>
                <th className="py-2.5 px-3 text-right">Material Weight</th>
                <th className="py-2.5 px-3 text-right">Grand Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {(data?.recentProjects || []).slice(0, 5).map((project) => (
                <tr key={project._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    {project.estimateNumber || `EST-${project._id.slice(-6).toUpperCase()}`}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{project.projectName}</div>
                    <div className="text-[10px] text-slate-400">{project.customerName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">
                    {project.counterType}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                    {(Number(project.totalMaterialWeight) || 0).toFixed(2)} kg
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                    {formatRupee(project.totalAmount || project.grandTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
