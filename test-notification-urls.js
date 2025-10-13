// Test script to verify OneSignal notification URL generation
// Run this in the browser console to test the notification URL logic

function testNotificationUrl(connectionId) {
  const baseUrl = 'https://www.campusolx.com';
  const notificationUrl = connectionId !== undefined 
    ? `${baseUrl}/chat/${connectionId}`
    : `${baseUrl}/chat`;
  
  console.log('🔗 Test notification URL:', notificationUrl);
  return notificationUrl;
}

// Test cases
console.log('Testing notification URLs:');
testNotificationUrl(123); // Should output: https://www.campusolx.com/chat/123
testNotificationUrl(undefined); // Should output: https://www.campusolx.com/chat

// To test in production, paste this in browser console:
// testNotificationUrl(123);