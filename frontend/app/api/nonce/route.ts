import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from 'siwe';

export async function GET(request: NextRequest) {
  const nonce = generateNonce();
  
  // In a production app, you'd store this nonce in a session or database
  // For demo purposes, we'll just return it
  return new NextResponse(nonce, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
