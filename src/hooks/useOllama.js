import { useState, useEffect } from 'react'
import { ollamaService } from '../services/ollamaService'
import toast from 'react-hot-toast'

export const useOllama = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const connected = await ollamaService.testConnection()
      setIsConnected(connected)
      
      if (connected) {
        toast.success('🤖 Ollama AI connected!')
      } else {
        toast.error('⚠️ Ollama not found. Using fallback stories.')
      }
    } catch (error) {
      setIsConnected(false)
      toast.error('⚠️ Ollama connection failed. Using fallback stories.')
    } finally {
      setIsChecking(false)
    }
  }

  return {
    isConnected,
    isChecking,
    checkConnection
  }
}

// Setup Instructions (README.md content)
const setupInstructions = `
# Horror Apocalypse Game - React + Vite + Ollama

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup Ollama
1. Install Ollama: https://ollama.ai/
2. Pull a model (recommended: llama2, codellama, or mistral):
\`\`\`bash
ollama pull llama2
\`\`\`
3. Start Ollama server:
\`\`\`bash
ollama serve
\`\`\`

### 3. Configure the Game
Edit \`src/services/ollamaService.js\`:
- Change \`this.model = 'llama2'\` to your preferred model
- Adjust API endpoint if needed

### 4. Run the Game
\`\`\`bash
npm run dev
\`\`\`

## Features

### ✅ Completed Features
- React + Vite setup
- User authentication with localStorage
- Dynamic character generation (10 mythical species)
- Real-time timer (30 minutes)
- Open-world location system
- User input processing (no predefined choices)
- Ollama AI integration for story generation
- Character health/death system
- Responsive UI with horror theme
- Game state persistence

### 🔧 Customizable Elements
- Story templates in \`gameStore.js\`
- Character species and stats
- Location templates and danger levels
- Difficulty settings
- Timer duration
- UI themes and styling

### 🤖 Ollama Integration
- Dynamic story generation based on user input
- Context-aware responses
- Character consequence parsing
- Fallback system when Ollama unavailable
- Easy model switching

## Game Flow
1. User logs in (saved in localStorage)
2. Game initializes with 3 random mythical characters
3. User selects location or types custom action
4. Ollama processes input and generates horror story
5. AI determines character consequences (damage/death)
6. Process repeats until all characters die or time runs out

## Extending the Game
- Add new locations in \`gameStore.js\`
- Create new character species
- Modify story templates
- Add achievements system
- Implement multiplayer features
- Add sound effects and animations

Enjoy the nightmare! 🧟‍♂️👹💀
`
    

