import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // In a production app, you'd destroy the session here
  // For demo purposes, we'll just return success
  return NextResponse.json({ success: true });
}
