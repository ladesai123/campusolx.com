import React from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface SimpleSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function SimpleSpinner({ 
  className, 
  size = "md", 
  text = "Loading..." 
}: SimpleSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={clsx("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={clsx("animate-spin text-blue-600", sizeClasses[size])} />
      {text && (
        <div className={clsx("text-gray-500", textSizeClasses[size])}>
          {text}
        </div>
      )}
    </div>
  );
}