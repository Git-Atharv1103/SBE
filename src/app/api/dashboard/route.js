import { NextResponse } from 'next/server';
import { getProjects, getCustomers, getMaterials, getCategories, connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();

    const projects = await getProjects();
    const customers = await getCustomers();
    const materials = await getMaterials();
    const categories = await getCategories();

    // 1. Calculate Core Metrics
    const totalProjects = projects.length;
    const totalCustomers = customers.length;
    const totalMaterialWeight = projects.reduce((sum, p) => sum + (Number(p.totalMaterialWeight) || 0), 0);
    const estimatedRevenue = projects.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

    // Calculate Today's Quotations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQuotations = projects.filter((p) => {
      const pDate = new Date(p.date);
      return pDate >= today;
    }).length;

    // 2. Prepare Time-Series Data (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const key = `${monthName} ${year}`;
      monthlyDataMap[key] = { month: key, count: 0, revenue: 0, sortKey: d.getTime() };
    }

    // Populate monthly counts and revenue
    projects.forEach((p) => {
      const pDate = new Date(p.date);
      const mName = months[pDate.getMonth()];
      const year = pDate.getFullYear();
      const key = `${mName} ${year}`;
      
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].count += 1;
        monthlyDataMap[key].revenue += Number(p.totalAmount) || 0;
      }
    });

    const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.sortKey - b.sortKey);

    // 3. Prepare Material Usage Data (Grouped by Category: Sheet vs Pipe vs Purchased)
    let sheetCount = 0;
    let pipeCount = 0;
    let purchasedCount = 0;

    projects.forEach((p) => {
      sheetCount += (p.sheets || []).reduce((s, row) => s + (Number(row.quantity) || 0), 0);
      pipeCount += (p.pipes || []).reduce((s, row) => s + (Number(row.quantity) || 0), 0);
      purchasedCount += (p.purchased || []).reduce((s, row) => s + (Number(row.quantity) || 0), 0);
    });

    const materialUsage = [
      { name: 'Sheet Materials', value: sheetCount },
      { name: 'Pipe Materials', value: pipeCount },
      { name: 'Purchased Items', value: purchasedCount }
    ];

    return NextResponse.json({
      metrics: {
        totalProjects,
        totalEstimates: totalProjects,
        totalMaterialWeight: Number(totalMaterialWeight.toFixed(2)),
        todayQuotations,
        totalCustomers,
        estimatedRevenue,
      },
      charts: {
        monthlyData,
        materialUsage,
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
