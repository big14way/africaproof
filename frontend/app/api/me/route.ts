import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // In a production app, you'd check the session here
  // For demo purposes, we'll return unauthenticated
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
