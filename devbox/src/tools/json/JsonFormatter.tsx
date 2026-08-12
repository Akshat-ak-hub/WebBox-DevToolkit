import { useState, useCallback, useMemo } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import {
  formatJson,
  minifyJson,
  validateJson,
  getJsonStats,
  sortJsonKeys,
  syntaxHighlightJson,
} from './jsonUtils';
import { CodeEditorWithLines } from './CodeEditorWithLines';
import { JsonTreeView } from './JsonTreeView';
import { JsonFormView } from './JsonFormView';
import {
  Sparkles,
  Minimize2,
  CheckCircle,
  Trash2,
  AlertCircle,
  Code2,
  FolderTree,
  Table,
  FileText,
  ArrowDownAZ,
  Download,
  Upload,
  FileCode,
} from 'lucide-react';

type ViewMode = 'code' | 'tree' | 'form' | 'text';

interface JsonFormatterProps {
  initialInput?: string;
}

const SAMPLE_JSON = `{
  "id": "usr_9984",
  "name": "DevBox User",
  "isActive": true,
  "roles": ["developer", "admin"],
  "stats": {
    "logins": 42,
    "rating": 4.95,
    "lastSeen": null
  },
  "settings": {
    "theme": "light",
    "notifications": {
      "email": true,
      "sms": false
    }
  }
}`;

