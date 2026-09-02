import { NextResponse } from 'next/server';
import { resetTestData } from '@/lib/db';

export async function POST(request) {
  try {
    let testerId = request.headers.get('x-tester-id') || '';
    try {
      const body = await request.json();
      if (body?.testerId) testerId = body.testerId;
    } catch {
      // JSON body is optional
    }

    const result = await resetTestData(testerId);
    return NextResponse.json({
      success: true,
      message: 'Test estimations and client data reset successfully. Master materials preserved.',
      result
    });
  } catch (error) {
    console.error('Reset Test Data Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
