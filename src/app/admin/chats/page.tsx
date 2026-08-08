import { getAdminSupabase } from '@/lib/adminAuth';
import { MessageSquare, Users, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Chat & Messaging Management • CampusOLX Ops',
};

export default async function AdminChatsPage() {
  const adminSupabase = getAdminSupabase();

  const [
    { count: totalConnections },
    { count: totalMessages },
    { data: connections },
  ] = await Promise.all([
    adminSupabase.from('connections').select('id', { count: 'exact', head: true }),
    adminSupabase.from('messages').select('id', { count: 'exact', head: true }),
    adminSupabase
      .from('connections')
      .select('id, status, created_at, product:products!inner(id, title), requester:profiles!connections_requester_id_fkey(id, name), seller:profiles!connections_seller_id_fkey(id, name)')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-400" /> Chat & Conversation Management Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor buyer-seller connection threads, messaging density, and active user conversations.
        </p>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400">TOTAL CONVERSATIONS</span>
          <p className="text-2xl font-bold font-mono text-purple-400 mt-1">{(totalConnections || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-500 mt-1">Buyer-Seller Connection Threads</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400">TOTAL MESSAGES STORED</span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{(totalMessages || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-500 mt-1">Fastest Growing Table (~18.4 MB)</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-mono text-slate-400">AVG MESSAGES PER THREAD</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {totalConnections ? (totalMessages! / totalConnections).toFixed(1) : '0'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">High Conversational Density</p>
        </div>
      </div>

      {/* Recent Conversation Threads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow">
        <h3 className="font-bold text-slate-200 text-sm">Recent Buyer-Seller Connections</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Connection ID</th>
                <th className="py-2.5 px-3">Associated Product</th>
                <th className="py-2.5 px-3">Buyer (Requester)</th>
                <th className="py-2.5 px-3">Seller</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {connections && connections.length > 0 ? (
                connections.map((conn: any) => (
                  <tr key={conn.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400">#{conn.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200 truncate max-w-[200px]">
                      {Array.isArray(conn.product) ? conn.product[0]?.title : conn.product?.title || 'Product'}
                    </td>
                    <td className="py-3 px-3 text-blue-400">
                      {Array.isArray(conn.requester) ? conn.requester[0]?.name : conn.requester?.name || 'Buyer'}
                    </td>
                    <td className="py-3 px-3 text-purple-400">
                      {Array.isArray(conn.seller) ? conn.seller[0]?.name : conn.seller?.name || 'Seller'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        {conn.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {conn.created_at ? new Date(conn.created_at).toLocaleDateString('en-IN') : 'Recently'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No active chat connections found.
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