export function JsonFormatter({ initialInput = '' }: JsonFormatterProps) {
  const [input, setInput] = useState(initialInput);
  const [indentSize, setIndentSize] = useState<number | string>(2);
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [error, setError] = useState<{ message: string; line: number; column: number } | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(() => {
    if (initialInput.trim()) {
      return validateJson(initialInput).valid;
    }
    return null;
  });

  const [output, setOutput] = useState(() => {
    if (initialInput.trim()) {
      try {
        return formatJson(initialInput, 2);
      } catch {
        return '';
      }
    }
    return '';
  });

  const { showToast } = useToast();

  // Parsed JSON object for Tree & Form views
  const parsedData = useMemo(() => {
    const textToParse = output || input;
    if (!textToParse.trim()) return null;
    try {
      return JSON.parse(textToParse);
    } catch {
      return null;
    }
  }, [output, input]);

  // Syntax highlighted HTML string
  const highlightedOutput = useMemo(() => {
    if (!output) return '';
    return syntaxHighlightJson(output);
  }, [output]);

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      showToast('Enter some JSON first', 'info');
      return;
    }
    try {
      const result = formatJson(input, indentSize);
      setOutput(result);
      setError(null);
      setIsValid(true);
      showToast('JSON formatted!');
    } catch {
      const validation = validateJson(input);
      if (!validation.valid && validation.error) {
        setError(validation.error);
        setIsValid(false);
      }
    }
  }, [input, indentSize, showToast]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      showToast('Enter some JSON first', 'info');
      return;
    }
    try {
      const result = minifyJson(input);
      setOutput(result);
      setError(null);
      setIsValid(true);
      showToast('JSON minified!');
    } catch {
      const validation = validateJson(input);
      if (!validation.valid && validation.error) {
        setError(validation.error);
        setIsValid(false);
      }
    }
  }, [input, showToast]);

  const handleSortKeys = useCallback((order: 'asc' | 'desc') => {
    if (!input.trim()) {
      showToast('Enter some JSON first', 'info');
      return;
    }
    try {
      const result = sortJsonKeys(input, order, indentSize);
      setOutput(result);
      setError(null);
      setIsValid(true);
      showToast(`Keys sorted (${order.toUpperCase()})!`);
    } catch {
      const validation = validateJson(input);
      if (!validation.valid && validation.error) {
        setError(validation.error);
        setIsValid(false);
      }
    }
  }, [input, indentSize, showToast]);

  const handleValidate = useCallback(() => {
    if (!input.trim()) {
      showToast('Enter some JSON first', 'info');
      return;
    }
    const validation = validateJson(input);
    if (validation.valid) {
      setIsValid(true);
      setError(null);
      setOutput(formatJson(input, indentSize));
      showToast('Valid JSON! ✓');
    } else {
      setIsValid(false);
      setError(validation.error!);
      showToast('Invalid JSON ✗', 'error');
    }
  }, [input, indentSize, showToast]);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setOutput(formatJson(SAMPLE_JSON, indentSize));
    setError(null);
    setIsValid(true);
    showToast('Loaded sample JSON!');
  }, [indentSize, showToast]);

  const handleDownload = useCallback(() => {
    const textToDownload = output || input;
    if (!textToDownload.trim()) {
      showToast('Nothing to download', 'info');
      return;
    }
    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded JSON file!');
  }, [output, input, showToast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInput(content);
        try {
          setOutput(formatJson(content, indentSize));
          setError(null);
          setIsValid(true);
          showToast(`Loaded ${file.name}`);
        } catch {
          const v = validateJson(content);
          setError(v.error || null);
          setIsValid(false);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setIsValid(null);
  }, []);

  const stats = (input.trim() || output.trim()) ? getJsonStats(output || input) : null;

  return (
    <ToolLayout>
      {/* Action Toolbar */}
      <div className="tool-actions">
        <button className="btn btn-primary" onClick={handleFormat}>
          <Sparkles className="btn-icon" />
          Format
        </button>
        <button className="btn btn-secondary" onClick={handleMinify}>
          <Minimize2 className="btn-icon" />
          Minify
        </button>
        <button className="btn btn-secondary" onClick={handleValidate}>
          <CheckCircle className="btn-icon" />
          Validate
        </button>

        {/* Sort Keys */}
        <button className="btn btn-secondary" onClick={() => handleSortKeys('asc')} title="Sort keys alphabetically (A-Z)">
          <ArrowDownAZ className="btn-icon" />
          Sort Keys
        </button>

        {/* Indent Selector */}
        <select
          className="mode-toggle-select"
          value={indentSize}
          onChange={(e) => {
            const val = e.target.value === 'tab' ? 'tab' : Number(e.target.value);
            setIndentSize(val);
            if (output && isValid) {
              try {
                setOutput(formatJson(input, val));
              } catch {}
            }
          }}
          title="Indentation size"
        >
          <option value={2}>2 Spaces</option>
          <option value={4}>4 Spaces</option>
          <option value="tab">1 Tab</option>
        </select>

        {/* Sample */}
        <button className="btn btn-ghost btn-sm" onClick={handleLoadSample} title="Load sample JSON">
          <FileCode className="btn-icon" />
          Sample
        </button>

        {/* Upload */}
        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }} title="Upload .json file">
          <Upload className="btn-icon" />
          <input type="file" accept=".json,application/json,text/plain" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        {/* Download */}
        {(output || input) && (
          <button className="btn btn-ghost btn-sm" onClick={handleDownload} title="Download formatted .json">
            <Download className="btn-icon" />
          </button>
        )}

        <button className="btn btn-ghost btn-sm" onClick={handleClear} title="Clear all">
          <Trash2 className="btn-icon" />
        </button>

        {output && <CopyButton text={output} />}
      </div>

      {/* Validation Status & Stats */}
      {isValid === true && (
        <div className="success-display">
          <CheckCircle style={{ width: 13, height: 13 }} />
          <span>Valid JSON</span>
          {stats && (
            <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.85 }}>
              {stats.keys} keys · depth {stats.depth} · {stats.arrayItems} array items · {stats.size}
            </span>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-display">
          <AlertCircle className="error-display-icon" />
          <div className="error-display-text">
            <div>❌ Invalid JSON: {error.message}</div>
            <div className="error-display-location">
              Line {error.line}, Column {error.column}
            </div>
          </div>
        </div>
      )}

      {/* Main Split Panels */}
      <div className="tool-split">
        {/* Left Panel: Input with Line Numbers */}
        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Input (with Line Numbers)</span>
            {input && (
              <span className="tool-panel-label-count">
                {new TextEncoder().encode(input).length} bytes · {input.split('\n').length} lines
              </span>
            )}
          </div>
          <CodeEditorWithLines
            value={input}
            onChange={(val) => {
              setInput(val);
              setError(null);
              setIsValid(null);
            }}
            errorLine={error?.line}
            placeholder='Paste JSON here...&#10;&#10;Example: {"name": "DevBox", "version": 1}'
          />
        </div>

        {/* Right Panel: Multiple Views (Code, Tree, Form, Text) */}
        <div className="tool-panel">
          <div className="tool-panel-label">
            <span>Output</span>

            {/* View Mode Switcher (Code | Tree | Form | Text) like jsonformatter.org */}
            <div className="mode-toggle" style={{ marginLeft: 'auto' }}>
              <button
                className={`mode-toggle-btn ${viewMode === 'code' ? 'active' : ''}`}
                onClick={() => setViewMode('code')}
                title="Formatted Code View"
              >
                <Code2 style={{ width: 11, height: 11, marginRight: 2 }} />
                Code
              </button>
              <button
                className={`mode-toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
                onClick={() => setViewMode('tree')}
                title="Collapsible Tree View"
              >
                <FolderTree style={{ width: 11, height: 11, marginRight: 2 }} />
                Tree
              </button>
              <button
                className={`mode-toggle-btn ${viewMode === 'form' ? 'active' : ''}`}
                onClick={() => setViewMode('form')}
                title="Form / Key-Value Grid View"
              >
                <Table style={{ width: 11, height: 11, marginRight: 2 }} />
                Form
              </button>
              <button
                className={`mode-toggle-btn ${viewMode === 'text' ? 'active' : ''}`}
                onClick={() => setViewMode('text')}
                title="Plain Text View"
              >
                <FileText style={{ width: 11, height: 11, marginRight: 2 }} />
                Text
              </button>
            </div>
          </div>

          {/* Render Active View */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {viewMode === 'code' && (
              <CodeEditorWithLines
                value={output}
                readOnly
                highlightSyntax
                highlightedHtml={highlightedOutput}
                placeholder="Formatted code will appear here with syntax highlighting..."
              />
            )}

            {viewMode === 'tree' && (
              <JsonTreeView data={parsedData} />
            )}

            {viewMode === 'form' && (
              <JsonFormView jsonString={output || input} />
            )}

            {viewMode === 'text' && (
              <CodeEditorWithLines
                value={output || input}
                readOnly
                placeholder="Plain text output..."
              />
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
