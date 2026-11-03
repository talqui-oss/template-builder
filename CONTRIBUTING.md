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
- Make sure `pnpm lint`, `pnpm typecheck` and `pnpm build` pass.

## Releasing

Maintainers publish by pushing a tag. The [release workflow](.github/workflows/release.yml) builds the packages at the tag's version and publishes them to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers), with provenance and no npm token.

| Tag             | npm dist-tag | Install with                              |
| --------------- | ------------ | ----------------------------------------- |
| `v0.2.0`        | `latest`     | `npm i @talqui-oss/template-builder`      |
| `v0.2.0-beta.1` | `beta`       | `npm i @talqui-oss/template-builder@beta` |

Prerelease tags can point to any branch, to try a version before merging. Stable tags must point to a commit on `main`. The `version` field in each `package.json` stays `0.0.0`; the version lives in the tag.

```bash
git tag v0.2.0-beta.1 && git push origin v0.2.0-beta.1
```

Run `DRY_RUN=1 scripts/release.sh v0.2.0-beta.1` to see what would be published.

## Meta rule changes

Meta changes template rules from time to time. If a template is rejected or accepted in a way that disagrees with `validate`, open an issue with the template JSON and the error message you received.

## Windows

`CLAUDE.md` is a symbolic link to `AGENTS.md`. On Windows, run `git config core.symlinks true` before cloning, or the link becomes a plain text file.
