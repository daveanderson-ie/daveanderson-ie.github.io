#!/usr/bin/env bash
# Prints the site pages to check for a PR, one path per line.
# Usage: pages.sh <base-sha> <head-sha>
# - Changed .html files outside vendor/, assets/, include/, docs/ are checked.
# - If shared site assets changed (css/, js/, img/, images/, style.css), every public page is checked.
set -euo pipefail
base="$1"; head="$2"

public_pages() {
  git ls-files '*.html' \
    | grep -Ev '^(vendor|assets|include|docs|node_modules|\.github)/' \
    | grep -Ev '^google[0-9a-f]+\.html$'
}

changed=$(git diff --name-only --diff-filter=ACMR "$base" "$head")

{
  echo "$changed" | grep -E '\.html$' \
    | grep -Ev '^(vendor|assets|include|docs|node_modules|\.github)/' \
    | grep -Ev '^google[0-9a-f]+\.html$' || true
  if echo "$changed" | grep -Eq '^(css|js|img|images)/|^style\.css$'; then
    public_pages
  fi
} | sed '/^$/d' | sort -u
