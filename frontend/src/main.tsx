import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// The full compiled bundle is ~227 KB of the ~331 KB CSS output, against
// actual usage of a dozen utility classes (d-flex/gap-*/mb-*/btn btn-link)
// across the app -- everything else is the bespoke rh-* design system.
// Deliberate for now, not an oversight: CLAUDE.md §3 fixes Bootstrap as
// the stack (dropping it outright is a stack decision, not a free call),
// and a scoped Sass build (functions/variables/mixins + only the
// utilities actually used) needs a full visual regression pass across
// every screen to confirm nothing relies on a reset/rule outside that
// scope -- worth doing as its own reviewed PR, not folded into an
// unrelated fix.
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
