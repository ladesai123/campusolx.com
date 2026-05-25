"use client";

import { AlertTriangle, Database, Mail } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface MaintenanceModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function MaintenanceModal({ open, onOpenChange }: MaintenanceModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md border-rose-100 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Animated pulsing warning icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-100 animate-ping opacity-75"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
              <Database className="h-8 w-8 animate-pulse" />
            </div>
          </div>

          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Temporary Maintenance
            </AlertDialogTitle>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Database Quota Exhausted</span>
            </div>
          </AlertDialogHeader>

          <AlertDialogDescription className="text-[15px] text-[#64748B] leading-relaxed space-y-3">
            <p>
              CampusOlx is temporarily running in maintenance mode. Our database free-tier limits have been reached due to high activity.
            </p>
            <p>
              We are waiting for the monthly quota refill, and the platform will be fully functional soon.
            </p>
            <p className="font-semibold text-[#0F172A]">
              We promise our users this won't happen again! We are actively setting up permanent upgrades to avoid future quota bottlenecks.
            </p>
          </AlertDialogDescription>

          <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Button 
              asChild
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
            >
              <a href="mailto:campusolx.connect@gmail.com?subject=Quota%20Support">
                <Mail className="mr-2 h-4 w-4" /> Contact Support
              </a>
            </Button>
            {onOpenChange && (
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full border-slate-200 hover:bg-slate-50 text-[#64748B] font-semibold py-2.5 rounded-xl transition-all"
              >
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
