import { useState, useEffect, useCallback } from 'react';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './tools/home/HomePage';
import { JsonFormatter } from './tools/json/JsonFormatter';
import { Base64Tool } from './tools/base64/Base64Tool';
import { UrlTool } from './tools/url/UrlTool';
import { TimestampTool } from './tools/timestamp/TimestampTool';
import { UuidTool } from './tools/uuid/UuidTool';
import { JwtDecoder } from './tools/jwt/JwtDecoder';
import { RegexTester } from './tools/regex/RegexTester';
import { ColorPicker } from './tools/color/ColorPicker';
import { QrGenerator } from './tools/qr/QrGenerator';
import { ClipboardManager } from './tools/clipboard/ClipboardManager';
import { addClipboardItem } from './tools/clipboard/clipboardUtils';
import { ResizeHandles } from './components/ResizeHandles';
import { getStorage, setStorage } from './storage/storage';

type Theme = 'dark' | 'light';

function App() {
  const [activeTool, setActiveTool] = useState('home');
  const [activeInput, setActiveInput] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [favorites, setFavorites] = useState<string[]>(['json', 'jwt', 'clipboard']);

  // Load saved theme and favorites
  useEffect(() => {
    getStorage<Theme>('devbox-theme', 'light').then(setTheme);
    getStorage<string[]>('devbox-favorites', ['json', 'jwt', 'clipboard']).then(setFavorites);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStorage('devbox-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleToggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      setStorage('devbox-favorites', next);
      return next;
    });
  }, []);

  const handleNavigate = useCallback((toolId: string, initialInput?: string) => {
    setActiveTool(toolId);
    if (initialInput !== undefined) {
      setActiveInput(initialInput);
    }
  }, []);

  const handleSelectTool = useCallback((toolId: string) => {
    setActiveTool(toolId);
    setActiveInput(''); // Reset initial input on manual tool switch
  }, []);

  // Global Clipboard Capture (Ctrl+C anywhere in the app)
  useEffect(() => {
    const handleGlobalCopy = () => {
      setTimeout(async () => {
        try {
          const selected = document.getSelection()?.toString();
          if (selected && selected.trim()) {
            await addClipboardItem(selected.trim());
          } else if (navigator.clipboard?.readText) {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
              await addClipboardItem(text.trim());
            }
          }
        } catch {
          // ignore
        }
      }, 50);
    };

    document.addEventListener('copy', handleGlobalCopy);
    return () => document.removeEventListener('copy', handleGlobalCopy);
  }, []);

  // Auto-sync system clipboard on window focus/startup
  useEffect(() => {
    const syncSystemClipboard = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.trim()) {
            await addClipboardItem(text.trim());
          }
        }
      } catch {
        // clipboard permission restricted in some environments
      }
    };

    syncSystemClipboard();
    window.addEventListener('focus', syncSystemClipboard);
    return () => window.removeEventListener('focus', syncSystemClipboard);
  }, []);

  // Global keyboard shortcuts (Alt+1 through Alt+0, Alt+C, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const keyMap: Record<string, string> = {
          '1': 'home',
          '2': 'json',
          '3': 'jwt',
          '4': 'base64',
          '5': 'url',
          '6': 'timestamp',
          '7': 'uuid',
          '8': 'color',
          '9': 'regex',
          '0': 'qr',
          c: 'clipboard',
          C: 'clipboard',
          h: 'home',
          H: 'home',
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          handleSelectTool(keyMap[e.key]);
        }
      } else if (e.key === 'Escape' && activeTool !== 'home') {
        handleSelectTool('home');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, handleSelectTool]);

  const renderTool = () => {
    switch (activeTool) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'json':
        return <JsonFormatter key={`json-${activeInput}`} initialInput={activeInput} />;
      case 'base64':
        return <Base64Tool key={`base64-${activeInput}`} initialInput={activeInput} />;
      case 'url':
        return <UrlTool key={`url-${activeInput}`} initialInput={activeInput} />;
      case 'timestamp':
        return <TimestampTool key={`ts-${activeInput}`} initialInput={activeInput} />;
      case 'uuid':
        return <UuidTool />;
      case 'jwt':
        return <JwtDecoder key={`jwt-${activeInput}`} initialInput={activeInput} />;
      case 'regex':
        return <RegexTester key={`regex-${activeInput}`} initialInput={activeInput} />;
      case 'color':
        return <ColorPicker key={`color-${activeInput}`} initialInput={activeInput} />;
      case 'qr':
        return <QrGenerator key={`qr-${activeInput}`} initialInput={activeInput} />;
      case 'clipboard':
        return <ClipboardManager onNavigateToTool={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSetTheme={setTheme}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
        <main className="content-area">
          <Header activeTool={activeTool} theme={theme} onToggleTheme={toggleTheme} />
          <div className="content-body">
            {renderTool()}
          </div>
        </main>
        <ResizeHandles />
      </div>
    </ToastProvider>
  );
}

export default App;
