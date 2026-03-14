import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import type { SlashCommand } from '../../extensions/SlashExtension.js';

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashMenuProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + items.length - 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'Enter') {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  useEffect(() => setSelectedIndex(0), [items]);

  if (items.length === 0) {
    return (
      <div className="qwq-slash-menu">
        <div className="qwq-slash-empty">コマンドが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="qwq-slash-menu">
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          className={`qwq-slash-item ${index === selectedIndex ? 'is-selected' : ''}`}
          onClick={() => command(item)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="qwq-slash-item-title">{item.title}</div>
          <div className="qwq-slash-item-desc">{item.description}</div>
        </button>
      ))}
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';
