#!/bin/bash

# Base URL from environment variable or default
BASE_URL=${1:-"https://github-repository-search-cyan.vercel.app"}

echo "Running performance tests against: $BASE_URL"

# Create reports directory if it doesn't exist
mkdir -p tests/performance/reports

# Define pages to test
PAGES=(
  "/"
  "/?q=next.js"
  "/repos/vercel/next.js"
)

# Output filenames
NAMES=(
  "home"
  "search"
  "detail"
)

for i in "${!PAGES[@]}"; do
  PAGE="${PAGES[$i]}"
  NAME="${NAMES[$i]}"
  URL="${BASE_URL}${PAGE}"
  
  echo "Testing $NAME: $URL"
  
  pnpm exec lighthouse "$URL" \
    --output html \
    --output-path "./tests/performance/reports/report-${NAME}.html" \
    --chrome-flags="--headless --no-sandbox --disable-gpu" \
    --only-categories=performance,accessibility,best-practices,seo
done

echo "Performance tests completed. Reports are in tests/performance/reports/"
