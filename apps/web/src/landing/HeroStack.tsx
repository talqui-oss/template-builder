import { useEffect, useState } from "react";
import { CATEGORIES, categorySlug, facetLabel } from "../catalog/data";
import { EXAMPLES } from "../examples";
import { ChatScreen } from "./parts";

/** Time each template stays in front of the stack. */
const CYCLE_MS = 4000;

// Cards rendered around the front one: the one leaving (-1), the front (0) and three behind.
const BEHIND = 3;

/**
 * A stack of template cards. The front card shows a template; the glass cards behind it wait
 * their turn. Every cycle the front card slides out and the next one moves forward.
 */
export function HeroStack() {
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTurn((current) => current + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  // Keyed by turn number, not position, so each card keeps its element and CSS animates it
  // from one slot to the next.
  const cards = [];
  for (let offset = -1; offset <= BEHIND; offset++) {
    const number = turn + offset;
    if (number < 0) continue;
    cards.push({
      number,
      slot: offset,
      example: EXAMPLES[number % EXAMPLES.length]!,
    });
  }

  return (
    <div className="lp-stack" aria-hidden="true">
      {cards.map(({ number, slot, example }) => (
        <article
          key={number}
          className="lp-stack__card"
          data-slot={slot}
          style={{ zIndex: 10 - slot }}
        >
          <div className="lp-stack__content">
            <header className="lp-idcard__head">
              <span>Template</span>
              <span className="lp-idcard__badge">Approved</span>
            </header>
            <dl className="lp-idcard__meta">
              <div>
                <dt>Name</dt>
                <dd>{example.template.name}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>
                  {facetLabel(
                    CATEGORIES,
                    categorySlug(example.template.category),
                  )}
                </dd>
              </div>
              <div>
                <dt>Language</dt>
                <dd>{example.template.language}</dd>
              </div>
            </dl>
            <ChatScreen
              template={example.template}
              className="lp-screen--hero"
            />
          </div>
        </article>
      ))}
    </div>
  );
}
