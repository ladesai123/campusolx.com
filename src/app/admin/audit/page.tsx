import { getAuditLogs } from '@/lib/adminAudit';
import { FileText, Shield, Clock } from 'lucide-react';

export const metadata = {
  title: 'Audit Logs • CampusOLX Ops',
};

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(50);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" /> Administrative Audit Trail & Operation Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable record of every administrative action, data deletion, visibility change, and settings update.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm">Recent Audit Log Entries</h3>
          <span className="text-xs font-mono text-slate-400">Showing last 50 actions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Admin Email</th>
                <th className="py-2.5 px-3">Action Performed</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3">Affected Rows</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400">
                      {log.created_at ? new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{log.admin_email}</td>
                    <td className="py-3 px-3 text-blue-400 font-bold">{log.action}</td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[180px]">{log.target}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{log.affected_count}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.status || 'SUCCESS'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[250px]">
                      {log.details || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No admin audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
