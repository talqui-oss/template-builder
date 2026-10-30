# AGENTS.md

> If a `TALQUI_GUIDELINES.md` file exists at the repository root, read it before doing anything else. It is mandatory for maintainers.

## Project

Template Builder is an open source SDK to preview, validate and create WhatsApp message templates. A template is a plain JSON object. The core package validates it, turns it into a preview model and builds the creation request for each provider (Meta Cloud API, Twilio, Talqui). Framework packages render the preview.

## Commands

```bash
pnpm install     # install dependencies (Node version in .nvmrc)
pnpm build       # build every package
pnpm dev         # rebuild on change
pnpm lint        # ESLint
pnpm typecheck   # TypeScript
pnpm format      # Prettier
pnpm changeset   # describe a change to a published package
```

## Layout

| Path                              | Contents                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/template-builder`       | Core: types, JSON Schema, `validate`, adapters, `toCurl`, preview model, styles. Zero runtime dependencies |
| `packages/template-builder-react` | `<TemplatePreview />` for React                                                                            |
| `packages/template-builder-vue`   | `<TemplatePreview />` for Vue                                                                              |
| `packages/tsconfig`               | Shared TypeScript config                                                                                   |
| `apps/web`                        | template-builder.dev: playground, examples gallery and docs                                                |
| `examples/`                       | One folder per provider and framework                                                                      |
| `skills/`                         | Skill for coding agents                                                                                    |

## Conventions

- Everything tracked is in English: code, comments, docs, commits and PRs.
- Use the names from Meta's template API (`QUICK_REPLY`, `MARKETING`, `pt_BR`). No DSL, no builder classes.
- The core package has no runtime dependencies. React and Vue are peer dependencies of their own packages.
- The SDK never calls provider APIs and never stores credentials. Generated `curl` commands use placeholders.
- Conventional Commits (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`). Add a changeset when a published package changes.
- Tests only when a task asks for them.
