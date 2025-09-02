import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // Game State
  gameState: {
    timeLeft: 1800, // 30 minutes
    difficulty: 'normal',
    currentLocation: null,
    characters: [],
    locations: [],
    storyHistory: [],
    isGameActive: false,
    currentStory: '',
    userInput: ''
  },

  // Character Species
  species: {
    vampire: { hp: 120, atk: 25, name: "Vampire", emoji: "🧛" },
    werewolf: { hp: 150, atk: 30, name: "Werewolf", emoji: "🐺" },
    witch: { hp: 80, atk: 35, name: "Witch", emoji: "🧙‍♀️" },
    angel: { hp: 100, atk: 40, name: "Fallen Angel", emoji: "👼" },
    demon: { hp: 140, atk: 32, name: "Demon", emoji: "👹" },
    zombie: { hp: 90, atk: 20, name: "Zombie", emoji: "🧟‍♂️" },
    ghost: { hp: 70, atk: 45, name: "Ghost", emoji: "👻" },
    dragon: { hp: 200, atk: 50, name: "Dragon", emoji: "🐉" },
    phoenix: { hp: 110, atk: 38, name: "Phoenix", emoji: "🔥" },
    banshee: { hp: 85, atk: 42, name: "Banshee", emoji: "💀" }
  },

  // Location Templates
  locations: [
    {
      id: 1,
      name: "🏚️ Abandoned Hospital",
      description: "Dark corridors echo with screams of the damned",
      danger: 8,
      context: "medical facility, infected patients, surgical equipment, emergency protocols"
    },
    {
      id: 2,
      name: "🌲 Cursed Forest",
      description: "Ancient trees whisper forbidden secrets",
      danger: 6,
      context: "dark woodland, mystical creatures, ancient rituals, hidden paths"
    },
    {
      id: 3,
      name: "🏭 Nuclear Wasteland",
      description: "Radiation spawns nightmarish mutations",
      danger: 9,
      context: "radioactive zone, mutated beings, contamination, survival shelter"
    },
    {
      id: 4,
      name: "🏰 Haunted Castle",
      description: "Centuries of evil permeate these walls",
      danger: 7,
      context: "ancient fortress, vengeful spirits, dark magic, hidden chambers"
    },
    {
      id: 5,
      name: "🌊 Flooded Metropolis",
      description: "Drowned city harbors aquatic horrors",
      danger: 7,
      context: "submerged buildings, water creatures, drowning hazards, floating debris"
    },
    {
      id: 6,
      name: "🕳️ Underground Bunker",
      description: "Last refuge or elaborate death trap?",
      danger: 5,
      context: "military bunker, limited resources, claustrophobic spaces, security systems"
    }
  ],

  // Actions
  initGame: () => {
    const names = ['Aria', 'Zyx', 'Kael', 'Luna', 'Raven', 'Vex', 'Dante', 'Nyx', 'Orion', 'Zara']
    const { species } = get()
    const speciesKeys = Object.keys(species)
    
    const initialCharacters = Array(3).fill(null).map(() => {
      const randomSpecies = speciesKeys[Math.floor(Math.random() * speciesKeys.length)]
      const template = species[randomSpecies]
      
      return {
        id: Date.now() + Math.random(),
        name: names[Math.floor(Math.random() * names.length)],
        species: template.name,
        emoji: template.emoji,
        maxHp: template.hp,
        hp: template.hp,
        atk: template.atk,
        alive: true
      }
    })

    set(state => ({
      gameState: {
        ...state.gameState,
        characters: initialCharacters,
        isGameActive: true,
        timeLeft: 1800,
        storyHistory: [],
        currentStory: ''
      }
    }))
  },

  updateGameState: (updates) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        ...updates
      }
    }))
  },

  addCharacter: () => {
    const { species } = get()
    const { gameState } = get()
    
    if (gameState.characters.length >= 6) return

    const names = ['Seraph', 'Morrigan', 'Thane', 'Lilith', 'Grimm', 'Vesper']
    const speciesKeys = Object.keys(species)
    const randomSpecies = speciesKeys[Math.floor(Math.random() * speciesKeys.length)]
    const template = species[randomSpecies]
    
    const newCharacter = {
      id: Date.now() + Math.random(),
      name: names[Math.floor(Math.random() * names.length)],
      species: template.name,
      emoji: template.emoji,
      maxHp: template.hp,
      hp: template.hp,
      atk: template.atk,
      alive: true
    }

    set(state => ({
      gameState: {
        ...state.gameState,
        characters: [...state.gameState.characters, newCharacter]
      }
    }))
  },

  damageCharacter: (characterId, damage) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        characters: state.gameState.characters.map(char => {
          if (char.id === characterId) {
            const newHp = Math.max(0, char.hp - damage)
            return {
              ...char,
              hp: newHp,
              alive: newHp > 0
            }
          }
          return char
        })
      }
    }))
  },

  killCharacter: (characterId) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        characters: state.gameState.characters.map(char =>
          char.id === characterId ? { ...char, hp: 0, alive: false } : char
        )
      }
    }))
  },

  resetGame: () => {
    set(state => ({
      gameState: {
        ...state.gameState,
        timeLeft: 1800,
        currentLocation: null,
        characters: [],
        storyHistory: [],
        isGameActive: false,
        currentStory: '',
        userInput: ''
      }
    }))
  }
}))
