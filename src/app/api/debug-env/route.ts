// Diagnostic API to check OneSignal environment variables in production
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Only allow this in development or with a secret key
  const secret = req.nextUrl.searchParams.get('secret');
  if (process.env.NODE_ENV === 'production' && secret !== 'debug123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'NOT_SET',
    onesignalAppId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ? 'SET' : 'NOT_SET',
    onesignalRestKey: process.env.ONESIGNAL_REST_API_KEY ? 'SET' : 'NOT_SET',
    timestamp: new Date().toISOString()
  });
}