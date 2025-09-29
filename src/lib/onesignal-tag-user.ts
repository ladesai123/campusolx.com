// Tag the current user in OneSignal with their user ID (frontend)
export function tagUserWithOneSignal(userId: string) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      await OneSignal.User.addTag('user_id', userId);
    });
  } catch (err) {
    console.error('Failed to tag user in OneSignal:', err);
  }
}
