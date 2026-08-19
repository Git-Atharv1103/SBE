import { NextResponse } from 'next/server';
import {
  getCategories,
  createCategory,
  getCounterTypes,
  createCounterType,
  getMaterials,
  createMaterial,
} from '@/lib/db';
import { COUNTER_TYPES, DEFAULT_MASTER_PRODUCTS } from '@/lib/constants';
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

    // Database master categories, counter types, and materials are prepared.
    // No mock projects or mock customers are seeded. Fresh starts with 0 projects.
    return NextResponse.json({
      success: true,
      message: 'Shree Balaji Enterprises master catalog initialized successfully.',
      materialsCount: (materials || []).length,
      counterTypesCount: (counterTypes || []).length
    });
  } catch (error) {
    console.error('Setup seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const action = body.action;
    const JSON_DB_PATH = path.join(process.cwd(), 'data', 'db.json');

    if (action === 'clean_projects_and_reset') {
      if (fs.existsSync(JSON_DB_PATH)) {
        const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
        const db = JSON.parse(raw);
        db.projects = [];
        db.customers = [];
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2));
      }
      return NextResponse.json({ success: true, message: 'All projects and customers cleared. Ready for EST 01.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
