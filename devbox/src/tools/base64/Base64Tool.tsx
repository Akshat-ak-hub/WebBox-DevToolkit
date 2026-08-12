import { useState, useCallback } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import { encodeBase64, decodeBase64, isValidBase64 } from './base64Utils';
import { ArrowRightLeft, Trash2, AlertCircle } from 'lucide-react';

type Mode = 'encode' | 'decode';

interface Base64ToolProps {
  initialInput?: string;
}

export function Base64Tool({ initialInput = '' }: Base64ToolProps) {
  const isInputBase64 = initialInput.trim() ? isValidBase64(initialInput.trim()) : false;
  const [input, setInput] = useState(initialInput);
  const [mode, setMode] = useState<Mode>(isInputBase64 ? 'decode' : 'encode');
  const [output, setOutput] = useState(() => {
    if (!initialInput.trim()) return '';
    try {
      return isInputBase64 ? decodeBase64(initialInput.trim()) : encodeBase64(initialInput);
    } catch {
      return '';
    }
  });
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleProcess = useCallback(() => {
    if (!input.trim()) {
      showToast('Enter some text first', 'info');
      return;
    }
    try {
      setError(null);
      if (mode === 'encode') {
        const result = encodeBase64(input);
        setOutput(result);
        showToast('Encoded to Base64!');
      } else {
        if (!isValidBase64(input.trim())) {
          setError('Invalid Base64 string. Check for invalid characters or incorrect padding.');
          setOutput('');
          showToast('Invalid Base64', 'error');
          return;
        }
        const result = decodeBase64(input.trim());
        setOutput(result);
        showToast('Decoded from Base64!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process');
      setOutput('');
      showToast('Error processing input', 'error');
    }
  }, [input, mode, showToast]);

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

  return (
    <ToolLayout>
      {/* Mode toggle + actions */}
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
          Clear
        </button>
        {output && <CopyButton text={output} />}
      </div>

      {error && (
        <div className="error-display">
          <AlertCircle className="error-display-icon" />
          <div className="error-display-text">{error}</div>
        </div>
      )}

      {/* Input / Output */}
      <div className="tool-split">
        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>{mode === 'encode' ? 'Text' : 'Base64'}</span>
            {input && (
              <span className="tool-panel-label-count">{input.length} chars</span>
            )}
          </div>
          <textarea
            className={`tool-textarea ${error ? 'error' : ''}`}
            placeholder={
              mode === 'encode'
                ? 'Enter text to encode...\n\nExample: Hello World'
                : 'Enter Base64 to decode...\n\nExample: SGVsbG8gV29ybGQ='
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
            <span>{mode === 'encode' ? 'Base64' : 'Text'}</span>
            {output && (
              <span className="tool-panel-label-count">{output.length} chars</span>
            )}
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
