#!/usr/bin/env bash
# E2B Sandbox Infrastructure Provisioning Script for Velocity Engine
set -e

echo "🚀 Provisioning E2B Cloud Sandbox Infrastructure for Velocity Engine..."

if ! command -v e2b &> /dev/null; then
    echo "📦 Installing E2B CLI..."
    npm install -g @e2b/cli
fi

if [ -z "$E2B_API_KEY" ]; then
    echo "⚠️  E2B_API_KEY is not set. Please set E2B_API_KEY in environment variables."
    exit 1
fi

echo "⚙️  Initializing E2B Node.js Sandbox Template..."
e2b template init --template nodejs-20

echo "✅ E2B Sandbox Infrastructure Provisioned Successfully!"
