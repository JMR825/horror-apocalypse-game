import axios from 'axios'
import toast from 'react-hot-toast'

class OllamaService {
  constructor() {
    this.baseURL = '/api' // This will proxy to localhost:11434
    this.model = 'llama2' // Change this to your preferred Ollama model
  }

  async generateStory(prompt, context = {}) {
    try {
      const systemPrompt = `You are a horror story AI for an apocalypse survival game. 
      Create terrifying, immersive narratives based on user choices. 
      Keep responses under 200 words but make them atmospheric and scary.
      Include consequences for character actions.
      
      Game Context:
      - Location: ${context.location?.name || 'Unknown'}
      - Characters: ${context.characters?.map(c => `${c.emoji} ${c.name} (${c.species}, HP: ${c.hp})`).join(', ') || 'None'}
      - Difficulty: ${context.difficulty || 'normal'}
      - Previous story: ${context.previousStory || 'Beginning of the game'}
      
      User's choice/action: ${prompt}
      
      Respond with a horror story continuation that includes:
      1. What happens based on their choice
      2. New dangers or discoveries
      3. Consequences for characters (damage, death, or survival)
      4. Set up the next decision point
      
      End with: "What do you do next?"`

      const response = await axios.post(`${this.baseURL}/generate`, {
        model: this.model,
        prompt: systemPrompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 300
        }
      })

      return response.data.response
    } catch (error) {
      console.error('Ollama API Error:', error)
      
      // Fallback horror story if Ollama is unavailable
      const fallbackStories = [
        `The shadows respond to your choice with malevolent glee. Something terrible stirs in the darkness ahead. Your heart pounds as you realize you may have made a fatal mistake. The air grows cold, and whispers echo from unseen threats. What do you do next?`,
        
        `Your decision sends ripples through the apocalyptic landscape. In the distance, inhuman shrieks pierce the silence. One of your companions stumbles, blood seeping through their clothes. The horror is far from over. What do you do next?`,
        
        `The consequences of your actions manifest immediately. Ancient evils awakened by the apocalypse take notice of your presence. Death lurks in every shadow, and your survival hangs by a thread. What do you do next?`
      ]
      
      toast.error('Ollama connection failed. Using fallback story.')
      return fallbackStories[Math.floor(Math.random() * fallbackStories.length)]
    }
  }

  async processUserChoice(userInput, gameContext) {
    try {
      // Enhanced prompt for processing user choices
      const prompt = `Process this user action in a horror apocalypse game: "${userInput}"`
      const story = await this.generateStory(prompt, gameContext)
      
      // Parse story for character consequences
      const consequences = this.parseConsequences(story, gameContext)
      
      return {
        story,
        consequences
      }
    } catch (error) {
      console.error('Error processing user choice:', error)
      throw error
    }
  }

  parseConsequences(story, context) {
    // Simple AI-based consequence parsing
    const consequences = []
    const storyLower = story.toLowerCase()
    
    // Look for damage indicators
    if (storyLower.includes('dies') || storyLower.includes('killed') || storyLower.includes('death')) {
      const aliveCharacters = context.characters.filter(c => c.alive)
      if (aliveCharacters.length > 0) {
        const victim = aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]
        consequences.push({
          type: 'death',
          characterId: victim.id,
          description: `${victim.name} has died!`
        })
      }
    } else if (storyLower.includes('injured') || storyLower.includes('hurt') || storyLower.includes('wounded')) {
      const aliveCharacters = context.characters.filter(c => c.alive)
      if (aliveCharacters.length > 0) {
        const victim = aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]
        const damage = Math.floor(Math.random() * 30) + 10
        consequences.push({
          type: 'damage',
          characterId: victim.id,
          damage,
          description: `${victim.name} takes ${damage} damage!`
        })
      }
    }
    
    return consequences
  }

  // Test Ollama connection
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/tags`)
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

export const ollamaService = new OllamaService()
