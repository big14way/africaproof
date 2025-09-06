import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();
    
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (fields.success) {
      // In a production app, you'd create a session here
      // For demo purposes, we'll just return success
      return NextResponse.json({ 
        success: true, 
        address: fields.data.address,
        ens: fields.data.address // You could resolve ENS here
      });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    console.error('SIWE verification error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
