import { useState, useCallback } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import { generateQRCode, qrToDataUrl, downloadQrPng, qrToSvg, type QRCodeData } from './qrUtils';
import { Trash2, Download, AlertCircle } from 'lucide-react';

interface QrGeneratorProps {
  initialInput?: string;
}

export function QrGenerator({ initialInput = '' }: QrGeneratorProps) {
  const [input, setInput] = useState(initialInput);
  const [qrData, setQrData] = useState<QRCodeData | null>(() => {
    if (initialInput.trim() && initialInput.trim().length <= 200) {
      try {
        return generateQRCode(initialInput.trim());
      } catch {
        return null;
      }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleGenerate = useCallback(() => {
    if (!input.trim()) {
      showToast('Enter text or URL first', 'info');
      return;
    }
    try {
      setError(null);
      const data = generateQRCode(input.trim());
      setQrData(data);
      showToast('QR code generated!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      setQrData(null);
      showToast('Error generating QR', 'error');
    }
  }, [input, showToast]);

  const handleDownload = useCallback(() => {
    if (!qrData) return;
    downloadQrPng(qrData, 'devbox-qr.png');
    showToast('QR code downloaded!');
  }, [qrData, showToast]);

  const handleCopySvg = useCallback(async () => {
    if (!qrData) return;
    const svg = qrToSvg(qrData);
    try {
      await navigator.clipboard.writeText(svg);
      showToast('SVG copied!');
    } catch {
      showToast('Failed to copy', 'error');
    }
  }, [qrData, showToast]);

  const handleClear = useCallback(() => {
    setInput('');
    setQrData(null);
    setError(null);
  }, []);

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    setError(null);
    // Auto-generate on change if short enough
    if (val.trim().length > 0 && val.trim().length <= 200) {
      try {
        const data = generateQRCode(val.trim());
        setQrData(data);
        setError(null);
      } catch {
        // ignore, user still typing
      }
    }
  }, []);

  const dataUrl = qrData ? qrToDataUrl(qrData) : null;

  return (
    <ToolLayout>
      {/* Actions */}
      <div className="tool-actions">
        <button className="btn btn-primary" onClick={handleGenerate}>Generate</button>
        {qrData && (
          <>
            <button className="btn btn-secondary" onClick={handleDownload}>
              <Download className="btn-icon" /> Download PNG
            </button>
            <button className="btn btn-secondary" onClick={handleCopySvg}>
              Copy SVG
            </button>
          </>
        )}
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

      <div className="tool-split">
        {/* Input */}
        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Input</span>
            {input && <span className="tool-panel-label-count">{input.length} chars</span>}
          </div>
          <textarea
            className={`tool-textarea ${error ? 'error' : ''}`}
            placeholder="Enter text or URL to generate QR code...\n\nhttps://github.com/"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* QR Output */}
        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>QR Code</span>
            {qrData && <span className="tool-panel-label-count">v{qrData.version} · {qrData.size}×{qrData.size}</span>}
          </div>
          <div
            className="tool-output"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#ffffff', padding: 16,
            }}
          >
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="QR Code"
                style={{
                  maxWidth: '100%', maxHeight: '100%', imageRendering: 'pixelated',
                }}
              />
            ) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-sans)', fontSize: 11 }}>
                QR code will appear here...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ fontSize: 9, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
        <span>100% local generation</span>
        <span>·</span>
        <span>No external APIs</span>
        <span>·</span>
        <span>Supports up to ~200 characters</span>
      </div>
    </ToolLayout>
  );
}
