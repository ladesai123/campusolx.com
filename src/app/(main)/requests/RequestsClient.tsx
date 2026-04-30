"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RequestCard } from '@/components/RequestCard';
import type { RequestWithProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Search, Loader2, ArrowLeft } from 'lucide-react';
import { postRequestAction } from './actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RequestsClientProps {
  requests: RequestWithProfile[];
  currentUserId: string;
  university: string;
}

export default function RequestsClient({ requests, currentUserId, university }: RequestsClientProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ── Intersection Observer for View Counts ──
  const viewedRef = useRef<Set<number>>(new Set());
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setCardRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const idStr = (entry.target as HTMLElement).dataset.requestId;
          if (!idStr) return;
          const id = parseInt(idStr, 10);

          if (entry.isIntersecting) {
            if (!viewedRef.current.has(id) && !timers.current.has(id)) {
              const timer = setTimeout(() => {
                viewedRef.current.add(id);
                // Fire and forget view count update
                fetch('/api/view-count-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ requestId: id })
                }).catch(console.error);
              }, 1500);
              timers.current.set(id, timer);
            }
          } else {
            const timer = timers.current.get(id);
            if (timer) {
              clearTimeout(timer);
              timers.current.delete(id);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    const currentRefs = cardRefs.current;
    currentRefs.forEach(ref => observer.observe(ref));
    return () => {
      currentRefs.forEach(ref => observer.unobserve(ref));
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, [requests]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPosting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await postRequestAction(formData);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to post request");
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Link href="/home" className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Marketplace
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Wanted Items</h1>
          </div>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-md">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post Request
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>What are you looking for?</AlertDialogTitle>
              </AlertDialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Name</Label>
                  <Input id="title" name="title" placeholder="e.g. Casio 991MS Calculator" required minLength={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_budget">Max Budget (₹) - Optional</Label>
                  <Input id="max_budget" name="max_budget" type="number" placeholder="e.g. 500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input id="whatsapp_number" name="whatsapp_number" type="tel" placeholder="10-digit number" required pattern="[0-9]{10}" />
                  <p className="text-[10px] text-gray-500">Required so sellers can contact you if they have the item.</p>
                </div>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel type="button" onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                  <Button type="submit" className="bg-blue-600" disabled={isPosting}>
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Post Request
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(request => (
              <div 
                key={request.id}
                data-request-id={request.id}
                ref={el => setCardRef(request.id, el)}
              >
                <RequestCard request={request} currentUserId={currentUserId} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 inline-flex rounded-full p-4 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No requests yet</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto text-sm">
              Be the first to post a request and let others know what you need!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
