"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  target: number;
  startFrom?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (val: number) => string;
}

export default function AnimatedCounter({
  target,
  startFrom,
  duration = 1400,
  prefix = "",
  suffix = "",
  className = "",
  formatter = (n: number) => Math.floor(n).toLocaleString("en-IN"),
}: AnimatedCounterProps) {
  const getStartVal = (t: number) => {
    if (startFrom !== undefined) return startFrom;
    if (t > 100) return Math.floor(t * 0.85);
    if (t > 10) return Math.floor(t * 0.5);
    return 0;
  };

  const [currentValue, setCurrentValue] = useState<number>(() => getStartVal(target));
  const startTimestampRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (target <= 0) {
      setCurrentValue(0);
      return;
    }

    const startVal = getStartVal(target);
    const delta = target - startVal;
    startTimestampRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimestampRef.current) startTimestampRef.current = timestamp;
      const progress = timestamp - startTimestampRef.current;
      const progressRatio = Math.min(progress / duration, 1);

      // Fast start, smooth ease-out curve (easeOutExpo)
      const easeOutExpo = progressRatio === 1 ? 1 : 1 - Math.pow(2, -10 * progressRatio);
      
      const calculatedValue = Math.floor(startVal + easeOutExpo * delta);
      setCurrentValue(calculatedValue);

      if (progressRatio < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(target);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration, startFrom]);

  return (
    <span className={`inline-block ${className}`}>
      {prefix}
      {formatter(currentValue)}
      {suffix}
    </span>
  );
}
