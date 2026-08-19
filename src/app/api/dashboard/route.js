import { NextResponse } from 'next/server';
import { getProjects, connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();

    const projects = await getProjects();

    // 1. Calculate Core Metrics from live saved estimates
    const totalProjects = projects.length;
    const totalEstimates = totalProjects;
    
    // Count unique clients across actual saved projects
    const uniqueClients = new Set(
      projects
        .map(p => (p.customerName || '').trim().toLowerCase())
        .filter(Boolean)
    );
    const totalCustomers = uniqueClients.size;
    
    const totalMaterialWeight = projects.reduce((sum, p) => sum + (Number(p.totalMaterialWeight) || 0), 0);
    const estimatedRevenue = projects.reduce((sum, p) => sum + (Number(p.totalAmount || p.grandTotal) || 0), 0);

    // Calculate Today's Quotations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQuotations = projects.filter((p) => {
      const pDate = new Date(p.date || p.createdAt || Date.now());
      return pDate >= today;
    }).length;

    // 2. Prepare Estimation Value Trend (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const key = `${monthName} ${year}`;
      const shortKey = monthName;
      monthlyDataMap[key] = {
        month: shortKey,
        fullMonth: key,
        count: 0,
        value: 0,
        revenue: 0,
        sortKey: new Date(year, d.getMonth(), 1).getTime()
      };
    }

    // Populate monthly counts and revenue
    projects.forEach((p) => {
      const pDate = new Date(p.date || p.createdAt || Date.now());
      const mName = months[pDate.getMonth()];
      const year = pDate.getFullYear();
      const key = `${mName} ${year}`;
      
      const rev = Number(p.totalAmount || p.grandTotal) || 0;
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].count += 1;
        monthlyDataMap[key].value += rev;
        monthlyDataMap[key].revenue += rev;
      } else {
        // Project falls outside default 6-month window; add it
        monthlyDataMap[key] = {
          month: mName,
          fullMonth: key,
          count: 1,
          value: rev,
          revenue: rev,
          sortKey: new Date(year, pDate.getMonth(), 1).getTime()
        };
      }
    });

    const revenueTimeline = Object.values(monthlyDataMap).sort((a, b) => a.sortKey - b.sortKey);

    // 3. Counter Distribution (Grouped by actual Counter Type from saved estimates)
    const counterMap = {};
    projects.forEach((p) => {
      const ct = (p.counterType || 'Other').trim();
      if (ct) {
        counterMap[ct] = (counterMap[ct] || 0) + 1;
      }
    });

    const categoryDistribution = Object.entries(counterMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const metrics = {
      totalProjects,
      totalEstimates,
      totalMaterialWeight: Number(totalMaterialWeight.toFixed(2)),
      todayQuotations,
      totalCustomers,
      estimatedRevenue,
    };

    return NextResponse.json({
      metrics,
      revenueTimeline,
      categoryDistribution,
      recentProjects: projects.slice(0, 5),
      charts: {
        monthlyData: revenueTimeline,
        categoryDistribution,
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
