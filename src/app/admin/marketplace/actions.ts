'use server';

import { verifyAdminSession, getAdminSupabase } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/adminAudit';

export async function toggleProductVisibilityAction(productId: number, hide: boolean) {
  const { isAdmin, user } = await verifyAdminSession();
  if (!isAdmin || !user) {
    throw new Error('Unauthorized admin session');
  }

  const adminSupabase = getAdminSupabase();
  const { error } = await adminSupabase
    .from('products')
    .update({ is_hidden: hide })
    .eq('id', productId);

  if (error) {
    throw new Error(`Failed to update product visibility: ${error.message}`);
  }

  await logAdminAction(
    user.email!,
    hide ? 'HIDE_PRODUCT' : 'RESTORE_PRODUCT',
    `Product ID: ${productId}`,
    1,
    `Toggled product visibility to is_hidden = ${hide}`
  );

  return { success: true };
}

export async function toggleShowOnLandingAction(productId: number, show: boolean) {
  const { isAdmin, user } = await verifyAdminSession();
  if (!isAdmin || !user) {
    throw new Error('Unauthorized admin session');
  }

  const adminSupabase = getAdminSupabase();
  const { error } = await adminSupabase
    .from('products')
    .update({ show_on_landing: show })
    .eq('id', productId);

  if (error) {
    throw new Error(`Failed to update show on landing status: ${error.message}`);
  }

  await logAdminAction(
    user.email!,
    show ? 'FEATURE_ON_LANDING' : 'UNFEATURE_FROM_LANDING',
    `Product ID: ${productId}`,
    1,
    `Toggled product landing page feature status to show_on_landing = ${show}`
  );

  return { success: true };
}

export async function adminDeleteProductAction(productId: number) {
  const { isAdmin, user } = await verifyAdminSession();
  if (!isAdmin || !user) {
    throw new Error('Unauthorized admin session');
  }

  const adminSupabase = getAdminSupabase();
  
  // Fetch product title before deleting for audit trail
  const { data: prod } = await adminSupabase
    .from('products')
    .select('title')
    .eq('id', productId)
    .single();

  const { error } = await adminSupabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  await logAdminAction(
    user.email!,
    'DELETE_PRODUCT',
    `Product ID: ${productId} ("${prod?.title || 'Unknown'}")`,
    1,
    'Permanently deleted product listing from marketplace'
  );

  return { success: true };
}
