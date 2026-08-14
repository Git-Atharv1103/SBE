import { NextResponse } from 'next/server';
import {
  getCategories,
  createCategory,
  getMaterials,
  createMaterial,
  getCustomers,
  createCustomer,
  getProjects,
  createProject,
} from '@/lib/db';
import { COUNTER_TYPE_TEMPLATES } from '@/lib/constants';
import { calculateEstimate, calculateTotalMaterialWeight } from '@/lib/calculations';

export async function GET() {
  try {
    // 1. Seed Categories (Stainless Steel Only)
    let categories = await getCategories();
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        'Sheet Materials',
        'Pipe Materials',
        'Purchased Items',
      ];
      for (const name of defaultCategories) {
        await createCategory({ categoryName: name });
      }
      categories = await getCategories();
    }

    const catMap = {};
    categories.forEach((c) => {
      catMap[c.categoryName] = c._id;
    });

    // 2. Seed Materials (Stainless Steel Only - SS304 & SS316)
    let materials = await getMaterials();
    // If materials contain legacy MS or are empty, reset with Stainless Steel
    const hasLegacyMs = (materials || []).some(m => (m.materialName || '').toLowerCase().includes('ms '));
    if (!materials || materials.length === 0 || hasLegacyMs) {
      const ssMaterials = [
        { materialName: 'SS304 Sheet 1.0mm', category: 'Sheet', grade: 'SS304', unit: 'kg', price: 250, description: 'Stainless Steel 304 Grade 1.0 mm Sheet', status: 'Active' },
        { materialName: 'SS304 Sheet 1.2mm', category: 'Sheet', grade: 'SS304', unit: 'kg', price: 255, description: 'Stainless Steel 304 Grade 1.2 mm Sheet', status: 'Active' },
        { materialName: 'SS304 Sheet 1.5mm', category: 'Sheet', grade: 'SS304', unit: 'kg', price: 260, description: 'Stainless Steel 304 Grade 1.5 mm Sheet', status: 'Active' },
        { materialName: 'SS304 Sheet 0.8mm', category: 'Sheet', grade: 'SS304', unit: 'kg', price: 250, description: 'Stainless Steel 304 Grade 0.8 mm Sheet', status: 'Active' },
        { materialName: 'SS316 Sheet 1.2mm', category: 'Sheet', grade: 'SS316', unit: 'kg', price: 340, description: 'Stainless Steel 316 Acid Resistant Sheet', status: 'Active' },
        { materialName: 'SS304 Square Pipe 25×25 mm', category: 'Pipe', grade: 'SS304', unit: 'kg', price: 270, description: 'SS 304 25x25mm Square Box Section', status: 'Active' },
        { materialName: 'SS304 Square Pipe 38×38 mm', category: 'Pipe', grade: 'SS304', unit: 'kg', price: 270, description: 'SS 304 38x38mm Leg Pipe Section', status: 'Active' },
        { materialName: 'SS304 Square Pipe 40×40 mm', category: 'Pipe', grade: 'SS304', unit: 'kg', price: 275, description: 'SS 304 40x40mm Heavy Leg Pipe', status: 'Active' },
        { materialName: 'SS304 Rectangular Pipe 50×25 mm', category: 'Pipe', grade: 'SS304', unit: 'kg', price: 275, description: 'SS 304 50x25mm Rectangular Framework Section', status: 'Active' },
        { materialName: 'SS304 Round Pipe Ø 38 mm', category: 'Pipe', grade: 'SS304', unit: 'kg', price: 270, description: 'SS 304 38mm Circular Pipe', status: 'Active' },
        { materialName: 'Nylon Bush (Heavy Duty)', category: 'Purchased', grade: 'SS304', unit: 'Piece', price: 25, description: 'Impact resistant leg insert bush (0.25 kg)', status: 'Active' },
        { materialName: 'SS Bullet Feet (Adjustable)', category: 'Purchased', grade: 'SS304', unit: 'Piece', price: 120, description: 'SS height adjustable bullet feet (0.40 kg)', status: 'Active' },
        { materialName: 'SS Door Handle', category: 'Purchased', grade: 'SS304', unit: 'Piece', price: 95, description: 'Sleek SS pull handle (0.30 kg)', status: 'Active' },
        { materialName: 'SS Waste Coupling', category: 'Purchased', grade: 'SS304', unit: 'Piece', price: 180, description: 'Commercial sink drain coupling (0.35 kg)', status: 'Active' }
      ];

      for (const mat of ssMaterials) {
        await createMaterial(mat);
      }
      materials = await getMaterials();
    }

    // 3. Seed Customers
    let customers = await getCustomers();
    if (!customers || customers.length === 0) {
      const mockCustomers = [
        { customerName: 'Rajesh Sharma', companyName: 'Royal Hospitality Group', counterType: 'Stainless Steel Kitchen', phone: '+91 98765 43210', address: 'Plot 45, Phase II, Industrial Area, Mumbai', email: 'procurement@royalhospitality.in' },
        { customerName: 'Anil Kumar', companyName: 'Spice Route Cloud Kitchens', counterType: 'Sink Unit', phone: '+91 91234 56789', address: '12 Electronic City, Bangalore, Karnataka', email: 'operations@spiceroute.com' },
        { customerName: 'Vikram Singh', companyName: 'Urban Diner Eateries', counterType: 'Gas Range', phone: '+91 99887 76655', address: 'SCO 23, Sector 18, Gurgaon, Haryana', email: 'vikram@urbandiner.co' },
      ];
      for (const cust of mockCustomers) {
        await createCustomer(cust);
      }
      customers = await getCustomers();
    }

    // 4. Seed Standard Estimations
    let projects = await getProjects();
    if (!projects || projects.length === 0 || hasLegacyMs) {
      const c1 = customers[0] || {};
      const c2 = customers[1] || {};

      // Estimate 1: Commercial Stainless Steel Kitchen
      const template1 = COUNTER_TYPE_TEMPLATES['Stainless Steel Kitchen'];
      const est1 = calculateEstimate({
        materials: template1,
        materialRate: 250,
        labourCost: 2500,
        discount: 500,
        gst: 18
      });

      await createProject({
        estimateNumber: 'EST-100201',
        projectName: 'Commercial Kitchen Station',
        customerId: c1._id || '',
        customerName: c1.customerName || 'Rajesh Sharma',
        companyName: c1.companyName || 'Royal Hospitality Group',
        phone: c1.phone || '+91 98765 43210',
        email: c1.email || 'procurement@royalhospitality.in',
        address: c1.address || 'Plot 45, Phase II, Industrial Area, Mumbai',
        counterType: 'Stainless Steel Kitchen',
        date: new Date().toISOString(),
        remarks: 'Heavy duty SS304 kitchen counter with splash back and leg bracings.',
        sheets: template1.sheets,
        pipes: template1.pipes,
        purchased: template1.purchased,
        materialRate: 250,
        labourCost: 2500,
        discount: 500,
        gst: 18,
        totalMaterialWeight: est1.totalWeight,
        materialCost: est1.materialCost,
        subtotal: est1.subtotal,
        taxableAmount: est1.taxableAmount,
        gstAmount: est1.gstAmount,
        totalAmount: est1.grandTotal,
      });

      // Estimate 2: Commercial Sink Unit
      const template2 = COUNTER_TYPE_TEMPLATES['Sink Unit'];
      const est2 = calculateEstimate({
        materials: template2,
        materialRate: 260,
        labourCost: 1800,
        discount: 0,
        gst: 18
      });

      const date2 = new Date();
      date2.setDate(date2.getDate() - 5);

      await createProject({
        estimateNumber: 'EST-100202',
        projectName: 'Commercial Double Sink Unit',
        customerId: c2._id || '',
        customerName: c2.customerName || 'Anil Kumar',
        companyName: c2.companyName || 'Spice Route Cloud Kitchens',
        phone: c2.phone || '+91 91234 56789',
        email: c2.email || 'operations@spiceroute.com',
        address: c2.address || '12 Electronic City, Bangalore, Karnataka',
        counterType: 'Sink Unit',
        date: date2.toISOString(),
        remarks: 'SS304 heavy sink unit with bottom shelf and waste coupling.',
        sheets: template2.sheets,
        pipes: template2.pipes,
        purchased: template2.purchased,
        materialRate: 260,
        labourCost: 1800,
        discount: 0,
        gst: 18,
        totalMaterialWeight: est2.totalWeight,
        materialCost: est2.materialCost,
        subtotal: est2.subtotal,
        taxableAmount: est2.taxableAmount,
        gstAmount: est2.gstAmount,
        totalAmount: est2.grandTotal,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Shree Balaji Enterprises database seeded successfully.',
    });
  } catch (error) {
    console.error('Setup seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
