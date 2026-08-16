import { NextResponse } from 'next/server';
import { 
  getCounterTypes, 
  createCounterType, 
  updateCounterType, 
  deleteCounterType,
  getMaterials,
  assignMaterialsToCounterType
} from '@/lib/db';

export async function GET() {
  try {
    const [counterTypes, materials] = await Promise.all([
      getCounterTypes(),
      getMaterials()
    ]);

    // Augment each counter type with assigned materials breakdown
    const enriched = counterTypes.map(ct => {
      const assigned = materials.filter(m => 
        Array.isArray(m.counterTypes) && m.counterTypes.includes(ct.name)
      );

      const sheets = assigned.filter(m => (m.category || '').toLowerCase() === 'sheet');
      const pipes = assigned.filter(m => (m.category || '').toLowerCase() === 'pipe');
      const purchased = assigned.filter(m => (m.category || '').toLowerCase() === 'purchased');

      return {
        ...ct,
        sheets,
        pipes,
        purchased,
        sheetCount: sheets.length,
        pipeCount: pipes.length,
        purchasedCount: purchased.length,
        totalComponents: assigned.length
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Counter Type Name is required' }, { status: 400 });
    }

    const created = await createCounterType(data);

    // If initial materialIds were selected, assign them
    if (Array.isArray(data.materialIds) && data.materialIds.length > 0) {
      await assignMaterialsToCounterType(created.name, data.materialIds, []);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const id = data.id || data._id;
    if (!id) {
      return NextResponse.json({ error: 'Counter Type ID is required' }, { status: 400 });
    }

    const updateData = { ...data };
    delete updateData._id;
    delete updateData.id;

    // Handle material assignments if requested
    if (Array.isArray(data.materialIdsToAdd) || Array.isArray(data.materialIdsToRemove)) {
      const targetName = data.name || data.originalName;
      if (targetName) {
        await assignMaterialsToCounterType(
          targetName, 
          data.materialIdsToAdd || [], 
          data.materialIdsToRemove || []
        );
      }
    }

    const updated = await updateCounterType(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Counter Type not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Counter Type ID is required' }, { status: 400 });
    }

    const result = await deleteCounterType(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
