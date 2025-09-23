"use client";
import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import fs from 'fs';

interface LegalModalProps {
  type: 'terms' | 'privacy';
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

// NOTE: Because this is a client component, we cannot read the file system directly here during runtime in the browser.
// We'll pass content in via props in a more advanced version, but for simplicity we'll fetch via a lightweight API route later if needed.
// For now we'll just show a placeholder telling user to open full page.

export default function LegalModal({ type, open, onOpenChange }: LegalModalProps) {
  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const description = type === 'terms' ? 'Review the rules that govern using CampusOlx.' : 'Understand how we collect and use information.';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm text-gray-700 space-y-3">
          <p>For the full {title.toLowerCase()}, please open the dedicated page:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><a className="text-blue-600 underline" href={type === 'terms' ? '/legal/terms' : '/legal/privacy'}>Open full {title}</a></li>
          </ul>
          <p className="text-xs text-gray-500">(Inline modal preview can be expanded later to show full content.)</p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
