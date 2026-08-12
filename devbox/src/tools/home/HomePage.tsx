import { useState, useCallback } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { detectInputType, type DetectedType } from '../../utils/detector';
import { TOOLS } from '../../components/Sidebar';
import { Wand2 } from 'lucide-react';

interface HomePageProps {
  onNavigate: (toolId: string, initialInput?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [input, setInput] = useState('');
  const [detected, setDetected] = useState<DetectedType | null>(null);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    if (value.trim().length > 2) {
      const result = detectInputType(value);
      setDetected(result.type !== 'unknown' ? result : null);
    } else {
      setDetected(null);
    }
  }, []);

  const availableTools = TOOLS.filter((t) => t.id !== 'home');

  return (
    <ToolLayout>
      {/* Universal Input Detector */}
      <div className="home-detector">
        <textarea
          className="home-detector-textarea"
          placeholder="Paste anything — JSON, Base64, JWT, UUID, URL, timestamp — DevBox detects it automatically."
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          spellCheck={false}
        />

        {detected && (
          <div className="home-detector-result">
            <span className="home-detector-result-text">{detected.label}</span>
            <span className={`home-detector-result-confidence confidence-${detected.confidence}`}>
              {detected.confidence}
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate(detected.toolId, input)}
              style={{ marginLeft: 8 }}
            >
              <Wand2 style={{ width: 12, height: 12 }} />
              {detected.action}
            </button>
          </div>
        )}
      </div>

      {/* Quick access tools grid */}
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Quick Access
      </div>
      <div className="home-tools-grid">
        {availableTools.map((tool) => (
          <button
            key={tool.id}
            className="home-tool-card"
            onClick={() => onNavigate(tool.id)}
          >
            <tool.icon className="home-tool-card-icon" />
            <span className="home-tool-card-name">{tool.label}</span>
            <span className="home-tool-card-desc">{tool.description}</span>
          </button>
        ))}
      </div>
    </ToolLayout>
  );
}
