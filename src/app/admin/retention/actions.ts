'use server';

import { verifyAdminSession, getAdminSupabase } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/adminAudit';

export async function previewCleanupAction(retentionTarget: string, monthsThreshold: number) {
  const { isAdmin, user } = await verifyAdminSession();
  if (!isAdmin || !user) {
    throw new Error('Unauthorized');
  }

  const adminSupabase = getAdminSupabase();
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsThreshold);
  const cutoffISO = cutoffDate.toISOString();

  let matchingCount = 0;
  let estSpaceMB = '0.0 MB';
  let oldestRecord = 'N/A';
  let newestRecord = 'N/A';

  if (retentionTarget === 'chat_messages') {
    const { count } = await adminSupabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffISO);

    matchingCount = count || 0;
    estSpaceMB = `${((matchingCount * 280) / (1024 * 1024)).toFixed(2)} MB`;

    const { data: oldest } = await adminSupabase
      .from('messages')
      .select('created_at')
      .lt('created_at', cutoffISO)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: newest } = await adminSupabase
      .from('messages')
      .select('created_at')
      .lt('created_at', cutoffISO)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (oldest?.created_at) oldestRecord = new Date(oldest.created_at).toLocaleDateString('en-IN');
    if (newest?.created_at) newestRecord = new Date(newest.created_at).toLocaleDateString('en-IN');
  } else if (retentionTarget === 'notifications') {
    const { count } = await adminSupabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffISO);

    matchingCount = count || 0;
    estSpaceMB = `${((matchingCount * 120) / (1024 * 1024)).toFixed(2)} MB`;
  }

  return {
    target: retentionTarget,
    monthsThreshold,
    cutoffISO,
    matchingCount,
    estSpaceMB,
    oldestRecord,
    newestRecord,
  };
}

export async function executeCleanupAction(
  retentionTarget: string,
  monthsThreshold: number,
  confirmationPhrase: string
) {
  const { isAdmin, user } = await verifyAdminSession();
  if (!isAdmin || !user) {
    throw new Error('Unauthorized admin session');
  }

  if (confirmationPhrase.trim() !== 'DELETE') {
    throw new Error('Invalid confirmation phrase. You must type DELETE to confirm.');
  }

  const adminSupabase = getAdminSupabase();
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsThreshold);
  const cutoffISO = cutoffDate.toISOString();

  let affectedCount = 0;

  if (retentionTarget === 'chat_messages') {
    const { count, error } = await adminSupabase
      .from('messages')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffISO);

    if (error) {
      throw new Error(`Failed to delete chat messages: ${error.message}`);
    }

    affectedCount = count || 0;
  } else if (retentionTarget === 'notifications') {
    const { count, error } = await adminSupabase
      .from('notifications')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffISO);

    if (error) {
      throw new Error(`Failed to delete notifications: ${error.message}`);
    }

    affectedCount = count || 0;
  }

  // Record action in immutable Admin Audit Log
  await logAdminAction(
    user.email!,
    'DATA_RETENTION_CLEANUP',
    retentionTarget,
    affectedCount,
    `Deleted records older than ${monthsThreshold} months (Cutoff: ${cutoffISO.slice(0, 10)})`
  );

  return { success: true, affectedCount };
}
