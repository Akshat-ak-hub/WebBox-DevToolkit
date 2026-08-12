import React, { useRef, useMemo, useEffect } from 'react';

interface CodeEditorWithLinesProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  errorLine?: number | null;
  placeholder?: string;
  highlightSyntax?: boolean;
  highlightedHtml?: string;
}

export function CodeEditorWithLines({
  value,
  onChange,
  readOnly = false,
  errorLine = null,
  placeholder = '',
  highlightSyntax = false,
  highlightedHtml,
}: CodeEditorWithLinesProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const codeViewerRef = useRef<HTMLPreElement>(null);

  const lines = useMemo(() => {
    if (!value) return [1];
    const count = value.split('\n').length;
    return Array.from({ length: Math.max(1, count) }, (_, i) => i + 1);
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
    if (codeViewerRef.current) {
      codeViewerRef.current.scrollTop = scrollTop;
    }
    if (textareaRef.current && e.currentTarget !== textareaRef.current) {
      textareaRef.current.scrollTop = scrollTop;
    }
  };

  return (
    <div className="code-editor-container">
      {/* Line Numbers Gutter */}
      <div className="code-editor-gutter" ref={gutterRef}>
        {lines.map((num) => (
          <div
            key={num}
            className={`code-editor-line-num ${errorLine === num ? 'line-error' : ''}`}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Editor / Viewer Area */}
      <div className="code-editor-body">
        {readOnly && highlightSyntax && highlightedHtml ? (
          <pre
            ref={codeViewerRef}
            className="code-editor-viewer"
            onScroll={handleScroll}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            className={`code-editor-textarea ${errorLine ? 'has-error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onScroll={handleScroll}
            readOnly={readOnly}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
