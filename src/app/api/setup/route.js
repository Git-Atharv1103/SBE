import { NextResponse } from 'next/server';
import {
  getCategories,
  createCategory,
  getCounterTypes,
  createCounterType,
  getMaterials,
  createMaterial,
  getCustomers,
  createCustomer,
  getProjects,
  createProject,
} from '@/lib/db';
import { COUNTER_TYPES, COUNTER_TYPES_CONFIG, DEFAULT_MASTER_PRODUCTS, COUNTER_TYPE_TEMPLATES } from '@/lib/constants';
import { calculateEstimate } from '@/lib/calculations';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const JSON_DB_PATH = path.join(process.cwd(), 'data', 'db.json');

    // 1. Seed Categories
    let categories = await getCategories();
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        'Sheet Materials',
        'Pipe Materials',
        'Angle Materials',
        'Purchased Items',
        'Compressor / Special Components'
      ];
      for (const name of defaultCategories) {
        await createCategory({ categoryName: name });
      }
      categories = await getCategories();
    }

    // 2. Seed Counter Types Master Table
    let counterTypes = await getCounterTypes();
    const counterTypeDescriptions = {
      'SS Dish Rack': 'Commercial Clean Dish & Plate Tier Storage Rack',
      'Dish Rack': 'Slotted SS Clean Dish Storage Rack',
      'Pot Rack': 'Commercial Heavy Vessel, Pot & Pan Storage Framework',
      'Dining Table': 'Heavy Duty Canteen & Restaurant Dining Table with Stool Arms',
      'Bench': 'SS Commercial Dining & Waiting Bench with Ergonomic Back Support',
      'Storage Bin': 'Multi-compartment Onion, Potato & Grain Ventilated Storage Bins',
      'Counter': 'Multi-tier Food Service, Bain Marie, Display & Work Counter',
      'Counters': 'Multi-tier Display, Bain Marie & Storage Showcase',
      'Trolley': 'Heavy Commercial Material Handling & Kitchen Service Trolley',
      'Fridge': 'Commercial Vertical & Horizontal Refrigeration Cabinets',
      'Table': 'Commercial Heavy Duty Work & Prep Table',
      'Sink Unit': 'Single / Double Sink Washing Station',
      'Sink Unit with Table': 'Integrated Sink & Preparation Worktable',
      'Soiled Dish Table': 'Scraping, Pre-wash & Dish Receiving Station',
      'Gas Range': 'Commercial Burner Gas Cooking Range',
      'Dosa Bhatti': 'Heavy Duty Commercial Griddle & Bhatti',
      'SS Tandoor': 'Insulated Stainless Steel Charcoal / Gas Tandoor',
      'Shawarma Cabin': 'Commercial Shawarma Rotisserie & Cabin Unit',
      'Chapati Puffer Plate': 'Puffer Hotplate Roti / Chapati Station'
    };

    if (!counterTypes || counterTypes.length < COUNTER_TYPES.length) {
      const existingNames = new Set((counterTypes || []).map(ct => ct.name));
      for (let i = 0; i < COUNTER_TYPES.length; i++) {
        const ctName = COUNTER_TYPES[i];
        if (!existingNames.has(ctName)) {
          await createCounterType({
            name: ctName,
            description: counterTypeDescriptions[ctName] || 'Commercial Stainless Steel Equipment',
            category: 'Kitchen Equipment',
            order: i + 1,
            status: 'Active'
          });
        }
      }
      counterTypes = await getCounterTypes();
    }

    // 3. Clean & Seed Material Master
    let materials = await getMaterials();
    const needsRefresh = !materials || materials.length < DEFAULT_MASTER_PRODUCTS.length ||
      materials.some(m => !m.counterTypes || m.counterTypes.length === 0 || (m.counterTypes.includes('Fridge') && !m.gaugeOptions && m.category === 'Sheet'));

    if (needsRefresh) {
      if (fs.existsSync(JSON_DB_PATH)) {
        const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
        const db = JSON.parse(raw);
        db.materials = DEFAULT_MASTER_PRODUCTS.map((prod, idx) => ({
          _id: `mat_${Date.now().toString(36)}_${idx}`,
          ...prod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2));
      } else {
        for (const prod of DEFAULT_MASTER_PRODUCTS) {
          await createMaterial(prod);
        }
      }
      materials = await getMaterials();
    }

    // 4. Seed Customers
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

    // 5. Seed Standard Estimations if empty
    let projects = await getProjects();
    if (!projects || projects.length === 0) {
      const c1 = customers[0] || {};
      const template1 = getFallbackCounterTemplate('Table');
      const est1 = calculateEstimate({
        materials: template1,
        materialRate: 250,
        labourCost: 2500,
        discount: 500,
        gst: 18
      });

      await createProject({
        estimateNumber: 'EST-100201',
        projectName: 'Commercial Kitchen Work Table',
        customerId: c1._id || '',
        customerName: c1.customerName || 'Rajesh Sharma',
        companyName: c1.companyName || 'Royal Hospitality Group',
        phone: c1.phone || '+91 98765 43210',
        email: c1.email || 'procurement@royalhospitality.in',
        address: c1.address || 'Plot 45, Phase II, Industrial Area, Mumbai',
        counterType: 'Table',
        date: new Date().toISOString(),
        remarks: 'Heavy duty SS304 kitchen work table with under shelf and leg bracings.',
        sheets: template1.sheets,
        pipes: template1.pipes,
        purchased: template1.purchased,
        materialRate: 250,
        labourCost: 2500,
        discount: 500,
        gst: 18,
        totalMaterialWeight: est1.totalWeight,
        materialCost: est1.materialCost,
        purchasedItemCost: est1.purchasedItemCost,
        discountedMaterialCost: est1.discountedMaterialCost,
        taxableAmount: est1.taxableAmount,
        gstAmount: est1.gstAmount,
        totalAmount: est1.grandTotal,
        grandTotal: est1.grandTotal
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Shree Balaji Enterprises database seeded successfully.',
      materialsCount: (materials || []).length,
      counterTypesCount: (counterTypes || []).length
    });
  } catch (error) {
    console.error('Setup seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
