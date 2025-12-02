#!/bin/bash
echo "Cleaning up ports..."
lsof -ti :3001 | xargs kill -9 2>/dev/null
lsof -ti :5173 | xargs kill -9 2>/dev/null
echo "Starting Biolift App (Backend + Frontend)..."
npm run dev:all
