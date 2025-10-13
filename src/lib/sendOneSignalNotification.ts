// Server-side utility to send a OneSignal notification to a user by tag (user_id)
import fetch from 'node-fetch';

export async function sendOneSignalNotification({ userId, title, message, connectionId }: { userId: string, title: string, message: string, connectionId?: number }) {
  console.log('🔔 DEBUGGING: Attempting to send OneSignal notification');
  console.log('- Target userId:', userId);
  console.log('- Title:', title);
  console.log('- Message:', message);
  console.log('- Connection ID:', connectionId);
  console.log('- App ID:', process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ? 'Set' : 'Missing');
  console.log('- REST API Key:', process.env.ONESIGNAL_REST_API_KEY ? 'Set' : 'Missing');
  
  try {
    // Construct the deep link URL - prioritize specific chat over general chat
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.campusolx.com';
    const notificationUrl = connectionId !== undefined 
      ? `${baseUrl}/chat/${connectionId}`
      : `${baseUrl}/chat`;
    
    console.log('🔗 Notification click URL:', notificationUrl);
    
    const requestBody = {
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      url: notificationUrl,
      web_url: notificationUrl, // Explicit web URL for web push
      web_buttons: [
        {
          id: 'open-chat',
          text: 'Open Chat',
          url: notificationUrl
        }
      ],
      filters: [
        { field: 'tag', key: 'user_id', relation: '=', value: userId }
      ],
    };
    
    console.log('🔔 Request body:', JSON.stringify(requestBody, null, 2));
    
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('🔔 OneSignal API response status:', res.status);
    
    if (!res.ok) {
      const error = await res.text();
      console.error('🔔 OneSignal API error response:', error);
      throw new Error(`OneSignal API error: ${error}`);
    }
    
    const result = await res.json() as any;
    console.log('🔔 OneSignal API success response:', result);
    console.log('✅ Notification sent successfully with URL:', notificationUrl);
    console.log('📊 Recipients:', result?.recipients || 'Unknown');
    return result;
  } catch (err) {
    console.error('🔔 OneSignal notification failed:', err);
    return null;
  }
}
