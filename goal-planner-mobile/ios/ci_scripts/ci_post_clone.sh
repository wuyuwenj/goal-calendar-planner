#!/bin/sh

# Xcode Cloud post-clone script
# This runs after the repository is cloned

set -e

echo "🍺 Installing Node.js via Homebrew..."
brew install node

echo "📦 Installing Node.js dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH/goal-planner-mobile"
npm install

echo "🍫 Installing CocoaPods..."
cd "$CI_PRIMARY_REPOSITORY_PATH/goal-planner-mobile/ios"
pod install

echo "✅ Post-clone setup complete!"
