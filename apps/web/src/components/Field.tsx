import { useId, type ReactNode } from "react";

type FieldProps = {
  label: string;
  /** Right-aligned note next to the label, such as a character count. */
  hint?: string;
  children: (id: string) => ReactNode;
};

/** Label and control, wired together with a generated id. */
export function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  return (
    <div className="pg-field">
      <div className="pg-field__head">
        <label className="pg-field__label" htmlFor={id}>
          {label}
        </label>
        {hint && <span className="pg-field__hint">{hint}</span>}
      </div>
      {children(id)}
    </div>
  );
}

type Option<T extends string> = { value: T; label: string };

export function Select<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <select
      id={id}
      className="pg-input pg-input--select"
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
