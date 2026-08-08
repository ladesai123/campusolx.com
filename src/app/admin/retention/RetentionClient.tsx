'use client';

import { useState, useTransition } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, Database, Calendar, HardDrive, CheckCircle2, Loader2, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { previewCleanupAction, executeCleanupAction } from './actions';
import Toast from '@/components/shared/Toast';

export default function RetentionClient() {
  const [retentionTarget, setRetentionTarget] = useState('chat_messages');
  const [monthsThreshold, setMonthsThreshold] = useState(5);
  const [preview, setPreview] = useState<any | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePreview = () => {
    startTransition(async () => {
      try {
        const res = await previewCleanupAction(retentionTarget, monthsThreshold);
        setPreview(res);
      } catch (err: any) {
        setToastMessage(`Preview failed: ${err.message}`);
      }
    });
  };

  const handleExecuteDelete = () => {
    if (confirmInput.trim() !== 'DELETE') {
      setToastMessage('You must type DELETE to confirm execution');
      return;
    }

    startTransition(async () => {
      try {
        const res = await executeCleanupAction(retentionTarget, monthsThreshold, confirmInput);
        setToastMessage(`Successfully deleted ${res.affectedCount.toLocaleString('en-IN')} records!`);
        setShowConfirmModal(false);
        setConfirmInput('');
        setPreview(null);
      } catch (err: any) {
        setToastMessage(`Cleanup failed: ${err.message}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-amber-400" /> Bounded Data Retention & Storage Pruning Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Safely delete old records with preview verification, space estimations, and audit logging.
          </p>
        </div>

        {/* Target Selection & Months Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1">DATA CLEANUP TARGET</label>
            <select
              value={retentionTarget}
              onChange={(e) => { setRetentionTarget(e.target.value); setPreview(null); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="chat_messages">Chat Messages (table: messages)</option>
              <option value="notifications">System Notifications (table: notifications)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1">DELETE RECORDS OLDER THAN</label>
            <select
              value={monthsThreshold}
              onChange={(e) => { setMonthsThreshold(Number(e.target.value)); setPreview(null); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value={3}>3 Months</option>
              <option value={5}>5 Months (Recommended)</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
        </div>

        {/* Step 1: Preview Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={handlePreview}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-5 py-2 flex items-center gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Generate Retention Preview
          </Button>
        </div>

        {/* STEP 2: PREVIEW STAGE PANEL */}
        {preview && (
          <div className="bg-slate-950 border border-blue-900/40 rounded-xl p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-blue-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> RETENTION PREVIEW GENERATED
              </span>
              <span className="text-slate-400">Target: {preview.target}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-slate-500 text-[11px] block">AFFECTED RECORDS</span>
                <span className="text-lg font-bold text-amber-400">{preview.matchingCount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-slate-500 text-[11px] block">EST. DB SPACE FREED</span>
                <span className="text-lg font-bold text-emerald-400">{preview.estSpaceMB}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-slate-500 text-[11px] block">CUTOFF DATE</span>
                <span className="text-sm font-bold text-slate-200">{preview.cutoffISO.slice(0, 10)}</span>
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-900/40 p-3 rounded text-amber-300 text-[11px] leading-relaxed">
              ⚠️ Deleting these records is permanent and cannot be undone. Cascade dependencies will automatically remove related orphaned notifications.
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowConfirmModal(true)}
                disabled={preview.matchingCount === 0}
                className="bg-red-600 hover:bg-red-500 text-white font-mono text-xs px-6 py-2 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Proceed to Confirmation Stage
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: EXPLICIT CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-bold text-slate-100 text-sm font-mono">DANGEROUS OPERATION CONFIRMATION</h3>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              You are about to permanently delete <strong className="text-amber-400">{preview?.matchingCount.toLocaleString('en-IN')}</strong> records older than {monthsThreshold} months.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400">
                To confirm deletion, type <strong className="text-red-400">DELETE</strong> in uppercase below:
              </label>
              <Input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type DELETE"
                className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                onClick={() => { setShowConfirmModal(false); setConfirmInput(''); }}
                variant="ghost"
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteDelete}
                disabled={confirmInput.trim() !== 'DELETE' || isPending}
                className="bg-red-600 hover:bg-red-500 text-white font-mono text-xs px-5 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Confirm & Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
