#!/bin/bash
echo "🛑 Parando todos os processos Node/Vite..."
# Mata processos node, vite, ts-node
pkill -f "node"
pkill -f "vite"
pkill -f "ts-node"

# Garante que as portas estejam livres
echo "🧹 Limpando portas 3000-3005..."
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null
lsof -ti :3003 | xargs kill -9 2>/dev/null
lsof -ti :3004 | xargs kill -9 2>/dev/null
lsof -ti :3005 | xargs kill -9 2>/dev/null

echo "✅ Limpeza concluída."
echo "🚀 Iniciando BioLift..."

# Inicia backend e frontend
npm run dev:all
