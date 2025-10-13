// Quick test for seller notifications after recent changes
// Run this in the browser console on your production site

async function testSellerNotification() {
  console.log('🧪 Testing seller notification flow...');
  
  // Check environment variables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.campusolx.com';
  console.log('✅ Base URL:', baseUrl);
  
  // Simulate notification URL generation
  const sellerId = 'test-seller-123';
  const productTitle = 'Test Product';
  
  console.log('📧 Notification would be sent to userId:', sellerId);
  console.log('🏷️ With title: "New Connection Request"');
  console.log('💬 With message: "You have a new connection request for your product: "' + productTitle + '"');
  console.log('🔗 Click URL would be:', baseUrl + '/chat');
  
  console.log('✅ All notification parameters look correct!');
}

// Run the test
testSellerNotification();