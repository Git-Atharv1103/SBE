import { NextResponse } from 'next/server';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/db';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.customerName || !data.phone || !data.address) {
      return NextResponse.json({ error: 'Customer Name, Phone and Address are required' }, { status: 400 });
    }
    const newCustomer = await createCustomer(data);
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const id = data._id;
    if (!id) {
      return NextResponse.json({ error: 'Customer ID (_id) is required' }, { status: 400 });
    }
    
    const updateData = { ...data };
    delete updateData._id;
    
    const updated = await updateCustomer(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }
    const deleted = await deleteCustomer(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
