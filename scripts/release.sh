#!/usr/bin/env bash
# Publishes the three packages at the version named by a tag: `scripts/release.sh v0.2.0-beta.1`.
# A stable version goes to the `latest` dist-tag; a prerelease goes to its identifier
# (`beta`, `alpha`, `rc`), so `npm i` never picks it up by accident.
# DRY_RUN=1 packs and runs `npm publish --dry-run` without uploading.
set -euo pipefail

tag="${1:?usage: scripts/release.sh v<version>}"
version="${tag#v}"

if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$ ]]; then
  echo "error: '$tag' is not v<semver>" >&2
  exit 1
fi

if [[ "$version" == *-* ]]; then
  dist_tag="${version#*-}"
  dist_tag="${dist_tag%%.*}"
  # npm rejects dist-tags that parse as a version range, like `1`.
  [[ "$dist_tag" =~ ^[0-9] ]] && dist_tag="next"
else
  dist_tag="latest"
  # Only commits already on main can become `latest`; test tags may come from any branch.
  git fetch --quiet origin main
  if ! git merge-base --is-ancestor HEAD origin/main; then
    echo "error: stable tag $tag must point to a commit on main" >&2
    exit 1
  fi
fi

root="$(git rev-parse --show-toplevel)"
cd "$root"
out="$root/.release"
rm -rf "$out"
mkdir -p "$out"

# The tarballs carry the tag's version, so a test tag needs no release commit.
packages=(template-builder template-builder-react template-builder-vue)
trap 'git checkout --quiet -- "${packages[@]/#/packages/}"; rm -f packages/*/README.md' EXIT

for package in "${packages[@]}"; do
  (cd "packages/$package" && npm version "$version" --no-git-tag-version --allow-same-version >/dev/null)
done

pnpm turbo run build --filter="./packages/*"

# npm shows the README inside each tarball: every package gets the repository README.
for package in "${packages[@]}"; do
  cp README.md "packages/$package/README.md"
done

# pnpm pack rewrites `workspace:*` to the real version; npm publish then handles OIDC and provenance.
for package in "${packages[@]}"; do
  (cd "packages/$package" && pnpm pack --pack-destination "$out" >/dev/null)
done

flags=(--access public --tag "$dist_tag")
[[ "${DRY_RUN:-}" == "1" ]] && flags+=(--dry-run)

# Core first: the framework packages depend on it.
for package in "${packages[@]}"; do
  npm publish "$out/talqui-oss-$package-$version.tgz" "${flags[@]}"
done

echo "published $version as '$dist_tag'"

# A copy on GitHub Packages lists the packages on the repository page. npm stays the source of
# truth, so a failure here only warns. The npmrc reads the token from the environment.
if [[ -n "${GITHUB_PACKAGES_TOKEN:-}" ]]; then
  echo '//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}' >"$out/.npmrc"
  for package in "${packages[@]}"; do
    npm publish "$out/talqui-oss-$package-$version.tgz" "${flags[@]}" \
      --registry https://npm.pkg.github.com --userconfig "$out/.npmrc" --provenance=false ||
      echo "::warning::GitHub Packages publish failed for $package"
  done
fi
