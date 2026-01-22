/**
 * Node Search Component
 * Provides search functionality to find and navigate to specific nodes
 */

import { useReactFlow } from '@reactflow/core';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface NodeSearchProps {
  nodes: Array<{
    id: string;
    data: {
      label: string;
      [key: string]: any;
    };
  }>;
}

export const NodeSearch: React.FC<NodeSearchProps> = ({ nodes }) => {
  const { fitView } = useReactFlow();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Filter nodes based on search query
  const results = useMemo(() => {
    if (!query.trim()) return [];

    return nodes.filter((node) => {
      const label = node.data?.label || '';
      return label.toLowerCase().includes(query.toLowerCase());
    });
  }, [nodes, query]);

  // Handle node selection
  const handleSelect = useCallback(
    (nodeId: string) => {
      fitView({
        nodes: [{ id: nodeId, padding: 0.5 }],
        duration: 500,
      });

      // Add pulse animation to the selected node
      setHighlightedNodeId(nodeId);
      setTimeout(() => setHighlightedNodeId(null), 1000);

      setIsOpen(false);
      setQuery('');
    },
    [fitView]
  );

  // Handle keyboard shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    },
    [isOpen]
  );

  // Register keyboard shortcut
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="node-search-button"
        title="노드 찾기 (Ctrl+K)"
        aria-label="노드 찾기"
      >
        <Search size={16} />
        <span className="ml-1">노드 찾기</span>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="node-search-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="node-search-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-title"
          >
            <div className="node-search-header">
              <div className="node-search-title">
                <Search size={20} />
                <h2 id="search-title">노드 찾기</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="node-search-close"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            <div className="node-search-input-wrapper">
              <input
                type="text"
                placeholder="노드 제목 검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="node-search-input"
                autoFocus
                aria-label="검색어 입력"
              />
              <div className="node-search-shortcut">Ctrl + K</div>
            </div>

            <div className="node-search-results">
              {query.trim() === '' ? (
                <div className="node-search-empty">
                  <p>검색어를 입력하세요</p>
                </div>
              ) : results.length === 0 ? (
                <div className="node-search-empty">
                  <p>검색 결과가 없습니다</p>
                </div>
              ) : (
                <ul className="node-search-list">
                  {results.map((node) => (
                    <li key={node.id}>
                      <button
                        onClick={() => handleSelect(node.id)}
                        className="node-search-result"
                        style={
                          highlightedNodeId === node.id
                            ? { animation: 'pulse 1s ease-in-out' }
                            : undefined
                        }
                      >
                        <div className="node-search-result-label">
                          {node.data?.label || 'Unnamed Node'}
                        </div>
                        <div className="node-search-result-action">이동</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
