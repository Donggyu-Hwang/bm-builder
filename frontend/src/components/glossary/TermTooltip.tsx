import { useState, useEffect } from 'react';
import Tooltip from '../ui/Tooltip';
import { TOOLTIP_DELAY } from '../../utils/constants';
import { useAppSelector } from '../../store/hooks';

interface GlossaryTerm {
  term: string;
  definition: string;
  examples?: string;
  category?: string;
}

interface TermTooltipProps {
  term: string;
  children: React.ReactNode;
}

export default function TermTooltip({ term, children }: TermTooltipProps) {
  const [glossaryEntry, setGlossaryEntry] = useState<GlossaryTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const showTooltips = useAppSelector((state) => {
    // Check from user preferences - for now default to true
    return true;
  });

  useEffect(() => {
    const fetchGlossaryTerm = async () => {
      setLoading(true);
      try {
        // Call Supabase to get the term definition
        const { data, error } = await window.supabase
          .from('glossary')
          .select('*')
          .ilike('term', term)
          .single();

        if (data && !error) {
          setGlossaryEntry(data);
        }
      } catch (error) {
        console.error('Failed to fetch glossary term:', error);
      } finally {
        setLoading(false);
      }
    };

    if (showTooltips && term) {
      fetchGlossaryTerm();
    }
  }, [term, showTooltips]);

  if (!showTooltips || loading || !glossaryEntry) {
    return <>{children}</>;
  }

  const content = (
    <div className="max-w-xs">
      <p className="font-semibold">{glossaryEntry.term}</p>
      <p className="mt-1 text-sm">{glossaryEntry.definition}</p>
      {glossaryEntry.examples && (
        <p className="mt-2 text-xs text-muted-foreground">
          예시: {glossaryEntry.examples}
        </p>
      )}
      {glossaryEntry.category && (
        <p className="mt-1 text-xs text-primary">
          카테고리: {glossaryEntry.category}
        </p>
      )}
    </div>
  );

  return (
    <Tooltip content={content} delay={TOOLTIP_DELAY}>
      {children}
    </Tooltip>
  );
}
