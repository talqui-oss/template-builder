import { useRef, type KeyboardEvent } from "react";

export type SegmentItem<T extends string> = {
  id: T;
  label: string;
  disabled?: boolean;
  /** Shown as a small tag next to the label, e.g. "Soon". */
  badge?: string;
};

type SegmentProps<T extends string> = {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

/**
 * Segmented control. Behaves as a radio group: one tab stop, arrow keys move
 * the selection, Home and End jump to the ends.
 */
export function Segment<T extends string>({
  items,
  value,
  onChange,
  label,
}: SegmentProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = items.filter((item) => !item.disabled);

  function onKeyDown(event: KeyboardEvent) {
    const index = enabled.findIndex((item) => item.id === value);
    const next = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: enabled.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = enabled[(next + enabled.length) % enabled.length]!;
    onChange(target.id);
    refs.current[items.indexOf(target)]?.focus();
  }

  return (
    <div
      className="pg-segment"
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            className="pg-segment__item"
            onClick={() => onChange(item.id)}
          >
            {item.label}
            {item.badge && (
              <span className="pg-segment__badge">{item.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
