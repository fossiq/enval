#!/usr/bin/env sh

# Get list of staged files (only TypeScript, JavaScript, and JSON files)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json)$')

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

echo "🔍 Running Biome linter on staged files..."

# Run biome check on staged files
echo "$STAGED_FILES" | xargs bunx @biomejs/biome check --write --no-errors-on-unmatched --files-ignore-unknown=true

# Capture exit code
BIOME_EXIT=$?

if [ $BIOME_EXIT -ne 0 ]; then
  echo "❌ Biome found issues. Attempting to fix..."
fi

# Add the fixed files back to staging
echo "$STAGED_FILES" | xargs git add

if [ $BIOME_EXIT -ne 0 ]; then
  echo "✅ Fixed and re-staged files. Please review the changes."
fi

exit 0
