import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  IndianRupee, 
  Plus, 
  Loader2,
  Calendar
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

const COLORS = ['#10b981', '#06b6d4', '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b'];

export default function Dashboard({ setActiveTab, onNewProject }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Make sure setup has run first to guarantee seed data is present
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
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-sm font-medium tracking-wide">Loading workspace dashboard...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalProjects: 0,
    todayQuotations: 0,
    totalCustomers: 0,
    estimatedRevenue: 0
  };

  const monthlyData = data?.charts?.monthlyData || [];
  const materialUsage = data?.charts?.materialUsage || [];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time statistics & business analytics</p>
        </div>
        <button
          onClick={() => {
            if (onNewProject) onNewProject();
            setActiveTab('builder');
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric Card 1 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{metrics.totalProjects}</h3>
          <p className="text-[11px] text-slate-500">Estimates drafted in database</p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Today's Quotations</span>
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{metrics.todayQuotations}</h3>
          <p className="text-[11px] text-slate-500">Quotations added today</p>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{metrics.totalCustomers}</h3>
          <p className="text-[11px] text-slate-500">Active accounts in system</p>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Estimated Revenue</span>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatRupee(metrics.estimatedRevenue)}</h3>
          <p className="text-[11px] text-slate-500">Accumulated grand total value</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Overview (Area Chart) */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-bold text-base tracking-tight">Revenue Overview</h4>
              <p className="text-slate-500 text-xs">Accumulated revenue timeline</p>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value) => [formatRupee(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Usage (Pie Chart) */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-bold text-base tracking-tight">Material Usage</h4>
              <p className="text-slate-500 text-xs">Total quantity consumed by category</p>
            </div>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            {materialUsage.length === 0 || materialUsage.every(i => i.value === 0) ? (
              <p className="text-slate-500 text-xs italic">No material data recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialUsage.filter(i => i.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {materialUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
            {materialUsage.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-[11px] text-slate-400 font-medium">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Quotations (Bar Chart) */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-bold text-base tracking-tight">Monthly Quotations</h4>
              <p className="text-slate-500 text-xs">Volume of cost estimates generated per month</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#38bdf8' }}
                  formatter={(value) => [value, 'Quotes']}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#0ea5e9' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
