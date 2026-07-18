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

export async function GET() {
  try {
    // 1. Seed Categories
    let categories = await getCategories();
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        'Pipes',
        'Angles',
        'Channels',
        'Plates',
        'Round Bar',
        'Flat Bar',
        'Fasteners',
        'Paint',
        'Hardware',
        'Other',
      ];
      for (const name of defaultCategories) {
        await createCategory({ categoryName: name });
      }
      categories = await getCategories();
    }

    // Map categories for easier lookup
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.categoryName] = c._id;
    });

    // 2. Seed Materials
    let materials = await getMaterials();
    if (!materials || materials.length === 0) {
      const mockMaterials = [
        { materialName: 'MS Pipe 25x25', categoryId: catMap['Pipes'] || 'pipes', unit: 'Kg', price: 82, description: 'Mild Steel Square Pipe 25x25mm', status: 'Active' },
        { materialName: 'MS Pipe 40x40', categoryId: catMap['Pipes'] || 'pipes', unit: 'Kg', price: 94, description: 'Mild Steel Square Pipe 40x40mm', status: 'Active' },
        { materialName: 'MS Plate 5mm', categoryId: catMap['Plates'] || 'plates', unit: 'Sheet', price: 2800, description: 'Mild Steel Plate 5mm Thickness', status: 'Active' },
        { materialName: 'MS Angle', categoryId: catMap['Angles'] || 'angles', unit: 'Kg', price: 76, description: 'Mild Steel Angle Section', status: 'Active' },
        { materialName: 'GI Pipe', categoryId: catMap['Pipes'] || 'pipes', unit: 'Kg', price: 110, description: 'Galvanized Iron Pipe', status: 'Active' },
        { materialName: 'Stainless Steel Bolt M10', categoryId: catMap['Fasteners'] || 'fasteners', unit: 'Piece', price: 15, description: 'SS Bolt M10 x 50mm', status: 'Active' },
        { materialName: 'Red Oxide Primer', categoryId: catMap['Paint'] || 'paint', unit: 'Meter', price: 180, description: 'Anti-rust primer paint per liter/meter area', status: 'Active' },
        { materialName: 'Welding Rods', categoryId: catMap['Hardware'] || 'hardware', unit: 'Piece', price: 8, description: 'Welding electrode', status: 'Active' },
      ];
      for (const mat of mockMaterials) {
        await createMaterial(mat);
      }
      materials = await getMaterials();
    }

    // 3. Seed Customers
    let customers = await getCustomers();
    if (!customers || customers.length === 0) {
      const mockCustomers = [
        { customerName: 'ABC Fabrication & Erectors', counterType: 'Commercial Kitchen', phone: '9876543210', address: '123 Industrial Area, Phase 1, Mumbai', email: 'contact@abcfab.com' },
        { customerName: 'Apex Engineering Ltd', counterType: 'Fast Food Counter', phone: '9123456789', address: '45 Technology Park, Pune, Maharashtra', email: 'procurement@apexeng.co' },
        { customerName: 'Sai Steel Works', counterType: 'Bar Equipment', phone: '9988776655', address: 'Shop No. 12, Market Road, Bangalore', email: 'saisteelworks@gmail.com' },
      ];
      for (const cust of mockCustomers) {
        await createCustomer(cust);
      }
      customers = await getCustomers();
    }

    // 4. Seed Projects
    let projects = await getProjects();
    if (!projects || projects.length === 0) {
      const c1 = customers[0]._id;
      const c2 = customers[1]._id;
      const c3 = customers[2]._id;

      const mPipe = materials.find((m) => m.materialName === 'MS Pipe 40x40') || materials[0];
      const mPlate = materials.find((m) => m.materialName === 'MS Plate 5mm') || materials[0];
      const mAngle = materials.find((m) => m.materialName === 'MS Angle') || materials[0];
      const mSSBolt = materials.find((m) => m.materialName === 'Stainless Steel Bolt M10') || materials[0];
      const mPaint = materials.find((m) => m.materialName === 'Red Oxide Primer') || materials[0];

      // Project 1 (User Example)
      const date1 = new Date();
      const mats1 = [
        { materialId: mPipe._id, quantity: 35, unitPrice: mPipe.price, total: 35 * mPipe.price }, // 3290
        { materialId: mPlate._id, quantity: 10, unitPrice: mPlate.price, total: 10 * mPlate.price }, // 28000
        { materialId: mAngle._id, quantity: 15, unitPrice: mAngle.price, total: 15 * mAngle.price }, // 1140
      ];
      const matTotal1 = mats1.reduce((s, i) => s + i.total, 0); // 32430
      const labour1 = 5000;
      const transport1 = 1200;
      const discount1 = 1000;
      const gstPercent1 = 18;
      // Taxable: 32430 + 5000 + 1200 - 1000 = 37630
      // 18% GST: 37630 * 0.18 = 6773.4 (we'll use 7617 as in the exact user Grand Total mock, or calculate it)
      // To match the user's exactly: Grand Total 45247, GST 7617
      // 32430 + 5000 + 1200 - 1000 + 7617 = 45247
      const gstAmount1 = 7617;
      const grandTotal1 = 45247;

      await createProject({
        projectName: 'Shed Extension Structure',
        customerId: c1,
        date: date1.toISOString(),
        remarks: 'Heavy structural fabrication for industrial warehouse.',
        labourCost: labour1,
        transportCost: transport1,
        discount: discount1,
        gst: gstPercent1, // Stored as percentage, calculation handles the amount
        totalAmount: grandTotal1,
      }, mats1);

      // Project 2 (Last Month)
      const date2 = new Date();
      date2.setMonth(date2.getMonth() - 1);
      const mats2 = [
        { materialId: mPipe._id, quantity: 20, unitPrice: mPipe.price, total: 20 * mPipe.price }, // 1880
        { materialId: mAngle._id, quantity: 40, unitPrice: mAngle.price, total: 40 * mAngle.price }, // 3040
        { materialId: mSSBolt._id, quantity: 100, unitPrice: mSSBolt.price, total: 100 * mSSBolt.price }, // 1500
      ];
      const matTotal2 = mats2.reduce((s, i) => s + i.total, 0); // 6420
      const labour2 = 3000;
      const transport2 = 500;
      const discount2 = 200;
      const gstPercent2 = 18;
      const taxable2 = matTotal2 + labour2 + transport2 - discount2; // 6420+3000+500-200 = 9720
      const gstAmount2 = Math.round(taxable2 * (gstPercent2 / 100)); // 1750
      const grandTotal2 = taxable2 + gstAmount2; // 11470

      await createProject({
        projectName: 'Main Entrance Gate',
        customerId: c2,
        date: date2.toISOString(),
        remarks: 'Ornate design gate with high-grade fasteners.',
        labourCost: labour2,
        transportCost: transport2,
        discount: discount2,
        gst: gstPercent2,
        totalAmount: grandTotal2,
      }, mats2);

      // Project 3 (2 months ago)
      const date3 = new Date();
      date3.setMonth(date3.getMonth() - 2);
      const mats3 = [
        { materialId: mPlate._id, quantity: 2, unitPrice: mPlate.price, total: 2 * mPlate.price }, // 5600
        { materialId: mPaint._id, quantity: 15, unitPrice: mPaint.price, total: 15 * mPaint.price }, // 2700
      ];
      const matTotal3 = mats3.reduce((s, i) => s + i.total, 0); // 8300
      const labour3 = 2000;
      const transport3 = 400;
      const discount3 = 0;
      const gstPercent3 = 18;
      const taxable3 = matTotal3 + labour3 + transport3; // 10700
      const gstAmount3 = Math.round(taxable3 * (gstPercent3 / 100)); // 1926
      const grandTotal3 = taxable3 + gstAmount3; // 12626

      await createProject({
        projectName: 'Safety Handrails',
        customerId: c3,
        date: date3.toISOString(),
        remarks: 'Safety barriers for production line floor.',
        labourCost: labour3,
        transportCost: transport3,
        discount: discount3,
        gst: gstPercent3,
        totalAmount: grandTotal3,
      }, mats3);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully.',
    });
  } catch (error) {
    console.error('Setup seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
