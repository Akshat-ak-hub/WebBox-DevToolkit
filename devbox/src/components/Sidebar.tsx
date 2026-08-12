import { useState, useMemo } from 'react';
import {
  Search,
  Braces,
  Binary,
  Link,
  Clock,
  Fingerprint,
  Sun,
  Moon,
  Home,
  Palette,
  QrCode,
  Regex,
  Clipboard,
  KeyRound,
  Star,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from 'lucide-react';
import { DevBoxLogo } from './DevBoxLogo';

export interface ToolDef {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  category: 'formatters' | 'generators' | 'utilities';
  shortcut?: string;
}

export const TOOLS: ToolDef[] = [
  { id: 'home', label: 'Home', icon: Home, description: 'Universal Input Detector', category: 'formatters', shortcut: '1' },
  { id: 'json', label: 'JSON Formatter', icon: Braces, description: 'Format, minify & validate', category: 'formatters', shortcut: '2' },
  { id: 'jwt', label: 'JWT Decoder', icon: KeyRound, description: 'Decode JWT tokens', category: 'formatters', shortcut: '3' },
  { id: 'base64', label: 'Base64', icon: Binary, description: 'Encode & decode', category: 'formatters', shortcut: '4' },
  { id: 'url', label: 'URL Encoder', icon: Link, description: 'Encode & decode URLs', category: 'formatters', shortcut: '5' },
  { id: 'timestamp', label: 'Timestamp', icon: Clock, description: 'Convert timestamps', category: 'formatters', shortcut: '6' },
  { id: 'uuid', label: 'UUID Generator', icon: Fingerprint, description: 'Generate UUIDs', category: 'generators', shortcut: '7' },
  { id: 'color', label: 'Color Picker', icon: Palette, description: 'Pick & convert colors', category: 'utilities', shortcut: '8' },
  { id: 'regex', label: 'Regex Tester', icon: Regex, description: 'Test regular expressions', category: 'utilities', shortcut: '9' },
  { id: 'qr', label: 'QR Code', icon: QrCode, description: 'Generate QR codes', category: 'generators', shortcut: '0' },
  { id: 'clipboard', label: 'Clipboard', icon: Clipboard, description: 'Clipboard history', category: 'utilities', shortcut: 'C' },
];

interface SidebarProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSetTheme?: (theme: 'dark' | 'light') => void;
  favorites?: string[];
  onToggleFavorite?: (toolId: string) => void;
}

export function Sidebar({
  activeTool,
  onSelectTool,
  theme,
  onToggleTheme,
  onSetTheme,
  favorites = ['json', 'jwt', 'clipboard'],
  onToggleFavorite,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const q = searchQuery.toLowerCase();
    return TOOLS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const favoriteTools = useMemo(() => {
    return TOOLS.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  const formatters = useMemo(() => filteredTools.filter((t) => t.category === 'formatters'), [filteredTools]);
  const generators = useMemo(() => filteredTools.filter((t) => t.category === 'generators'), [filteredTools]);
  const utilities = useMemo(() => filteredTools.filter((t) => t.category === 'utilities'), [filteredTools]);

  const renderToolItem = (tool: ToolDef) => {
    const isFav = favorites.includes(tool.id);
    return (
      <button
        key={tool.id}
        className={`sidebar-item ${activeTool === tool.id ? 'active' : ''} ${isCollapsed ? 'sidebar-item-collapsed' : ''}`}
        onClick={() => onSelectTool(tool.id)}
        title={`${tool.label} — ${tool.description}`}
      >
        <tool.icon className="sidebar-item-icon" />
        {!isCollapsed && (
          <>
            <span className="sidebar-item-label">{tool.label}</span>

            {/* Star favorite toggle */}
            {onToggleFavorite && tool.id !== 'home' && (
              <span
                className={`favorite-star-btn ${isFav ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(tool.id);
                }}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star style={{ width: 10, height: 10, fill: isFav ? 'var(--star-color)' : 'none' }} />
              </span>
            )}

            {tool.shortcut && (
              <span className="tool-shortcut-tag">
                {tool.shortcut}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand & Collapse Toggle */}
      <div className="sidebar-brand">
        <div onClick={() => onSelectTool('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="DevBox Home">
          <DevBoxLogo size={22} />
        </div>
        {!isCollapsed && <span className="sidebar-brand-text">DevBox</span>}
        <button
          className="btn btn-ghost btn-sm sidebar-brand-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeft style={{ width: 13, height: 13 }} /> : <PanelLeftClose style={{ width: 13, height: 13 }} />}
        </button>
      </div>

      {/* Search with accurate shortcut badge */}
      {!isCollapsed && (
        <div className="sidebar-search">
          <div className="sidebar-search-wrapper">
            <Search className="sidebar-search-icon" />
            <input
              className="sidebar-search-input"
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="sidebar-search-shortcut">Alt+0-9</span>
          </div>
        </div>
      )}

      {/* Categorized Navigation */}
      <nav className="sidebar-nav">
        {/* Favorites section */}
        {!isCollapsed && !searchQuery.trim() && favoriteTools.length > 0 && (
          <>
            <div className="sidebar-section-label">Favorites</div>
            {favoriteTools.map((tool) => (
              <button
                key={`fav-${tool.id}`}
                className={`sidebar-item ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => onSelectTool(tool.id)}
                title={tool.description}
              >
                <tool.icon className="sidebar-item-icon" />
                <span className="sidebar-item-label">{tool.label}</span>
                {onToggleFavorite && (
                  <span
                    className="favorite-star-btn is-active"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tool.id);
                    }}
                    title="Remove from favorites"
                  >
                    <Star style={{ width: 10, height: 10, fill: 'var(--star-color)' }} />
                  </span>
                )}
              </button>
            ))}
          </>
        )}

        {searchQuery.trim() ? (
          <>
            <div className="sidebar-section-label">Results ({filteredTools.length})</div>
            {filteredTools.map(renderToolItem)}
          </>
        ) : (
          <>
            {!isCollapsed && <div className="sidebar-section-label">Formatters</div>}
            {formatters.map(renderToolItem)}

            {!isCollapsed && <div className="sidebar-section-label">Generators</div>}
            {generators.map(renderToolItem)}

            {!isCollapsed && <div className="sidebar-section-label">Utilities</div>}
            {utilities.map(renderToolItem)}
          </>
        )}
      </nav>

      {/* Footer with Segmented Theme Toggle */}
      <div className={`sidebar-footer ${isCollapsed ? 'sidebar-footer-collapsed' : ''}`}>
        {!isCollapsed ? (
          <div className="theme-segmented-pill">
            <button
              className={`theme-pill-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => (onSetTheme ? onSetTheme('light') : theme === 'dark' && onToggleTheme())}
              title="Light Theme"
            >
              <Sun style={{ width: 11, height: 11 }} />
              Light
            </button>
            <button
              className={`theme-pill-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => (onSetTheme ? onSetTheme('dark') : theme === 'light' && onToggleTheme())}
              title="Dark Theme"
            >
              <Moon style={{ width: 11, height: 11 }} />
              Dark
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
            {theme === 'dark' ? <Sun style={{ width: 13, height: 13, color: 'var(--star-color)' }} /> : <Moon style={{ width: 13, height: 13 }} />}
          </button>
        )}
      </div>
    </aside>
  );
}
