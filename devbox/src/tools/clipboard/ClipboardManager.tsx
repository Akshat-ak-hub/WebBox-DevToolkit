import { useState, useEffect, useCallback, useMemo } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import {
  getClipboardHistory,
  addClipboardItem,
  togglePinClipboardItem,
  deleteClipboardItem,
  clearClipboardHistory,
  clearAllClipboardHistory,
  formatTimeAgo,
  type ClipboardItem,
} from './clipboardUtils';
import {
  Search,
  Pin,
  PinOff,
  Trash2,
  Plus,
  ClipboardPaste,
  Wand2,
  FileCode,
  KeyRound,
  Link,
  Palette,
  Fingerprint,
  FileText,
} from 'lucide-react';

interface ClipboardManagerProps {
  onNavigateToTool?: (toolId: string, input: string) => void;
}

export function ClipboardManager({ onNavigateToTool }: ClipboardManagerProps) {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'json' | 'jwt' | 'url'>('all');
  const [manualInput, setManualInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();

  const loadHistory = useCallback(async () => {
    const history = await getClipboardHistory();
    setItems(history);
  }, []);

  useEffect(() => {
    loadHistory();

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
        if (areaName === 'local' && changes['devbox_clipboard_history']) {
          setItems(changes['devbox_clipboard_history'].newValue || []);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, [loadHistory]);

  const handlePasteSystemClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        showToast('Clipboard is empty', 'info');
        return;
      }
      const updated = await addClipboardItem(text);
      setItems(updated);
      showToast('Added from clipboard!');
    } catch {
      showToast('Could not read clipboard. Permission denied.', 'error');
    }
  }, [showToast]);

  const handleAddManual = useCallback(async () => {
    if (!manualInput.trim()) {
      showToast('Enter some text first', 'info');
      return;
    }
    const updated = await addClipboardItem(manualInput.trim());
    setItems(updated);
    setManualInput('');
    setShowAddModal(false);
    showToast('Snippet saved!');
  }, [manualInput, showToast]);

  const handleTogglePin = useCallback(async (id: string) => {
    const updated = await togglePinClipboardItem(id);
    setItems(updated);
    const item = updated.find((i) => i.id === id);
    showToast(item?.pinned ? 'Item pinned' : 'Item unpinned');
  }, [showToast]);

  const handleDelete = useCallback(async (id: string) => {
    const updated = await deleteClipboardItem(id);
    setItems(updated);
    showToast('Item removed');
  }, [showToast]);

  const handleClearUnpinned = useCallback(async () => {
    const updated = await clearClipboardHistory();
    setItems(updated);
    showToast('Cleared unpinned history');
  }, [showToast]);

  const handleClearAll = useCallback(async () => {
    const updated = await clearAllClipboardHistory();
    setItems(updated);
    showToast('Cleared all history');
  }, [showToast]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by type or pin
      if (activeFilter === 'pinned' && !item.pinned) return false;
      if (activeFilter === 'json' && item.type !== 'json') return false;
      if (activeFilter === 'jwt' && item.type !== 'jwt') return false;
      if (activeFilter === 'url' && item.type !== 'url') return false;

      // Search query
      if (searchQuery.trim()) {
        return item.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [items, activeFilter, searchQuery]);

  const getItemIcon = (type?: ClipboardItem['type']) => {
    switch (type) {
      case 'json':
        return <FileCode style={{ width: 12, height: 12, color: 'var(--accent-primary)' }} />;
      case 'jwt':
        return <KeyRound style={{ width: 12, height: 12, color: '#f59e0b' }} />;
      case 'url':
        return <Link style={{ width: 12, height: 12, color: '#3b82f6' }} />;
      case 'color':
        return <Palette style={{ width: 12, height: 12, color: '#ec4899' }} />;
      case 'uuid':
        return <Fingerprint style={{ width: 12, height: 12, color: '#10b981' }} />;
      default:
        return <FileText style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />;
    }
  };

  const getToolRouteForType = (type?: ClipboardItem['type']): string | null => {
    switch (type) {
      case 'json':
        return 'json';
      case 'jwt':
        return 'jwt';
      case 'url':
        return 'url';
      case 'color':
        return 'color';
      case 'uuid':
        return 'uuid';
      default:
        return null;
    }
  };

  return (
    <ToolLayout>
      {/* Top Action Bar */}
      <div className="tool-actions">
        <button className="btn btn-primary" onClick={handlePasteSystemClipboard}>
          <ClipboardPaste className="btn-icon" />
          Paste from System
        </button>

        <button className="btn btn-secondary" onClick={() => setShowAddModal(!showAddModal)}>
          <Plus className="btn-icon" />
          Add Snippet
        </button>

        {items.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleClearUnpinned} title="Clear non-pinned items">
              Clear Unpinned
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleClearAll} title="Clear everything">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Form Drawer */}
      {showAddModal && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <textarea
            className="input-field"
            style={{ width: '100%', minHeight: 50, resize: 'vertical', fontSize: 11 }}
            placeholder="Type or paste custom snippet to save in history..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleAddManual}>
              Save Snippet
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 12,
              height: 12,
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="input-field"
            style={{ width: '100%', paddingLeft: 26, fontSize: 11 }}
            placeholder="Search clipboard history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: 3 }}>
          {(['all', 'pinned', 'json', 'jwt', 'url'] as const).map((filter) => (
            <button
              key={filter}
              className={`btn btn-sm ${activeFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter(filter)}
              style={{ textTransform: 'capitalize' }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          paddingRight: 2,
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const toolRoute = getToolRouteForType(item.type);
            return (
              <div
                key={item.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: item.pinned ? 'var(--accent-bg)' : 'var(--bg-input)',
                  border: item.pinned ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  transition: 'background var(--transition-fast)',
                }}
              >
                {/* Top Item Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {getItemIcon(item.type)}
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.type || 'text'}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {toolRoute && onNavigateToTool && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 5px', fontSize: 9 }}
                        onClick={() => onNavigateToTool(toolRoute, item.content)}
                        title={`Open in ${toolRoute.toUpperCase()}`}
                      >
                        <Wand2 style={{ width: 10, height: 10, marginRight: 2 }} />
                        Open Tool
                      </button>
                    )}
                    <CopyButton text={item.content} variant="icon" />
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 4px', color: item.pinned ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                      onClick={() => handleTogglePin(item.id)}
                      title={item.pinned ? 'Unpin' : 'Pin item'}
                    >
                      {item.pinned ? <PinOff style={{ width: 11, height: 11 }} /> : <Pin style={{ width: 11, height: 11 }} />}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 4px', color: 'var(--text-muted)' }}
                      onClick={() => handleDelete(item.id)}
                      title="Delete item"
                    >
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  </div>
                </div>

                {/* Content snippet */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-primary)',
                    maxHeight: 60,
                    overflowY: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    lineHeight: 1.4,
                    userSelect: 'all',
                  }}
                >
                  {item.content}
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontSize: 12,
              gap: 6,
              padding: 24,
              textAlign: 'center',
            }}
          >
            <span>No clipboard items found.</span>
            <span style={{ fontSize: 10, opacity: 0.8 }}>
              Click "Paste from System" or copy anything inside DevBox to start saving history.
            </span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
