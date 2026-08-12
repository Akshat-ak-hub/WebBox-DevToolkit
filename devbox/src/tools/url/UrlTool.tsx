import { useState, useCallback } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import {
  encodeUrlComponent,
  decodeUrlComponent,
  encodeFullUrl,
  decodeFullUrl,
  getUrlParts,
} from './urlUtils';
import { ArrowRightLeft, Trash2, AlertCircle, Globe } from 'lucide-react';

type Mode = 'encode' | 'decode';
type Scope = 'component' | 'full';

interface UrlToolProps {
  initialInput?: string;
}

export function UrlTool({ initialInput = '' }: UrlToolProps) {
  const isEncoded = initialInput.includes('%') && /%[0-9A-Fa-f]{2}/.test(initialInput);
  const [input, setInput] = useState(initialInput);
  const [mode, setMode] = useState<Mode>(isEncoded ? 'decode' : 'encode');
  const [scope, setScope] = useState<Scope>('component');
  const [output, setOutput] = useState(() => {
    if (!initialInput.trim()) return '';
    try {
      return isEncoded ? decodeUrlComponent(initialInput) : encodeUrlComponent(initialInput);
    } catch {
      return '';
    }
  });
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleProcess = useCallback(() => {
    if (!input.trim()) {
      showToast('Enter a URL or text first', 'info');
      return;
    }
    try {
      setError(null);
      let result: string;
      if (mode === 'encode') {
        result = scope === 'component' ? encodeUrlComponent(input) : encodeFullUrl(input);
      } else {
        result = scope === 'component' ? decodeUrlComponent(input) : decodeFullUrl(input);
      }
      setOutput(result);
      showToast(`URL ${mode === 'encode' ? 'encoded' : 'decoded'}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process');
      setOutput('');
      showToast('Error processing input', 'error');
    }
  }, [input, mode, scope, showToast]);

  const handleSwap = useCallback(() => {
    setInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError(null);
  }, [output, mode]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  const urlParts = input.trim() ? getUrlParts(input.trim()) : null;

  return (
    <ToolLayout>
      {/* Mode & scope toggles */}
      <div className="tool-actions">
        <div className="mode-toggle">
          <button
            className={`mode-toggle-btn ${mode === 'encode' ? 'active' : ''}`}
            onClick={() => { setMode('encode'); setError(null); }}
          >
            Encode
          </button>
          <button
            className={`mode-toggle-btn ${mode === 'decode' ? 'active' : ''}`}
            onClick={() => { setMode('decode'); setError(null); }}
          >
            Decode
          </button>
        </div>
        <div className="mode-toggle">
          <button
            className={`mode-toggle-btn ${scope === 'component' ? 'active' : ''}`}
            onClick={() => setScope('component')}
          >
            Component
          </button>
          <button
            className={`mode-toggle-btn ${scope === 'full' ? 'active' : ''}`}
            onClick={() => setScope('full')}
          >
            Full URL
          </button>
        </div>
        <button className="btn btn-primary" onClick={handleProcess}>
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        {output && (
          <button className="btn btn-secondary" onClick={handleSwap}>
            <ArrowRightLeft className="btn-icon" />
            Swap
          </button>
        )}
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 className="btn-icon" />
        </button>
        {output && <CopyButton text={output} />}
      </div>

      {error && (
        <div className="error-display">
          <AlertCircle className="error-display-icon" />
          <div className="error-display-text">{error}</div>
        </div>
      )}

      {/* URL Parts breakdown */}
      {urlParts && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(urlParts).map(([key, value]) => (
            <div
              key={key}
              style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              <Globe style={{ width: 9, height: 9, display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      )}

      {/* Input / Output */}
      <div className="tool-split">
        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Input</span>
          </div>
          <textarea
            className={`tool-textarea ${error ? 'error' : ''}`}
            placeholder={
              mode === 'encode'
                ? 'Enter text or URL to encode...\n\nExample: hello world\nor: https://example.com/path?q=hello world'
                : 'Enter encoded URL to decode...\n\nExample: hello%20world'
            }
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            spellCheck={false}
          />
        </div>

        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Output</span>
          </div>
          <div className="tool-output">
            {output || (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>
                {mode === 'encode' ? 'Encoded output...' : 'Decoded output...'}
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
