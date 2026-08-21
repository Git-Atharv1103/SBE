import { NextResponse } from 'next/server';
import { getDatabaseDiagnostics, connectDB, isMongoActive, getModels, readJsonDb } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const diagnostics = await getDatabaseDiagnostics();
    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error('Error checking DB status:', error);
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action;

    await connectDB();

    if (action === 'migrate_to_mongo') {
      if (!isMongoActive()) {
        return NextResponse.json(
          {
            success: false,
            error: 'MongoDB is not currently connected. Please ensure MONGODB_URI is valid and server is running.',
          },
          { status: 400 }
        );
      }

      const { Category, CounterType, Material, Customer, Project } = getModels();
      const db = readJsonDb();

      let migratedCategories = 0;
      let migratedCounterTypes = 0;
      let migratedMaterials = 0;
      let migratedProjects = 0;
      let migratedCustomers = 0;

      // 1. Migrate Categories
      if (Array.isArray(db.categories)) {
        for (const cat of db.categories) {
          if (cat.categoryName) {
            await Category.findOneAndUpdate(
              { categoryName: cat.categoryName.trim() },
              { $set: { categoryName: cat.categoryName.trim() } },
              { upsert: true }
            );
            migratedCategories++;
          }
        }
      }

      // 2. Migrate Counter Types
      if (Array.isArray(db.counterTypes)) {
        for (const ct of db.counterTypes) {
          if (ct.name) {
            await CounterType.findOneAndUpdate(
              { name: ct.name.trim() },
              {
                $set: {
                  name: ct.name.trim(),
                  description: ct.description || '',
                  category: ct.category || 'Kitchen Equipment',
                  order: Number(ct.order || 0),
                  status: ct.status || 'Active',
                },
              },
              { upsert: true }
            );
            migratedCounterTypes++;
          }
        }
      }

      // 3. Migrate Materials
      if (Array.isArray(db.materials)) {
        for (const mat of db.materials) {
          if (mat.materialName) {
            const cleanMat = { ...mat };
            delete cleanMat._id;
            await Material.findOneAndUpdate(
              { materialName: mat.materialName, category: mat.category },
              { $set: cleanMat },
              { upsert: true }
            );
            migratedMaterials++;
          }
        }
      }

      // 4. Migrate Projects
      if (Array.isArray(db.projects)) {
        for (const proj of db.projects) {
          if (proj.projectName || proj.estimateNumber) {
            const cleanProj = { ...proj };
            delete cleanProj._id;
            await Project.findOneAndUpdate(
              { estimateNumber: proj.estimateNumber || `EST-${Date.now()}` },
              { $set: cleanProj },
              { upsert: true }
            );
            migratedProjects++;
          }
        }
      }

      // 5. Migrate Customers
      if (Array.isArray(db.customers)) {
        for (const cust of db.customers) {
          if (cust.customerName) {
            const cleanCust = { ...cust };
            delete cleanCust._id;
            await Customer.findOneAndUpdate(
              { customerName: cust.customerName, phone: cust.phone || '' },
              { $set: cleanCust },
              { upsert: true }
            );
            migratedCustomers++;
          }
        }
      }

      const diagnostics = await getDatabaseDiagnostics();

      return NextResponse.json({
        success: true,
        message: 'Data successfully migrated to MongoDB.',
        migrated: {
          categories: migratedCategories,
          counterTypes: migratedCounterTypes,
          materials: migratedMaterials,
          projects: migratedProjects,
          customers: migratedCustomers,
        },
        diagnostics,
      });
    }

    // Default: Return current diagnostics
    const diagnostics = await getDatabaseDiagnostics();
    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error('Error handling DB status action:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
