# Contributing

Thanks for helping improve Template Builder. Bug reports, new validation rules, provider adapters and docs fixes are all welcome.

## Setup

1. Install Node.js (version in `.nvmrc`) and enable pnpm with `corepack enable`.
2. Fork and clone the repository.
3. Run `pnpm install`.

## Commands

| Command          | What it does                 |
| ---------------- | ---------------------------- |
| `pnpm build`     | Builds every package         |
| `pnpm dev`       | Rebuilds packages on change  |
| `pnpm lint`      | Runs ESLint                  |
| `pnpm typecheck` | Runs the TypeScript compiler |
| `pnpm format`    | Formats files with Prettier  |

## Pull requests

- Open an issue first for large changes, so we can agree on the approach.
- Keep one change per pull request.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`, `chore:`).
- If your change affects a published package, run `pnpm changeset` and commit the generated file.
- Make sure `pnpm lint`, `pnpm typecheck` and `pnpm build` pass.

## Meta rule changes

Meta changes template rules from time to time. If a template is rejected or accepted in a way that disagrees with `validate`, open an issue with the template JSON and the error message you received.

## Windows

`CLAUDE.md` is a symbolic link to `AGENTS.md`. On Windows, run `git config core.symlinks true` before cloning, or the link becomes a plain text file.
