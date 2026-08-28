import { NextResponse } from 'next/server';
import {
  getCategories,
  createCategory,
  getCounterTypes,
  createCounterType,
  getMaterials,
  createMaterial,
  connectDB,
  isMongoActive,
  getModels,
  readJsonDb,
  writeJsonDb
} from '@/lib/db';
import { COUNTER_TYPES, DEFAULT_MASTER_PRODUCTS } from '@/lib/constants';

export async function GET() {
  try {
    const useMongo = await connectDB();
    const { Category, CounterType, Material } = getModels();

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
      'Working Table': 'Commercial Heavy Duty Work & Prep Table with Storage',
      'Table': 'Commercial Heavy Duty Work & Prep Table',
      'Sink Unit': 'Single / Double Sink Washing Station with Depth Control',
      'Sink Unit with Table': 'Integrated Sink & Preparation Worktable with Depth Control',
      'Storage': 'Multi-compartment Onion/Potato & Grain Ventilated Storage Bins',
      'Storage Bin': 'Multi-compartment Onion/Potato & Grain Ventilated Storage Bins',
      'SS Dish Rack': 'Commercial Clean Dish & Plate Tier Storage Rack',
      'Dish Rack': 'Slotted SS Clean Dish Storage Rack',
      'Pot Rack': 'Commercial Heavy Vessel, Pot & Pan Storage Framework',
      'Dining Table': 'Heavy Duty Canteen & Restaurant Dining Table with Stool Arms',
      'Bench': 'SS Commercial Dining & Waiting Bench with Ergonomic Back Support',
      'Trolley': 'Heavy Commercial Material Handling & Kitchen Service Trolley',
      'Fridge': 'Commercial Vertical, Pizza Makeline & Work Top Refrigeration Cabinets',
      'Soiled Dish Table': 'Scraping, Pre-wash & Dish Receiving Station',
      'Gas Range': 'Commercial Burner Gas Cooking Range with Structural Angle Base',
      'Dosa Bhatti': 'Heavy Duty Commercial Griddle & Bhatti with MS Plate',
      'SS Tandoor': 'Insulated Stainless Steel Charcoal / Gas Tandoor',
      'Bain Marie': 'Commercial Hot Bain Marie Food Warming Counter with Pan Railing',
      'GN Pan / Round Pot / Vessel': 'Food Service Display & Multi-pot Bain Counter',
      'Tea Counter': 'Commercial Tea Service Counter with 3-Side Covering & Drawers',
      'Chapati Plate': 'Puffer Hotplate & Griddle Roti / Chapati Station',
      'Shawarma Cabin': 'Commercial Shawarma Rotisserie & Cabin Unit'
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
      if (useMongo && isMongoActive()) {
        // Seed directly into MongoDB collections
        for (const prod of DEFAULT_MASTER_PRODUCTS) {
          await Material.findOneAndUpdate(
            { materialName: prod.materialName, category: prod.category },
            { $set: { ...prod, updatedAt: new Date().toISOString() } },
            { upsert: true, new: true }
          );
        }
      } else {
        // Seed into local JSON DB
        const db = readJsonDb();
        db.materials = DEFAULT_MASTER_PRODUCTS.map((prod, idx) => ({
          _id: `mat_${Date.now().toString(36)}_${idx}`,
          ...prod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        writeJsonDb(db);
      }
      materials = await getMaterials();
    }

    return NextResponse.json({
      success: true,
      mode: useMongo ? 'mongodb' : 'json_fallback',
      message: 'Shree Balaji Enterprises master catalog initialized successfully.',
      materialsCount: (materials || []).length,
      counterTypesCount: (counterTypes || []).length,
      categoriesCount: (categories || []).length
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

    await connectDB();
    const { Project, Customer } = getModels();

    if (action === 'clean_projects_and_reset') {
      if (isMongoActive()) {
        await Project.deleteMany({});
        await Customer.deleteMany({});
      }

      const db = readJsonDb();
      db.projects = [];
      db.customers = [];
      writeJsonDb(db);

      return NextResponse.json({
        success: true,
        message: 'All projects and customers cleared. Ready for EST 01.'
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
