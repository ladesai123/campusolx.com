import { useEffect, useRef } from 'react';

interface ChatScrollProps {
  chatRef: React.RefObject<HTMLDivElement | null>;
  count: number;
}

export function useChatScroll({ chatRef, count }: ChatScrollProps) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (chatRef.current) {
      // On initial load or when new messages come in, scroll to the bottom.
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
      hasInitialized.current = true;
    }
  }, [chatRef, count]);
}
