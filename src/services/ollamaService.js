import axios from 'axios'
import toast from 'react-hot-toast'

class OllamaService {
  constructor() {
    // For development
    this.baseURL = import.meta.env.DEV ? '/api' : null
    this.model = 'llama2'
    this.isProduction = !import.meta.env.DEV
  }

  async generateStory(prompt, context = {}) {
    try {
      // In production, use fallback stories since we can't connect to local Ollama
      if (this.isProduction || !this.baseURL) {
        return this.getFallbackStory(prompt, context)
      }

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
      return this.getFallbackStory(prompt, context)
    }
  }

  getFallbackStory(prompt, context) {
    const location = context.location?.name || 'this cursed place'
    const characters = context.characters?.filter(c => c.alive) || []
    
    const horrorIntensity = context.difficulty === 'nightmare' ? 3 : context.difficulty === 'normal' ? 2 : 1
    
    const fallbackStories = [
      `Your action echoes through ${location} with terrifying consequences. The darkness seems to pulse with malevolent energy as ${characters.length > 0 ? characters[0].name : 'someone'} feels an icy grip of dread. Ancient evils stir, awakened by your presence. The very air becomes thick with supernatural menace. Something terrible approaches from the shadows. What do you do next?`,
      
      `The horror deepens at ${location}. Your choice triggers a cascade of nightmarish events. Whispers of the damned fill the air as reality warps around you. ${characters.length > 0 ? characters[Math.floor(Math.random() * characters.length)].name : 'A team member'} stumbles backward in terror. The apocalypse shows its true face - merciless and hungry for souls. What do you do next?`,
      
      `Terror grips your heart as your decision unleashes unspeakable horror at ${location}. The very ground beneath you trembles with otherworldly power. Blood-curdling screams pierce the silence. ${characters.length > 1 ? characters[1].name : 'Your companion'} whispers prayers to forgotten gods. Death stalks every shadow, every breath could be your last. What do you do next?`,
      
      `Your action resonates through the fabric of nightmare itself. At ${location}, the boundaries between life and death blur. Spectral figures emerge from the void, their hollow eyes fixed upon your team. The stench of decay fills your nostrils. Time seems to slow as cosmic horror unfolds before you. Madness beckons. What do you do next?`
    ]
    
    const randomStory = fallbackStories[Math.floor(Math.random() * fallbackStories.length)]
    
    // Add intensity based on difficulty
    if (horrorIntensity >= 3) {
      return randomStory.replace('What do you do next?', 'The apocalypse demands sacrifice. Your choices have consequences beyond imagination. What do you do next?')
    } else if (horrorIntensity >= 2) {
      return randomStory.replace('What do you do next?', 'Danger lurks in every shadow. Choose your next move carefully. What do you do next?')
    }
    
    return randomStory
  }

  async processUserChoice(userInput, gameContext) {
    try {
      const prompt = `Process this user action in a horror apocalypse game: "${userInput}"`
      const story = await this.generateStory(prompt, gameContext)
      
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
    const consequences = []
    const storyLower = story.toLowerCase()
    const difficultyMultiplier = {
      easy: 0.2,
      normal: 0.4,
      nightmare: 0.7
    }
    
    const damageChance = difficultyMultiplier[context.difficulty] || 0.4
    const deathChance = context.difficulty === 'nightmare' ? 0.3 : context.difficulty === 'normal' ? 0.15 : 0.05
    
    // Look for death indicators
    if (storyLower.includes('dies') || storyLower.includes('killed') || storyLower.includes('death') || Math.random() < deathChance) {
      const aliveCharacters = context.characters.filter(c => c.alive)
      if (aliveCharacters.length > 0) {
        const victim = aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]
        consequences.push({
          type: 'death',
          characterId: victim.id,
          description: `💀 ${victim.name} has perished in the horror!`
        })
      }
    } else if (storyLower.includes('injured') || storyLower.includes('hurt') || storyLower.includes('wounded') || Math.random() < damageChance) {
      const aliveCharacters = context.characters.filter(c => c.alive)
      if (aliveCharacters.length > 0) {
        const victim = aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]
        const damage = Math.floor(Math.random() * 40) + 10
        consequences.push({
          type: 'damage',
          characterId: victim.id,
          damage,
          description: `🩸 ${victim.name} takes ${damage} damage from the horror!`
        })
      }
    }
    
    return consequences
  }

  async testConnection() {
    if (this.isProduction) return false
    
    try {
      const response = await axios.get(`${this.baseURL}/tags`)
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

export const ollamaService = new OllamaService()
