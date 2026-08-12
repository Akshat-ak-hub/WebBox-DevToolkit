import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Search, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '../../components/Toast';

interface JsonTreeViewProps {
  data: unknown;
}

interface TreeNodeProps {
  name: string | number;
  value: unknown;
  depth?: number;
  searchFilter?: string;
  isLast?: boolean;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (path: string) => void;
  currentPath: string;
}

function TreeNode({
  name,
  value,
  depth = 0,
  searchFilter = '',
  expandedMap,
  onToggleExpand,
  currentPath,
}: TreeNodeProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const isExpanded = expandedMap[currentPath] !== false; // default open

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(str);
    setCopied(true);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 1500);
  };

  // Render Primitive Values
  const renderPrimitive = (val: unknown) => {
    if (val === null) return <span className="tree-val-null">null</span>;
    if (typeof val === 'boolean') return <span className="tree-val-bool">{String(val)}</span>;
    if (typeof val === 'number') return <span className="tree-val-num">{val}</span>;
    if (typeof val === 'string') return <span className="tree-val-str">"{val}"</span>;
    return <span className="tree-val-unknown">{String(val)}</span>;
  };

  // Filter check
  const matchesSearch = () => {
    if (!searchFilter) return true;
    const filter = searchFilter.toLowerCase();
    const nameStr = String(name).toLowerCase();
    if (nameStr.includes(filter)) return true;
    if (!isExpandable && String(value).toLowerCase().includes(filter)) return true;
    return false;
  };

  if (searchFilter && !matchesSearch() && !isExpandable) {
    return null;
  }

  const childEntries = isObject
    ? Object.entries(value as Record<string, unknown>)
    : isArray
    ? (value as unknown[]).map((v, i) => [i, v] as [number, unknown])
    : [];

  return (
    <div className="tree-node" style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
      <div
        className="tree-node-row"
        onClick={() => isExpandable && onToggleExpand(currentPath)}
      >
        {/* Expand / Collapse Icon */}
        {isExpandable ? (
          <span className="tree-toggle-icon">
            {isExpanded ? <ChevronDown style={{ width: 12, height: 12 }} /> : <ChevronRight style={{ width: 12, height: 12 }} />}
          </span>
        ) : (
          <span className="tree-toggle-spacer" />
        )}

        {/* Key / Property Name */}
        <span className="tree-key">{name}:</span>

        {/* Expandable summary or primitive value */}
        {isExpandable ? (
          <span className="tree-summary">
            {isArray ? `Array(${childEntries.length}) [` : `Object {`}
            {!isExpanded && (
              <span className="tree-collapsed-preview">
                {isArray ? ` ... ]` : ` ${childEntries.length} keys }`}
              </span>
            )}
          </span>
        ) : (
          <span className="tree-value">{renderPrimitive(value)}</span>
        )}

        {/* Copy button on hover */}
        <button
          className="tree-copy-btn"
          onClick={handleCopyValue}
          title="Copy value"
        >
          {copied ? <Check style={{ width: 10, height: 10, color: 'var(--success)' }} /> : <Copy style={{ width: 10, height: 10 }} />}
        </button>
      </div>

      {/* Children */}
      {isExpandable && isExpanded && (
        <div className="tree-node-children">
          {childEntries.map(([childKey, childVal]) => (
            <TreeNode
              key={String(childKey)}
              name={childKey}
              value={childVal}
              depth={depth + 1}
              searchFilter={searchFilter}
              expandedMap={expandedMap}
              onToggleExpand={onToggleExpand}
              currentPath={`${currentPath}.${childKey}`}
            />
          ))}
          <div className="tree-closing-bracket" style={{ paddingLeft: 16 }}>
            {isArray ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  );
}

export function JsonTreeView({ data }: JsonTreeViewProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const handleToggleExpand = (path: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [path]: prev[path] === false ? true : false,
    }));
  };

  const handleExpandAll = () => {
    setExpandedMap({}); // default is expanded
  };

  const handleCollapseAll = () => {
    // collapse root and all
    const allCollapsed: Record<string, boolean> = { root: false };
    if (data && typeof data === 'object') {
      const markCollapsed = (obj: unknown, path: string) => {
        allCollapsed[path] = false;
        if (obj && typeof obj === 'object') {
          for (const [k, v] of Object.entries(obj)) {
            markCollapsed(v, `${path}.${k}`);
          }
        }
      };
      markCollapsed(data, 'root');
    }
    setExpandedMap(allCollapsed);
  };

  return (
    <div className="json-tree-container">
      {/* Tree Toolbar */}
      <div className="json-tree-toolbar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            style={{
              position: 'absolute',
              left: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 11,
              height: 11,
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="input-field"
            style={{ width: '100%', paddingLeft: 22, paddingRight: 6, fontSize: 10, height: 24 }}
            placeholder="Search keys & values in tree..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 3 }}>
          <button className="btn btn-sm btn-secondary" onClick={handleExpandAll} title="Expand all nodes">
            <Maximize2 style={{ width: 10, height: 10 }} />
            Expand
          </button>
          <button className="btn btn-sm btn-secondary" onClick={handleCollapseAll} title="Collapse all nodes">
            <Minimize2 style={{ width: 10, height: 10 }} />
            Collapse
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="json-tree-content">
        {data !== undefined && data !== null ? (
          <TreeNode
            name="root"
            value={data}
            searchFilter={searchFilter}
            expandedMap={expandedMap}
            onToggleExpand={handleToggleExpand}
            currentPath="root"
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: 12 }}>
            No valid JSON to display in tree view.
          </div>
        )}
      </div>
    </div>
  );
}
