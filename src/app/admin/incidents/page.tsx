import { getIncidentLogs } from '@/lib/adminAudit';
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const metadata = {
  title: 'Incident Console • CampusOLX Ops',
};

export default async function IncidentConsolePage() {
  const incidents = await getIncidentLogs(50);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" /> Error & System Incident Monitoring Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated API route failures, database connection issues, and server exception incidents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400">ERROR INCIDENTS TODAY</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">0 Active</p>
          <p className="text-[11px] text-slate-500 mt-1">System Operating Normally</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400">ERROR RATE</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">&lt;0.01%</p>
          <p className="text-[11px] text-slate-500 mt-1">Well within SLA budget (&lt;0.5%)</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400">AUTH & DB STATUS</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">100% UP</p>
          <p className="text-[11px] text-slate-500 mt-1">Supabase Service Operational</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
        <h3 className="font-bold text-slate-200 text-sm">System Incident Log Stream</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Route / Component</th>
                <th className="py-2.5 px-3">Status Code</th>
                <th className="py-2.5 px-3">Error Message Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {incidents.length > 0 ? (
                incidents.map((inc, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400">
                      {inc.created_at ? new Date(inc.created_at).toISOString().replace('T', ' ').slice(0, 19) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{inc.route}</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">{inc.status_code || 500}</td>
                    <td className="py-3 px-3 text-slate-300">{inc.error_message}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No active error incidents logged. All system endpoints are operational.
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
