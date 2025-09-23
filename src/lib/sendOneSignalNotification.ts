// Server-side utility to send a OneSignal notification to a user by tag (user_id)
import fetch from 'node-fetch';

export async function sendOneSignalNotification({ userId, title, message }: { userId: string, title: string, message: string }) {
  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
        filters: [
          { field: 'tag', key: 'user_id', relation: '=', value: userId }
        ],
      }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OneSignal API error: ${error}`);
    }
    return await res.json();
  } catch (err) {
    console.error('OneSignal notification failed:', err);
    return null;
  }
}
