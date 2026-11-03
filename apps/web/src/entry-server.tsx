// Build-time entry: renders each page to static HTML so crawlers get the content without JS.
import { renderToString } from "react-dom/server";
import { allPaths, resolveRoute, SITE } from "./routes";

export { allPaths, SITE };
export {
  CATALOG,
  INDUSTRIES,
  USE_CASES,
  CATEGORIES,
  templateText,
  templatePath,
} from "./catalog/data";

export function render(path: string) {
  const { head, element } = resolveRoute(path);
  return { head, html: renderToString(element) };
}
