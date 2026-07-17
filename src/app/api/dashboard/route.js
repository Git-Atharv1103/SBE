import { NextResponse } from 'next/server';
import { getProjects, getCustomers, getMaterials, getCategories, connectDB, getProjectMaterials } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    await connectDB();

    const projects = await getProjects();
    const customers = await getCustomers();
    const materials = await getMaterials();
    const categories = await getCategories();

    // 1. Calculate Metrics
    const totalProjects = projects.length;
    const totalCustomers = customers.length;
    const estimatedRevenue = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

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
        monthlyDataMap[key].revenue += p.totalAmount || 0;
      }
    });

    const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.sortKey - b.sortKey);

    // 3. Prepare Material Usage Data (Group by Material Category)
    const projectMaterials = await getProjectMaterials();

    // Map material ID to Category Name
    const materialIdToCatName = {};
    const catMap = {};
    categories.forEach(c => { catMap[c._id] = c.categoryName; });
    materials.forEach(m => {
      materialIdToCatName[m._id] = catMap[m.categoryId] || 'Other';
    });

    const materialUsageMap = {};
    projectMaterials.forEach((pm) => {
      const catName = materialIdToCatName[pm.materialId] || 'Other';
      materialUsageMap[catName] = (materialUsageMap[catName] || 0) + (pm.quantity || 0);
    });

    // Make default entries if empty
    if (Object.keys(materialUsageMap).length === 0) {
      categories.slice(0, 4).forEach(c => {
        materialUsageMap[c.categoryName] = 0;
      });
    }

    const materialUsage = Object.entries(materialUsageMap).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      metrics: {
        totalProjects,
        todayQuotations,
        totalCustomers,
        estimatedRevenue,
      },
      charts: {
        monthlyData, // Monthly counts and revenue
        materialUsage, // Grouped by category
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
