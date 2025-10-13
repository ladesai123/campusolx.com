// Server-side utility to send a OneSignal notification to a user by tag (user_id)
import fetch from 'node-fetch';

export async function sendOneSignalNotification({ userId, title, message, connectionId }: { userId: string, title: string, message: string, connectionId?: number }) {
  console.log('🚀 ONESIGNAL: Attempting to send notification:', { userId, title, message, connectionId });
  
  try {
    const payload = {
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      url: process.env.NEXT_PUBLIC_BASE_URL && connectionId !== undefined
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/chat/${connectionId}`
        : process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/chat`
          : undefined,
      filters: [
        { field: 'tag', key: 'user_id', relation: '=', value: userId }
      ],
    };
    
    console.log('🚀 ONESIGNAL: Payload:', JSON.stringify(payload, null, 2));
    
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    
    console.log('🚀 ONESIGNAL: Response status:', res.status);
    
    if (!res.ok) {
      const error = await res.text();
      console.error('🚀 ONESIGNAL: API Error:', error);
      throw new Error(`OneSignal API error: ${error}`);
    }
    
    const result = await res.json();
    console.log('🚀 ONESIGNAL: Success result:', result);
    return result;
  } catch (err) {
    console.error('🚀 ONESIGNAL: Notification failed:', err);
    return null;
  }
}