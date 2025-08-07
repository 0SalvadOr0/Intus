#!/bin/bash

echo "🚀 Starting Intus Corleone Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    cp server-package.json package.json
    npm install
fi

# Create files/allegati directory if it doesn't exist
mkdir -p files/allegati

# Start the server
echo "🌟 Starting server on port 3001..."
echo "📁 Files will be saved to: files/allegati/"
echo "🔗 Upload endpoint: http://localhost:3001/api/upload-allegato"
echo "💻 Health check: http://localhost:3001/api/health"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

node server.js
