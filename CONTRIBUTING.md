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

The [release workflow](.github/workflows/release.yml) publishes to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers), with provenance and no npm token. The three packages always share one version.

**Stable release**

1. On a branch from `main`, run `pnpm release`. It reads the Conventional Commits since the last tag, bumps the version (`fix` → patch, `feat` → minor, breaking change → major), updates `CHANGELOG.md` and commits `release: vX.Y.Z`. Use `pnpm release --release-as 1.0.0` to choose the version.
2. Open a pull request and merge it.
3. On `main`, the workflow sees a version without a tag, publishes it to `latest` and pushes the `vX.Y.Z` tag.

**Test release**

Push a prerelease tag from any branch. The workflow publishes that version under the prerelease name, so `npm i` keeps installing `latest`.

```bash
git tag v0.2.0-beta.1 && git push origin v0.2.0-beta.1
npm i @talqui-oss/template-builder@beta
```

Every release also gets a GitHub Release (notes from `CHANGELOG.md`, or the commit list for a prerelease) and a copy on GitHub Packages, so both show on the repository page.

Run `DRY_RUN=1 scripts/release.sh v0.2.0-beta.1` to see what would be published.

## Meta rule changes

Meta changes template rules from time to time. If a template is rejected or accepted in a way that disagrees with `validate`, open an issue with the template JSON and the error message you received.

## Windows

`CLAUDE.md` is a symbolic link to `AGENTS.md`. On Windows, run `git config core.symlinks true` before cloning, or the link becomes a plain text file.
