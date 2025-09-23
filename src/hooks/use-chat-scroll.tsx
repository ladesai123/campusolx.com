import { useEffect, useRef } from 'react';

interface ChatScrollProps {
  chatRef: React.RefObject<HTMLDivElement | null>;
  count: number;
}


export function useChatScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  return { containerRef, scrollToBottom };
}
