import { useState } from 'react';
import type { EditorConfig, FrontmatterField } from '@qwq-net/core';

/** Normalize a date value (string, Date, or unknown) to JST yyyy-MM-dd */
function normalizeDateToJST(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  }
  if (typeof value === 'string') {
    // Already yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // ISO string or other parseable format
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    }
    return value.slice(0, 10);
  }
  return '';
}

interface FrontmatterPanelProps {
  config: EditorConfig;
  frontmatter: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
}

export function FrontmatterPanel({ config, frontmatter, onChange }: FrontmatterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const fields = config.frontmatter;

  if (!fields || Object.keys(fields).length === 0) return null;

  const update = (key: string, value: unknown) => {
    onChange({ ...frontmatter, [key]: value });
  };

  return (
    <div className="qwq-frontmatter-panel">
      <button
        type="button"
        className="qwq-frontmatter-toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className={`qwq-frontmatter-arrow ${isOpen ? 'is-open' : ''}`}>▶</span>
        <span>メタデータ</span>
      </button>

      {isOpen && (
        <div className="qwq-frontmatter-fields">
          {Object.entries(fields).map(([key, field]) => (
            <FieldInput
              key={key}
              fieldKey={key}
              field={field}
              value={frontmatter[key]}
              onChange={(v) => update(key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FieldInputProps {
  fieldKey: string;
  field: FrontmatterField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FieldInput({ fieldKey, field, value, onChange }: FieldInputProps) {
  const id = `qwq-fm-${fieldKey}`;

  return (
    <div className="qwq-fm-field">
      <label htmlFor={id} className="qwq-fm-label">
        {field.label}
        {field.required && <span className="qwq-fm-required">*</span>}
      </label>
      <FieldControl id={id} field={field} value={value} onChange={onChange} />
    </div>
  );
}

interface FieldControlProps {
  id: string;
  field: FrontmatterField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FieldControl({ id, field, value, onChange }: FieldControlProps) {
  switch (field.type) {
    case 'string':
      return (
        <input
          id={id}
          type="text"
          className="qwq-fm-input"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'date': {
      // Normalize date value to yyyy-MM-dd (JST)
      const dateStr = normalizeDateToJST(value);
      return (
        <div className="qwq-fm-date-field">
          <input
            id={id}
            type="text"
            className="qwq-fm-input qwq-fm-date-display"
            value={dateStr}
            onChange={(e) => {
              // Allow direct text editing in yyyy-MM-dd format
              onChange(e.target.value);
            }}
            placeholder="yyyy-MM-dd"
            pattern="\d{4}-\d{2}-\d{2}"
          />
          <input
            type="date"
            className="qwq-fm-date-picker"
            value={dateStr}
            onChange={(e) => onChange(e.target.value)}
            tabIndex={-1}
            aria-label={`${field.label} date picker`}
          />
        </div>
      );
    }

    case 'boolean':
      return (
        <input
          id={id}
          type="checkbox"
          className="qwq-fm-checkbox"
          checked={typeof value === 'boolean' ? value : false}
          onChange={(e) => onChange(e.target.checked)}
        />
      );

    case 'image': {
      const imgPath = typeof value === 'string' ? value : '';
      return (
        <div className="qwq-fm-image-field">
          <div className="qwq-fm-image-preview">
            {imgPath ? (
              <img src={imgPath} alt="preview" className="qwq-fm-image-thumb" />
            ) : (
              <svg
                viewBox="0 0 320 180"
                className="qwq-fm-image-placeholder"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="320" height="180" fill="#f7f6f3" />
                <rect x="130" y="50" width="60" height="50" rx="4" fill="#e3e2de" />
                <circle cx="145" cy="65" r="6" fill="#d4d3d0" />
                <polygon points="130,100 155,75 180,100" fill="#d4d3d0" />
                <polygon points="155,100 170,82 190,100" fill="#c8c7c4" />
                <text x="160" y="125" textAnchor="middle" fill="#9b9a97" fontSize="11" fontFamily="system-ui, sans-serif">
                  Hero Image
                </text>
              </svg>
            )}
          </div>
          <input
            id={id}
            type="text"
            className="qwq-fm-input"
            placeholder="画像のパスまたはURL"
            value={imgPath}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }

    case 'tags': {
      const selectedTags = Array.isArray(value) ? (value as string[]) : [];
      const toggleTag = (tag: string) => {
        const next = selectedTags.includes(tag)
          ? selectedTags.filter((t) => t !== tag)
          : [...selectedTags, tag];
        onChange(next);
      };
      return (
        <div className="qwq-fm-tags" id={id}>
          {field.options.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`qwq-fm-tag ${selectedTags.includes(tag) ? 'is-selected' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
