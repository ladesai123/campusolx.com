// Next.js API route to test OneSignal notification delivery
import { NextRequest, NextResponse } from 'next/server';
import { sendOneSignalNotification } from '@/lib/sendOneSignalNotification';

export async function POST(req: NextRequest) {
  const { userId, title, message } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const result = await sendOneSignalNotification({
    userId,
    title: title || 'Test Notification',
    message: message || 'This is a test push notification from CampusOlx!',
  });
  return NextResponse.json({ success: true, result });
}
