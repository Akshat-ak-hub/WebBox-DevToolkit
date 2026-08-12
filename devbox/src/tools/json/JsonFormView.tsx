import React, { useState, useMemo } from 'react';
import { flattenJson, type FlatJsonProperty } from './jsonUtils';
import { Search, Copy, Check } from 'lucide-react';
import { useToast } from '../../components/Toast';

interface JsonFormViewProps {
  jsonString: string;
}

export function JsonFormView({ jsonString }: JsonFormViewProps) {
  const [search, setSearch] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const { showToast } = useToast();

  const properties = useMemo(() => {
    return flattenJson(jsonString);
  }, [jsonString]);

  const filteredProperties = useMemo(() => {
    if (!search.trim()) return properties;
    const q = search.toLowerCase();
    return properties.filter(
      (p) =>
        p.path.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        String(p.value).toLowerCase().includes(q)
    );
  }, [properties, search]);

  const handleCopy = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    showToast(`Copied ${path}`);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  const getTypeBadgeClass = (type: FlatJsonProperty['type']) => {
    switch (type) {
      case 'string':
        return 'type-badge-str';
      case 'number':
        return 'type-badge-num';
      case 'boolean':
        return 'type-badge-bool';
      case 'null':
        return 'type-badge-null';
      case 'array':
        return 'type-badge-arr';
      default:
        return 'type-badge-obj';
    }
  };

  return (
    <div className="json-form-container">
      {/* Search Header */}
      <div className="json-form-search">
        <Search style={{ width: 11, height: 11, color: 'var(--text-muted)' }} />
        <input
          className="input-field"
          style={{ width: '100%', fontSize: 10, height: 24, border: 'none', background: 'transparent' }}
          placeholder="Filter properties, keys, or paths..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filteredProperties.length} fields
        </span>
      </div>

      {/* Property Table / Grid */}
      <div className="json-form-table-wrapper">
        <table className="json-form-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Path / Key</th>
              <th style={{ width: '15%' }}>Type</th>
              <th style={{ width: '45%' }}>Value</th>
              <th style={{ width: '5%' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((prop) => (
                <tr key={prop.path}>
                  <td className="cell-path">
                    <span className="prop-path" title={prop.path}>
                      {prop.path}
                    </span>
                  </td>
                  <td>
                    <span className={`type-badge ${getTypeBadgeClass(prop.type)}`}>
                      {prop.type}
                    </span>
                  </td>
                  <td className="cell-val">
                    <span className="prop-val" title={String(prop.value)}>
                      {prop.value === null ? 'null' : String(prop.value)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="tree-copy-btn"
                      onClick={() => handleCopy(String(prop.value), prop.path)}
                      title="Copy value"
                    >
                      {copiedPath === prop.path ? (
                        <Check style={{ width: 10, height: 10, color: 'var(--success)' }} />
                      ) : (
                        <Copy style={{ width: 10, height: 10 }} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16 }}>
                  No properties match filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
