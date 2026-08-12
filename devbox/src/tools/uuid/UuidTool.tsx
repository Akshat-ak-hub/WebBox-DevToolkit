import { useState, useCallback } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import { generateMultipleUuids, formatUuid, type UuidCase } from './uuidUtils';
import { RefreshCw, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';

export function UuidTool() {
  const [uuids, setUuids] = useState<string[]>(() => generateMultipleUuids(1));
  const [count, setCount] = useState(1);
  const [uuidCase, setUuidCase] = useState<UuidCase>('lower');
  const { showToast } = useToast();

  const handleGenerate = useCallback(() => {
    const generated = generateMultipleUuids(count).map((u) => formatUuid(u, uuidCase));
    setUuids(generated);
    showToast(`Generated ${count} UUID${count > 1 ? 's' : ''}!`);
  }, [count, uuidCase, showToast]);

  const handleCopyAll = useCallback(async () => {
    const text = uuids.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('All UUIDs copied!');
    } catch {
      showToast('Failed to copy', 'error');
    }
  }, [uuids, showToast]);

  const handleClear = useCallback(() => {
    setUuids([]);
  }, []);

  const incrementCount = () => setCount((c) => Math.min(c + 1, 50));
  const decrementCount = () => setCount((c) => Math.max(c - 1, 1));

  const formattedUuids = uuids.map((u) => formatUuid(u, uuidCase));

  return (
    <ToolLayout>
      {/* Controls */}
      <div className="tool-actions">
        <button className="btn btn-primary" onClick={handleGenerate}>
          <RefreshCw className="btn-icon" />
          Generate
        </button>

        {/* Count control */}
        <div className="number-controls">
          <button className="number-btn" onClick={decrementCount} disabled={count <= 1}>
            <ArrowDown style={{ width: 12, height: 12 }} />
          </button>
          <span className="number-display">{count}</span>
          <button className="number-btn" onClick={incrementCount} disabled={count >= 50}>
            <ArrowUp style={{ width: 12, height: 12 }} />
          </button>
        </div>

        {/* Case toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-toggle-btn ${uuidCase === 'lower' ? 'active' : ''}`}
            onClick={() => setUuidCase('lower')}
          >
            lower
          </button>
          <button
            className={`mode-toggle-btn ${uuidCase === 'upper' ? 'active' : ''}`}
            onClick={() => setUuidCase('upper')}
          >
            UPPER
          </button>
        </div>

        {formattedUuids.length > 0 && (
          <>
            <button className="btn btn-secondary" onClick={handleCopyAll}>
              <Copy className="btn-icon" />
              Copy All
            </button>
            <button className="btn btn-ghost" onClick={handleClear}>
              <Trash2 className="btn-icon" />
            </button>
          </>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>UUID v4 (random)</span>
        <span>·</span>
        <span>Cryptographically secure</span>
        <span>·</span>
        <span>{formattedUuids.length} generated</span>
      </div>

      {/* UUID List */}
      <div className="uuid-list">
        {formattedUuids.length > 0 ? (
          formattedUuids.map((uuid, index) => (
            <div key={`${uuid}-${index}`} className="uuid-item">
              <span className="uuid-item-index">#{index + 1}</span>
              <span className="uuid-item-value">{uuid}</span>
              <CopyButton text={uuid} variant="icon" />
            </div>
          ))
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              fontSize: 12,
            }}
          >
            Click "Generate" to create UUIDs
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
