import { useState, useCallback } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import { decodeJwt, isJwt, type JwtInfo } from './jwtUtils';
import { Trash2, AlertCircle, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface JwtDecoderProps {
  initialInput?: string;
}

export function JwtDecoder({ initialInput = '' }: JwtDecoderProps) {
  const [input, setInput] = useState(initialInput);
  const [result, setResult] = useState<JwtInfo | null>(() => {
    if (initialInput.trim() && isJwt(initialInput.trim())) {
      try {
        return decodeJwt(initialInput.trim());
      } catch {
        return null;
      }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleDecode = useCallback(() => {
    if (!input.trim()) {
      showToast('Paste a JWT token first', 'info');
      return;
    }
    try {
      setError(null);
      const info = decodeJwt(input);
      setResult(info);
      showToast('JWT decoded!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      setResult(null);
      showToast('Invalid JWT', 'error');
    }
  }, [input, showToast]);

  const handleClear = useCallback(() => {
    setInput('');
    setResult(null);
    setError(null);
  }, []);

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    setError(null);
    // Auto-decode on paste
    if (isJwt(val)) {
      try {
        setResult(decodeJwt(val));
        setError(null);
      } catch {
        // ignore
      }
    }
  }, []);

  const formatJson = (obj: unknown) => JSON.stringify(obj, null, 2);
  const formatDate = (d: Date) => d.toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <ToolLayout>
      {/* Notice */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
        borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)',
        borderLeft: '3px solid var(--warning)', fontSize: 10, color: 'var(--text-secondary)',
      }}>
        <AlertTriangle style={{ width: 12, height: 12, color: 'var(--warning)', flexShrink: 0 }} />
        <span>Decoding only — this does <strong>not</strong> verify the signature.</span>
      </div>

      {/* Actions */}
      <div className="tool-actions">
        <button className="btn btn-primary" onClick={handleDecode}>Decode</button>
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 className="btn-icon" /> Clear
        </button>
        {result && <CopyButton text={formatJson(result.parts.payload)} label="Copy Payload" />}
      </div>

      {error && (
        <div className="error-display">
          <AlertCircle className="error-display-icon" />
          <div className="error-display-text">{error}</div>
        </div>
      )}

      <div className="tool-split">
        {/* Input */}
        <div className="tool-panel">
          <div className="tool-panel-label"><span>JWT Token</span></div>
          <textarea
            className={`tool-textarea ${error ? 'error' : ''}`}
            placeholder="Paste JWT token here...\n\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="tool-panel" style={{ overflow: 'auto' }}>
          <div className="tool-panel-label"><span>Decoded</span></div>
          <div className="tool-output" style={{ fontSize: 11 }}>
            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Expiration status */}
                {result.isExpired !== null && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)', fontSize: 10, fontWeight: 500,
                    background: result.isExpired ? 'var(--error-bg)' : 'var(--success-bg)',
                    color: result.isExpired ? 'var(--error)' : 'var(--success)',
                  }}>
                    {result.isExpired
                      ? <><AlertCircle style={{ width: 11, height: 11 }} /> Expired</>
                      : <><CheckCircle style={{ width: 11, height: 11 }} /> Valid (not expired)</>
                    }
                  </div>
                )}

                {/* Header */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'var(--font-sans)' }}>
                    HEADER
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--accent-primary)' }}>
                    {formatJson(result.parts.header)}
                  </pre>
                </div>

                {/* Payload */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'var(--font-sans)' }}>
                    PAYLOAD
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {formatJson(result.parts.payload)}
                  </pre>
                </div>

                {/* Claims */}
                {(result.expiresAt || result.issuedAt || result.issuer) && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
                      CLAIMS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10 }}>
                      {result.issuedAt && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Clock style={{ width: 10, height: 10, color: 'var(--text-muted)', marginTop: 2 }} />
                          <span><strong>Issued:</strong> {formatDate(result.issuedAt)}</span>
                        </div>
                      )}
                      {result.expiresAt && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Clock style={{ width: 10, height: 10, color: 'var(--text-muted)', marginTop: 2 }} />
                          <span><strong>Expires:</strong> {formatDate(result.expiresAt)}</span>
                        </div>
                      )}
                      {result.issuer && <div><strong>Issuer:</strong> {result.issuer}</div>}
                      {result.subject && <div><strong>Subject:</strong> {result.subject}</div>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>
                Decoded header & payload will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
