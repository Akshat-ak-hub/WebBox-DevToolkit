import { useState, useCallback, useMemo } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import { testRegex, highlightMatches, COMMON_PATTERNS } from './regexUtils';
import { Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface RegexTesterProps {
  initialInput?: string;
}

export function RegexTester({ initialInput = '' }: RegexTesterProps) {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState(initialInput);
  const [flags, setFlags] = useState('g');
  const { showToast } = useToast();

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    return testRegex(pattern, testString, flags);
  }, [pattern, testString, flags]);

  const highlighted = useMemo(() => {
    if (!pattern || !testString) return null;
    return highlightMatches(testString, pattern, flags);
  }, [pattern, testString, flags]);

  const handleClear = useCallback(() => {
    setPattern('');
    setTestString('');
  }, []);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, '') : prev + flag
    );
  }, []);

  const handlePreset = useCallback((p: typeof COMMON_PATTERNS[0]) => {
    setPattern(p.pattern);
    setFlags(p.flags || 'g');
    showToast(`Loaded: ${p.name}`);
  }, [showToast]);

  return (
    <ToolLayout>
      {/* Pattern input */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>/</span>
        <input
          className="input-field"
          style={{ flex: 1 }}
          placeholder="Enter regex pattern..."
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
        />
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>/</span>
        <input
          className="input-field"
          style={{ width: 48, textAlign: 'center' }}
          placeholder="gi"
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          spellCheck={false}
        />
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 className="btn-icon" />
        </button>
      </div>

      {/* Flags toggles */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          { flag: 'g', label: 'Global' },
          { flag: 'i', label: 'Case Insensitive' },
          { flag: 'm', label: 'Multiline' },
          { flag: 's', label: 'Dotall' },
        ].map(({ flag, label }) => (
          <button
            key={flag}
            className={`btn btn-sm ${flags.includes(flag) ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toggleFlag(flag)}
            title={label}
          >
            {flag}
          </button>
        ))}
        <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 4 }}>
          {result ? (
            result.isValid ? (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <CheckCircle style={{ width: 10, height: 10 }} />
                {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
              </span>
            ) : (
              <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <XCircle style={{ width: 10, height: 10 }} />
                Invalid regex
              </span>
            )
          ) : null}
        </span>

        {/* Presets dropdown */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
          {COMMON_PATTERNS.slice(0, 4).map((p) => (
            <button
              key={p.name}
              className="btn btn-sm btn-secondary"
              onClick={() => handlePreset(p)}
              title={p.pattern}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {result && !result.isValid && result.error && (
        <div className="error-display">
          <AlertCircle className="error-display-icon" />
          <div className="error-display-text">{result.error}</div>
        </div>
      )}

      {/* Test string + results */}
      <div className="tool-split">
        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Test String</span>
            {testString && (
              <span className="tool-panel-label-count">{testString.length} chars</span>
            )}
          </div>
          <textarea
            className="tool-textarea"
            placeholder="Enter test string here...\n\nExample: john@example.com"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Results</span>
            {result && result.matchCount > 0 && <CopyButton text={result.matches.map(m => m.match).join('\n')} label="Copy" />}
          </div>
          <div className="tool-output" style={{ fontSize: 11 }}>
            {/* Highlighted text */}
            {highlighted && pattern && testString ? (
              <div style={{ marginBottom: 10, lineHeight: 1.7 }}>
                {highlighted.map((seg, i) => (
                  <span
                    key={i}
                    style={seg.isMatch ? {
                      background: 'var(--accent-bg)',
                      border: '1px solid var(--accent-primary)',
                      borderRadius: 2,
                      padding: '0 2px',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                    } : undefined}
                  >
                    {seg.text}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Match list */}
            {result && result.matches.length > 0 ? (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
                  MATCHES
                </div>
                {result.matches.slice(0, 20).map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 8, padding: '3px 0', fontSize: 10,
                    borderBottom: '1px solid var(--border-color)',
                  }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 16 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 500 }}>"{m.match}"</span>
                    <span style={{ color: 'var(--text-muted)' }}>@{m.index}</span>
                    {m.groups && Object.keys(m.groups).length > 0 && (
                      <span style={{ color: 'var(--accent-primary)', fontSize: 9 }}>
                        groups: {JSON.stringify(m.groups)}
                      </span>
                    )}
                  </div>
                ))}
                {result.matches.length > 20 && (
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                    ...and {result.matches.length - 20} more
                  </div>
                )}
              </div>
            ) : pattern && testString && result?.isValid ? (
              <div style={{ color: 'var(--error)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle style={{ width: 12, height: 12 }} /> No matches
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>
                Match results will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
