import type { ReactNode } from "react";

type CardProps = {
  /** Small monospaced label above the title, e.g. "01". */
  index?: string;
  title: string;
  /** Controls shown on the right of the title row. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({
  index,
  title,
  actions,
  children,
  className,
}: CardProps) {
  return (
    <section className={["pg-card", className].filter(Boolean).join(" ")}>
      <header className="pg-card__head">
        <h2 className="pg-card__title">
          {index && <span className="pg-card__index">{index}</span>}
          {title}
        </h2>
        {actions}
      </header>
      <div className="pg-card__body">{children}</div>
    </section>
  );
}
