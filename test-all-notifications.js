// Comprehensive notification test - run this in production console
// This will test all 3 notification types that should work

async function testAllNotifications() {
  console.log('🧪 Testing all CampusOLX notification types...');
  
  const baseUrl = 'https://www.campusolx.com';
  
  // Test 1: Connection request notification (to seller)
  console.log('\n1️⃣ Testing connection request notification...');
  try {
    const response1 = await fetch(`${baseUrl}/api/test-onesignal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-seller-123',
        title: 'New Connection Request',
        message: 'You have a new connection request for your product: "Test Product"'
      })
    });
    const result1 = await response1.json();
    console.log('✅ Connection request test:', result1);
  } catch (err) {
    console.error('❌ Connection request test failed:', err);
  }
  
  // Test 2: Message notification 
  console.log('\n2️⃣ Testing chat message notification...');
  try {
    const response2 = await fetch(`${baseUrl}/api/test-onesignal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-buyer-456', 
        title: 'New Message',
        message: 'You have a new message: "Hello, is this still available?"'
      })
    });
    const result2 = await response2.json();
    console.log('✅ Chat message test:', result2);
  } catch (err) {
    console.error('❌ Chat message test failed:', err);
  }
  
  // Test 3: Connection accepted notification (to buyer)
  console.log('\n3️⃣ Testing connection accepted notification...');
  try {
    const response3 = await fetch(`${baseUrl}/api/test-onesignal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-buyer-789',
        title: 'Seller Accepted Your Request!',
        message: 'Seller accepted your request for "Test Product". You can now chat and fix a deal!'
      })
    });
    const result3 = await response3.json();
    console.log('✅ Connection accepted test:', result3);
  } catch (err) {
    console.error('❌ Connection accepted test failed:', err);
  }
  
  console.log('\n🎯 All tests completed! Check if any notifications appeared.');
  
  // Check user tagging
  if (typeof OneSignal !== 'undefined') {
    try {
      const tags = await OneSignal.User.getTags();
      console.log('\n👤 Your OneSignal tags:', tags);
      
      const isSubscribed = OneSignal.User.PushSubscription.optedIn;
      console.log('🔔 Push subscription status:', isSubscribed);
      
      if (!isSubscribed) {
        console.log('⚠️  You are not subscribed to push notifications!');
        console.log('💡 Try subscribing first: OneSignal.slidedown.promptPush()');
      }
    } catch (err) {
      console.error('❌ OneSignal status check failed:', err);
    }
  } else {
    console.log('❌ OneSignal not loaded on this page');
  }
}

// Run the comprehensive test
testAllNotifications();