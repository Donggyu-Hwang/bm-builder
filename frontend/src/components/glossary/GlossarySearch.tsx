import { useState, useEffect, useRef } from 'react';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  examples?: string;
  category?: string;
}

interface GlossarySearchProps {
  onSelectTerm?: (term: string) => void;
}

export default function GlossarySearch({ onSelectTerm }: GlossarySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlossaryTerm[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchTerms = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      try {
        // Full-text search using Supabase
        const { data, error } = await window.supabase
          .from('glossary')
          .select('*')
          .or(`term.ilike.%${query}%,definition.ilike.%${query}%`)
          .limit(5);

        if (data && !error) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    const debounceTimer = setTimeout(searchTerms, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTerm = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    onSelectTerm?.(term);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder="용어 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
      />

      {isOpen && results.length > 0 && (
        <Card className="absolute z-50 mt-1 max-h-96 w-full overflow-y-auto">
          <div className="p-2">
            {results.map((term) => (
              <button
                key={term.id}
                className="w-full rounded px-3 py-2 text-left hover:bg-muted"
                onClick={() => handleSelectTerm(term.term)}
              >
                <p className="font-semibold">{term.term}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {term.definition}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <Card className="absolute z-50 mt-1 w-full">
          <div className="p-4 text-center text-sm text-muted-foreground">
            검색어 "{query}"에 대한 결과가 없습니다.
          </div>
        </Card>
      )}
    </div>
  );
}
