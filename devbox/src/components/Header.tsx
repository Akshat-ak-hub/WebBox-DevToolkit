import { TOOLS } from './Sidebar';
import { Shield, ExternalLink, X, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTool: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Header({ activeTool, theme, onToggleTheme }: HeaderProps) {
  const tool = TOOLS.find((t) => t.id === activeTool);

  if (!tool) return null;

  const handlePopoutWindow = () => {
    if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.create) {
      chrome.windows.create({
        url: chrome.runtime.getURL('index.html?popup=true'),
        type: 'popup',
        width: 760,
        height: 600,
      });
    } else {
      window.open(window.location.href, '_blank', 'width=760,height=600');
    }
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <header className="content-header">
      <tool.icon className="content-header-icon" />
      <h1 className="content-header-title">{tool.label}</h1>
      <span className="content-header-badge">{tool.description}</span>

      <div className="header-actions">
        {/* Offline Privacy Badge */}
        <div className="header-privacy-badge">
          <Shield className="header-privacy-icon" />
          <span>Offline</span>
        </div>

        {/* Header Theme Toggle Button */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun style={{ width: 13, height: 13, color: 'var(--star-color)' }} />
          ) : (
            <Moon style={{ width: 13, height: 13, color: 'var(--text-secondary)' }} />
          )}
        </button>

        {/* Pop-out standalone window button */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={handlePopoutWindow}
          title="Open in standalone floating window"
        >
          <ExternalLink style={{ width: 12, height: 12 }} />
        </button>

        {/* Top-Right Close Button */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleClose}
          title="Close (✕)"
        >
          <X style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </header>
  );
}
