import { useState, useCallback, useEffect } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import { unixToDate, dateToUnix, getCurrentTimestamp, type DateInfo } from './timestampUtils';
import { Clock, Trash2, AlertCircle, RefreshCw, ArrowRightLeft } from 'lucide-react';

type Mode = 'toDate' | 'toUnix';

interface TimestampToolProps {
  initialInput?: string;
}

export function TimestampTool({ initialInput = '' }: TimestampToolProps) {
  const [mode, setMode] = useState<Mode>('toDate');
  const [timestampInput, setTimestampInput] = useState(initialInput);
  const [dateInput, setDateInput] = useState('');
  const [result, setResult] = useState<DateInfo | null>(() => {
    if (initialInput.trim() && /^\d+$/.test(initialInput.trim())) {
      try {
        return unixToDate(parseInt(initialInput.trim(), 10));
      } catch {
        return null;
      }
    }
    return null;
  });
  const [unixResult, setUnixResult] = useState<{ seconds: number; milliseconds: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveTimestamp, setLiveTimestamp] = useState(getCurrentTimestamp());
  const { showToast } = useToast();

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTimestamp(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConvertToDate = useCallback(() => {
    if (!timestampInput.trim()) {
      showToast('Enter a timestamp first', 'info');
      return;
    }
    try {
      setError(null);
      const num = parseInt(timestampInput.trim(), 10);
      if (isNaN(num)) throw new Error('Please enter a valid number');
      const info = unixToDate(num);
      setResult(info);
      showToast('Timestamp converted!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid timestamp');
      setResult(null);
      showToast('Invalid timestamp', 'error');
    }
  }, [timestampInput, showToast]);

  const handleConvertToUnix = useCallback(() => {
    if (!dateInput.trim()) {
      showToast('Enter a date first', 'info');
      return;
    }
    try {
      setError(null);
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) throw new Error('Invalid date format');
      const unix = dateToUnix(date);
      setUnixResult(unix);
      showToast('Date converted to Unix!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid date');
      setUnixResult(null);
      showToast('Invalid date', 'error');
    }
  }, [dateInput, showToast]);

  const handleNow = useCallback(() => {
    const now = getCurrentTimestamp();
    if (mode === 'toDate') {
      setTimestampInput(now.seconds.toString());
      const info = unixToDate(now.seconds);
      setResult(info);
      setError(null);
    } else {
      const nowDate = new Date();
      // Format for datetime-local input
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${nowDate.getFullYear()}-${pad(nowDate.getMonth() + 1)}-${pad(nowDate.getDate())}T${pad(nowDate.getHours())}:${pad(nowDate.getMinutes())}`;
      setDateInput(formatted);
      setUnixResult(dateToUnix(nowDate));
      setError(null);
    }
    showToast('Current time inserted!');
  }, [mode, showToast]);

  const handleClear = useCallback(() => {
    setTimestampInput('');
    setDateInput('');
    setResult(null);
    setUnixResult(null);
    setError(null);
  }, []);

  return (
    <ToolLayout>
      {/* Live timestamp display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-gradient-subtle)',
          border: '1px solid var(--border-color)',
          fontSize: 11,
        }}
      >
        <Clock style={{ width: 14, height: 14, color: 'var(--accent-primary)' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Now:</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{liveTimestamp.seconds}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>({liveTimestamp.milliseconds} ms)</span>
        <div style={{ marginLeft: 'auto' }}>
          <CopyButton text={liveTimestamp.seconds.toString()} label="Copy" />
        </div>
      </div>

      {/* Mode toggle + actions */}
      <div className="tool-actions">
        <div className="mode-toggle">
          <button
            className={`mode-toggle-btn ${mode === 'toDate' ? 'active' : ''}`}
            onClick={() => { setMode('toDate'); setError(null); }}
          >
            Unix → Date
          </button>
          <button
            className={`mode-toggle-btn ${mode === 'toUnix' ? 'active' : ''}`}
            onClick={() => { setMode('toUnix'); setError(null); }}
          >
            Date → Unix
          </button>
        </div>
        <button className="btn btn-primary" onClick={mode === 'toDate' ? handleConvertToDate : handleConvertToUnix}>
          <ArrowRightLeft className="btn-icon" />
          Convert
        </button>
        <button className="btn btn-secondary" onClick={handleNow}>
          <RefreshCw className="btn-icon" />
          Now
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 className="btn-icon" />
        </button>
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
            <span>Input</span>
          </div>
          {mode === 'toDate' ? (
            <textarea
              className={`tool-textarea ${error ? 'error' : ''}`}
              placeholder="Enter Unix timestamp...\n\nExample: 1716239022\n(seconds or milliseconds)"
              value={timestampInput}
              onChange={(e) => {
                setTimestampInput(e.target.value);
                setError(null);
              }}
              spellCheck={false}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <input
                type="datetime-local"
                className="input-field"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  setError(null);
                }}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Select a date & time above, then click "Convert" to get the Unix timestamp.
                <br /><br />
                Tip: Click "Now" to use the current date & time.
              </div>
            </div>
          )}
        </div>

        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Output</span>
          </div>
          <div className="tool-output">
            {mode === 'toDate' && result ? (
              <div className="timestamp-output">
                <div className="timestamp-row">
                  <span className="timestamp-label">UTC</span>
                  <span className="timestamp-value">{result.utc}</span>
                </div>
                <div className="timestamp-row">
                  <span className="timestamp-label">Local</span>
                  <span className="timestamp-value">{result.local}</span>
                </div>
                <div className="timestamp-row">
                  <span className="timestamp-label">ISO 8601</span>
                  <span className="timestamp-value">{result.iso}</span>
                </div>
                <div className="timestamp-row">
                  <span className="timestamp-label">Relative</span>
                  <span className="timestamp-value">{result.relative}</span>
                </div>
                <div className="timestamp-row">
                  <span className="timestamp-label">Format</span>
                  <span className="timestamp-value">
                    {result.isMilliseconds ? 'Milliseconds' : 'Seconds'}
                  </span>
                </div>
              </div>
            ) : mode === 'toUnix' && unixResult ? (
              <div className="timestamp-output">
                <div className="timestamp-row">
                  <span className="timestamp-label">Seconds</span>
                  <span className="timestamp-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {unixResult.seconds}
                    <CopyButton text={unixResult.seconds.toString()} variant="icon" />
                  </span>
                </div>
                <div className="timestamp-row">
                  <span className="timestamp-label">Milli&shy;seconds</span>
                  <span className="timestamp-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {unixResult.milliseconds}
                    <CopyButton text={unixResult.milliseconds.toString()} variant="icon" />
                  </span>
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>
                Converted output will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
