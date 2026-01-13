import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  generatePriorities,
  getPriorities,
  updatePriorities,
  setStreamingResponse,
  resetStreaming,
} from '../store/slices/prioritiesSlice';
import type { PriorityItem } from '../types/priorities';

export function usePriorities() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.priorities.items);
  const loading = useAppSelector((state) => state.priorities.loading);
  const generating = useAppSelector((state) => state.priorities.generating);
  const error = useAppSelector((state) => state.priorities.error);
  const streamingResponse = useAppSelector((state) => state.priorities.streamingResponse);

  const eventSourceRef = useRef<EventSource | null>(null);

  const generate = async (onboardingResponses: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // In production, you would use EventSource for SSE
    // For now, we'll use the regular API
    await dispatch(generatePriorities(onboardingResponses) as any);
  };

  const load = async () => {
    await dispatch(getPriorities() as any);
  };

  const save = async (priorities: PriorityItem[]) => {
    await dispatch(updatePriorities(priorities) as any);
  };

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    items,
    loading,
    generating,
    error,
    streamingResponse,
    generate,
    load,
    save,
  };
}
