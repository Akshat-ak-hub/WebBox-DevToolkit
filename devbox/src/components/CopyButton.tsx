import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from './Toast';
import { addClipboardItem } from '../tools/clipboard/clipboardUtils';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'icon';
}

export function CopyButton({ text, label = 'Copy', className = '', variant = 'default' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Copied to clipboard!');
      addClipboardItem(text).catch(() => {});
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      showToast('Copied to clipboard!');
      addClipboardItem(text).catch(() => {});
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text, showToast]);

  if (variant === 'icon') {
    return (
      <button
        className={`copy-btn ${copied ? 'copied' : ''} ${className}`}
        onClick={handleCopy}
        title={copied ? 'Copied!' : label}
      >
        {copied ? <Check className="copy-btn-icon" /> : <Copy className="copy-btn-icon" />}
      </button>
    );
  }

  return (
    <button
      className={`copy-btn ${copied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
    >
      {copied ? <Check className="copy-btn-icon" /> : <Copy className="copy-btn-icon" />}
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}
