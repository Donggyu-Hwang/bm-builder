import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

interface DocumentChanges {
  hasChanges: boolean;
  updated_at?: string;
  updated_by?: string;
  sections_count?: number;
}

interface UseDocumentPollingOptions {
  documentId: string;
  enabled?: boolean;
  interval?: number; // seconds
  onChangesDetected?: (changes: DocumentChanges) => void;
}

export const useDocumentPolling = ({
  documentId,
  enabled = true,
  interval = 10,
  onChangesDetected,
}: UseDocumentPollingOptions) => {
  const [hasNewChanges, setHasNewChanges] = useState(false);
  const [changes, setChanges] = useState<DocumentChanges | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkChanges = useCallback(async () => {
    if (!documentId) return;

    try {
      const since = lastCheck
        ? lastCheck.toISOString()
        : new Date(Date.now() - interval * 1000).toISOString();

      const response = await api.get(`/generated-documents/${documentId}/changes`, {
        params: { since },
        validateStatus: (status) => status === 304 || status === 200,
      });

      if (response.status === 200 && response.data?.data?.hasChanges) {
        const newChanges = response.data.data;
        setChanges(newChanges);
        setHasNewChanges(true);
        onChangesDetected?.(newChanges);
      }

      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking for document changes:', error);
    }
  }, [documentId, lastCheck, interval, onChangesDetected]);

  const dismissChanges = useCallback(() => {
    setHasNewChanges(false);
    setChanges(null);
  }, []);

  const refreshDocument = useCallback(() => {
    setHasNewChanges(false);
    setChanges(null);
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!enabled || !documentId) return;

    setIsPolling(true);

    // Initial check
    checkChanges();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      checkChanges();
    }, interval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPolling(false);
    };
  }, [enabled, documentId, interval, checkChanges]);

  // Pause polling when window is offline
  useEffect(() => {
    const handleOnline = () => {
      if (enabled && documentId) {
        checkChanges();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [enabled, documentId, checkChanges]);

  return {
    hasNewChanges,
    changes,
    isPolling,
    lastCheck,
    dismissChanges,
    refreshDocument,
    checkNow: checkChanges,
  };
};
