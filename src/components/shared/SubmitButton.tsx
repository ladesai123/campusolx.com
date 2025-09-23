'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React from 'react';

// This component can be used in any form that calls a Server Action.
export function SubmitButton({ 
    children, 
    variant = "default", 
    size = "default", 
    className = "" 
}: { 
    children: React.ReactNode, 
    variant?: any, 
    size?: any, 
    className?: string 
}) {
  // The useFormStatus hook provides the submission status of the parent <form>.
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size={size} variant={variant} disabled={pending} className={className}>
      {/* If the form is submitting (pending), show a loading spinner. */}
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      
      {/* Show the button's text or icon */}
      {children}
    </Button>
  );
}