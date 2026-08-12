import { useState, useCallback, useMemo } from 'react';
import { ToolLayout } from '../../components/ToolLayout';
import { CopyButton } from '../../components/CopyButton';
import { useToast } from '../../components/Toast';
import { parseColor, getContrastColor, type ColorValues } from './colorUtils';
import { Trash2, Pipette, Sparkles } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#111827', '#6b7280', '#ffffff',
];

interface ColorPickerProps {
  initialInput?: string;
}

export function ColorPicker({ initialInput = '' }: ColorPickerProps) {
  const initialValidColor = initialInput.trim() ? parseColor(initialInput.trim()) : null;
  const [input, setInput] = useState(initialValidColor ? initialInput.trim() : '#6366f1');
  const [color, setColor] = useState<ColorValues | null>(() => initialValidColor || parseColor('#6366f1'));
  const [isEyeDropperSupported] = useState(() => typeof window !== 'undefined' && 'EyeDropper' in window);
  const { showToast } = useToast();

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    const parsed = parseColor(val);
    if (parsed) setColor(parsed);
  }, []);

  const handlePreset = useCallback((hex: string) => {
    setInput(hex);
    setColor(parseColor(hex));
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setColor(null);
  }, []);

  // Web / Screen Eyedropper — hover over any element on the web to pick its color
  const handlePickFromWeb = useCallback(async () => {
    if (!('EyeDropper' in window)) {
      showToast('EyeDropper is not supported in this browser version.', 'error');
      return;
    }
    try {
      const EyeDropperClass = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
      const eyeDropper = new EyeDropperClass();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        const hex = result.sRGBHex;
        setInput(hex);
        const parsed = parseColor(hex);
        if (parsed) {
          setColor(parsed);
          showToast(`Picked ${hex.toUpperCase()} from screen!`);
        }
      }
    } catch (err: unknown) {
      // If user cancelled with ESC, do not show error
      const error = err as { name?: string };
      if (error?.name !== 'AbortError') {
        showToast('Could not sample color from screen', 'info');
      }
    }
  }, [showToast]);

  const contrastText = useMemo(() => {
    if (!color) return '#000000';
    return getContrastColor(color.hex);
  }, [color]);

  return (
    <ToolLayout>
      {/* Top Bar with Web Element Eyedropper Button */}
      <div className="tool-actions">
        {isEyeDropperSupported && (
          <button
            className="btn btn-primary"
            onClick={handlePickFromWeb}
            title="Click and hover over any element or pixel on your screen to extract its color"
            style={{ fontWeight: 600 }}
          >
            <Pipette className="btn-icon" />
            Pick from Web Page
          </button>
        )}

        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 className="btn-icon" />
          Clear
        </button>

        {isEyeDropperSupported && (
          <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Sparkles style={{ width: 10, height: 10, color: 'var(--accent-primary)' }} />
            Hover & click any web element
          </span>
        )}
      </div>

      {/* Color input + native picker */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={color?.hex || '#6366f1'}
          onChange={(e) => handleInputChange(e.target.value)}
          style={{
            width: 36, height: 32, padding: 0, border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none',
          }}
          title="Open color palette"
        />
        <input
          className="input-field"
          style={{ flex: 1 }}
          placeholder="Enter HEX (#6366f1), RGB (99, 102, 241), or HSL (239, 84%, 67%)..."
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Preset colors */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {PRESET_COLORS.map((hex) => (
          <button
            key={hex}
            onClick={() => handlePreset(hex)}
            style={{
              width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border-color)',
              background: hex, cursor: 'pointer', transition: 'transform 0.1s',
            }}
            title={hex}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ))}
      </div>

      {color && (
        <>
          {/* Large Color preview with high contrast label */}
          <div
            style={{
              height: 72, borderRadius: 'var(--radius-lg)', background: color.hex,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border-color)', fontSize: 16, fontWeight: 700,
              color: contrastText, fontFamily: 'var(--font-mono)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
            }}
          >
            {color.hex.toUpperCase()}
          </div>

          {/* 3 Formats Breakdown (HEX, RGB, HSL) with instant copy */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'HEX', value: color.hex.toUpperCase() },
              { label: 'RGB', value: color.rgbString },
              { label: 'HSL', value: color.hslString },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3, fontFamily: 'var(--font-sans)' }}>
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500 }}>
                    {value}
                  </span>
                  <CopyButton text={value} variant="icon" />
                </div>
              </div>
            ))}
          </div>

          {/* CSS Copy format */}
          <div
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
              {color.cssColor}
            </code>
            <CopyButton text={color.cssColor} label="Copy CSS" />
          </div>

          {/* Channel sliders/values */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { label: 'Red (R)', value: color.rgb.r },
              { label: 'Green (G)', value: color.rgb.g },
              { label: 'Blue (B)', value: color.rgb.b },
              { label: 'Hue (H)', value: `${color.hsl.h}°` },
              { label: 'Saturation (S)', value: `${color.hsl.s}%` },
              { label: 'Lightness (L)', value: `${color.hsl.l}%` },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 11,
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 10 }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
