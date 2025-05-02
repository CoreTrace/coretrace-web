#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd server
npm install
npm run dev &
SERVER_PID=$!

# Start the frontend development server
echo "Starting frontend development server..."
cd ../client
npm install
npm start &
CLIENT_PID=$!

# Function to kill processes on exit
function cleanup {
  echo "Shutting down servers..."
  kill $SERVER_PID
  kill $CLIENT_PID
}

# Register the cleanup function to be called on exit
trap cleanup EXIT

# Wait for user input
echo "Development servers are running. Press Ctrl+C to stop."
wait
