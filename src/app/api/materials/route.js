import { NextResponse } from 'next/server';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const counterType = searchParams.get('counterType');
    const category = searchParams.get('category');

    const filter = {};
    if (counterType) filter.counterType = counterType;
    if (category) filter.category = category;

    const materials = await getMaterials(filter);
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.materialName || !data.category) {
      return NextResponse.json({ error: 'Material Name and Category are required' }, { status: 400 });
    }
    const newMaterial = await createMaterial(data);
    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const id = data.id || data._id;
    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }
    
    // Create copy without _id / id for update
    const updateData = { ...data };
    delete updateData._id;
    delete updateData.id;
    
    const updated = await updateMaterial(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }
    const deleted = await deleteMaterial(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
