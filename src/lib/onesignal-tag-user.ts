// Tag the current user in OneSignal with their user ID (frontend)
export function tagUserWithOneSignal(userId: string) {
  if (typeof window === 'undefined' || !(window as any).OneSignal || !userId) return;
  try {
    (window as any).OneSignal.push(function() {
      (window as any).OneSignal.sendTag('user_id', userId);
    });
  } catch (err) {
    console.error('Failed to tag user in OneSignal:', err);
  }
}
