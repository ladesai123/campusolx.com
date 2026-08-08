import { getAdminSupabase } from './adminAuth';

export interface AuditLogEntry {
  id?: number;
  admin_email: string;
  action: string;
  target: string;
  affected_count: number;
  details?: string;
  created_at?: string;
  status?: string;
}

export interface IncidentLogEntry {
  id?: number;
  route: string;
  error_message: string;
  status_code?: number;
  created_at?: string;
}

// In-memory fallback logs in case audit table is not yet migrated in PostgreSQL
const inMemoryAuditLogs: AuditLogEntry[] = [
  {
    id: 1,
    admin_email: '126156075@sastra.ac.in',
    action: 'SYSTEM_AUDIT_INIT',
    target: 'Full Architecture Audit',
    affected_count: 0,
    details: 'Initial system audit and egress optimization plan initialized.',
    created_at: new Date().toISOString(),
    status: 'SUCCESS',
  },
];

const inMemoryIncidents: IncidentLogEntry[] = [];

/**
 * Record an administrative action into the audit trail.
 */
export async function logAdminAction(
  adminEmail: string,
  action: string,
  target: string,
  affectedCount: number,
  details = '',
  status = 'SUCCESS'
) {
  const entry: AuditLogEntry = {
    admin_email: adminEmail,
    action,
    target,
    affected_count: affectedCount,
    details,
    created_at: new Date().toISOString(),
    status,
  };

  // Always keep in memory for immediate dashboard responsiveness
  inMemoryAuditLogs.unshift(entry);
  if (inMemoryAuditLogs.length > 500) inMemoryAuditLogs.pop();

  try {
    const adminSupabase = getAdminSupabase();
    await adminSupabase.from('admin_audit_logs').insert({
      admin_email: adminEmail,
      action,
      target,
      affected_count: affectedCount,
      details,
      status,
    });
  } catch (e) {
    // Silent fallback to in-memory store if DB table hasn't been migrated
    console.warn('[AdminAudit] Log saved in memory fallback');
  }
}

/**
 * Fetch recent audit logs.
 */
export async function getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  try {
    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as AuditLogEntry[];
    }
  } catch (e) {
    /* fallback to memory */
  }

  return inMemoryAuditLogs.slice(0, limit);
}

/**
 * Record a system incident / error for monitoring.
 */
export async function logServerError(route: string, errorMessage: string, statusCode = 500) {
  const entry: IncidentLogEntry = {
    route,
    error_message: errorMessage,
    status_code: statusCode,
    created_at: new Date().toISOString(),
  };

  inMemoryIncidents.unshift(entry);
  if (inMemoryIncidents.length > 200) inMemoryIncidents.pop();

  try {
    const adminSupabase = getAdminSupabase();
    await adminSupabase.from('admin_error_logs').insert({
      route,
      error_message: errorMessage,
      status_code: statusCode,
    });
  } catch (e) {
    /* fallback to memory */
  }
}

/**
 * Fetch recent incidents / error logs.
 */
export async function getIncidentLogs(limit = 50): Promise<IncidentLogEntry[]> {
  try {
    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('admin_error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as IncidentLogEntry[];
    }
  } catch (e) {
    /* fallback to memory */
  }

  return inMemoryIncidents.slice(0, limit);
}
