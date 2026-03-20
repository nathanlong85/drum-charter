#!/bin/bash

# Definition of Done Verification Script for DrumCharter

echo "🔍 Starting Definition of Done verification..."

# 1. Linting
echo "🧹 Running Biome linting..."
pnpm lint
if [ $? -ne 0 ]; then
  echo "❌ Biome linting failed."
  exit 1
fi

echo "📝 Running Markdown linting..."
pnpm lint:md
if [ $? -ne 0 ]; then
  echo "❌ Markdown linting failed."
  exit 1
fi

# 2. Unit Tests
echo "🧪 Running Vitest unit tests..."
pnpm test run
if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed."
  exit 1
fi

# 3. E2E Tests (Scoped to project if possible, otherwise full)
echo "🎭 Running Playwright E2E tests (chromium)..."
RUN_OFFLINE_E2E=true pnpm test:e2e --project=chromium
if [ $? -ne 0 ]; then
  echo "❌ E2E tests failed."
  exit 1
fi

echo "✅ All verification checks passed! You are officially 'Done'."
exit 0
