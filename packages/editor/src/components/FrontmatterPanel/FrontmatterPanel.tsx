import { useState } from 'react';
import type { EditorConfig, FrontmatterField } from '@qwq-net/core';

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

    case 'date':
      return (
        <input
          id={id}
          type="date"
          className="qwq-fm-input"
          value={typeof value === 'string' ? value.slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

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

    case 'image':
      return (
        <input
          id={id}
          type="text"
          className="qwq-fm-input"
          placeholder="画像のパスまたはURL"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

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
