import React, { useState, useEffect, useRef } from 'react'
import { Clock, Users, MapPin, Skull, Settings, LogOut, Send, Plus } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useGameStore } from '../stores/gameStore'
import { ollamaService } from '../services/ollamaService'
import toast from 'react-hot-toast'
import '../App.css'
import '../index.css';

const Game = () => {
  const { user, logout, updateStats } = useAuthStore()
  const { gameState, initGame, updateGameState, addCharacter, damageCharacter, killCharacter, resetGame, locations } = useGameStore()
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const storyRef = useRef(null)

  // Timer effect
  useEffect(() => {
    if (!gameState.isGameActive) return

    const timer = setInterval(() => {
      if (gameState.timeLeft > 0) {
        updateGameState({ timeLeft: gameState.timeLeft - 1 })
      } else {
        handleGameEnd('timeout')
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameActive, gameState.timeLeft])

  // Auto-scroll story
  useEffect(() => {
    if (storyRef.current) {
      storyRef.current.scrollTop = storyRef.current.scrollHeight
    }
  }, [gameState.storyHistory])

  const startGame = () => {
    initGame()
    const welcomeStory = `🌆 Welcome ${user.username} to the Horror Apocalypse!

The world has ended in blood and chaos. Mythical creatures and ancient evils now roam the wasteland. You lead a small group of supernatural survivors, each with unique abilities.

Your team must navigate through cursed locations, make critical decisions, and survive the nightmare that reality has become. Every choice matters - death is permanent, and time is running out.

Choose your first location to explore, or describe what you want to do...`

    updateGameState({ 
      currentStory: welcomeStory,
      storyHistory: [{ type: 'story', content: welcomeStory, timestamp: Date.now() }]
    })
    
    toast.success('The nightmare begins...')
  }

  const handleLocationSelect = async (location) => {
    if (!gameState.isGameActive || isProcessing) return

    setIsProcessing(true)
    
    const locationPrompt = `I want to explore ${location.name}. ${location.description}`
    
    try {
      const result = await ollamaService.processUserChoice(locationPrompt, {
        location,
        characters: gameState.characters,
        difficulty: gameState.difficulty,
        previousStory: gameState.currentStory
      })

      // Apply consequences
      result.consequences.forEach(consequence => {
        if (consequence.type === 'death') {
          killCharacter(consequence.characterId)
          toast.error(consequence.description, { icon: '💀' })
        } else if (consequence.type === 'damage') {
          damageCharacter(consequence.characterId, consequence.damage)
          toast.error(consequence.description, { icon: '🩸' })
        }
      })

      // Update story
      const newStoryEntry = {
        type: 'story',
        content: result.story,
        location: location.name,
        timestamp: Date.now()
      }

      updateGameState({
        currentLocation: location,
        currentStory: result.story,
        storyHistory: [...gameState.storyHistory, newStoryEntry]
      })

      checkGameEnd()

    } catch (error) {
      toast.error('Failed to generate story. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUserAction = async () => {
    if (!userInput.trim() || !gameState.isGameActive || isProcessing) return

    setIsProcessing(true)
    const action = userInput.trim()
    setUserInput('')

    // Add user action to history
    const userActionEntry = {
      type: 'action',
      content: `🎯 ${user.username}: ${action}`,
      timestamp: Date.now()
    }

    updateGameState({
      storyHistory: [...gameState.storyHistory, userActionEntry]
    })

    try {
      const result = await ollamaService.processUserChoice(action, {
        location: gameState.currentLocation,
        characters: gameState.characters,
        difficulty: gameState.difficulty,
        previousStory: gameState.currentStory
      })

      // Apply consequences
      result.consequences.forEach(consequence => {
        if (consequence.type === 'death') {
          killCharacter(consequence.characterId)
          toast.error(consequence.description, { icon: '💀' })
        } else if (consequence.type === 'damage') {
          damageCharacter(consequence.characterId, consequence.damage)
          toast.error(consequence.description, { icon: '🩸' })
        }
      })

      // Update story
      const newStoryEntry = {
        type: 'story',
        content: result.story,
        timestamp: Date.now()
      }

      updateGameState({
        currentStory: result.story,
        storyHistory: [...gameState.storyHistory, userActionEntry, newStoryEntry]
      })

      checkGameEnd()

    } catch (error) {
      toast.error('Failed to process your action. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const checkGameEnd = () => {
    const aliveCharacters = gameState.characters.filter(c => c.alive)
    
    if (aliveCharacters.length === 0) {
      handleGameEnd('death')
    } else if (gameState.storyHistory.length >= 20) {
      handleGameEnd('victory')
    }
  }

  const handleGameEnd = (reason) => {
    updateGameState({ isGameActive: false })
    
    const gameTime = 1800 - gameState.timeLeft
    updateStats({ 
      gamesPlayed: (user.gamesPlayed || 0) + 1,
      bestTime: reason === 'victory' ? (user.bestTime ? Math.min(user.bestTime, gameTime) : gameTime) : user.bestTime
    })

    if (reason === 'death') {
      toast.error('💀 All your characters have perished!')
    } else if (reason === 'victory') {
      toast.success('🏆 You survived the apocalypse!')
    } else if (reason === 'timeout') {
      toast.error('⏰ Time has run out!')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getHealthColor = (hp, maxHp) => {
    const percentage = (hp / maxHp) * 100
    if (percentage > 60) return 'from-green-500 to-green-400'
    if (percentage > 30) return 'from-yellow-500 to-yellow-400'
    return 'from-red-500 to-red-400'
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUserAction()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      {/* Header */}
      <header className="bg-black/90 border-b border-red-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skull className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold horror-title text-red-500">
              HORROR APOCALYPSE
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-white">
              <Clock className="w-5 h-5 mr-2 text-red-400" />
              <span className={`font-mono ${gameState.timeLeft < 300 ? 'text-red-400 horror-shake' : ''}`}>
                {formatTime(gameState.timeLeft)}
              </span>
            </div>
            
            <div className="flex items-center text-white">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              <span>{gameState.characters.filter(c => c.alive).length}/{gameState.characters.length}</span>
            </div>
            
            <div className="text-white">
              Welcome, {user.username}
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-red-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-black/95 border border-red-800 rounded-lg p-4 z-50">
          <div className="space-y-3">
            <div>
              <label className="block text-white text-sm mb-2">Difficulty:</label>
              <select
                value={gameState.difficulty}
                onChange={(e) => updateGameState({ difficulty: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="nightmare">Nightmare</option>
              </select>
            </div>
            <div className="text-sm text-gray-400">
              <p>Games Played: {user.gamesPlayed || 0}</p>
              <p>Best Time: {user.bestTime ? formatTime(user.bestTime) : 'None'}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Locations Panel */}
        <div className="w-1/4 bg-black/80 border-r border-red-800 p-4 overflow-y-auto">
          <h3 className="text-xl font-bold text-red-400 mb-4 creepy-text">
            🗺️ Cursed Locations
          </h3>
          
          {/* Game Controls */}
          <div className="mb-6">
            {!gameState.isGameActive ? (
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                🎮 Start Game
              </button>
            ) : (
              <button
                onClick={() => {
                  resetGame()
                  toast.success('Game reset')
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                🔄 Reset Game
              </button>
            )}
          </div>

          {/* Locations List */}
          <div className="space-y-3">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                disabled={!gameState.isGameActive || isProcessing}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  gameState.currentLocation?.id === location.id
                    ? 'border-red-500 bg-red-900/30'
                    : 'border-gray-600 bg-gray-800/50 hover:border-red-400 hover:bg-red-900/20'
                } ${!gameState.isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-red-300 font-semibold mb-1">
                  {location.name}
                </div>
                <div className="text-gray-400 text-sm mb-2">
                  {location.description}
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-red-400">
                    Danger: {location.danger}/10
                  </span>
                  <div className="ml-2 flex">
                    {Array(location.danger).fill(null).map((_, i) => (
                      <Skull key={i} className="w-3 h-3 text-red-500" />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Story Area */}
        <div className="flex-1 flex flex-col bg-black/70">
          {/* Story Display */}
          <div 
            ref={storyRef}
            className="flex-1 p-6 overflow-y-auto space-y-4"
          >
            {gameState.storyHistory.map((entry, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg ${
                  entry.type === 'story' 
                    ? 'bg-gray-900/80 border-l-4 border-red-500' 
                    : 'bg-blue-900/30 border-l-4 border-blue-500'
                } fade-in`}
              >
                <div className="text-white leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </div>
                {entry.location && (
                  <div className="mt-2 text-sm text-red-400">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {entry.location}
                  </div>
                )}
              </div>
            ))}
            
            {isProcessing && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                  <span className="text-gray-300">🤖 AI is crafting your nightmare...</span>
                </div>
              </div>
            )}
          </div>

          {/* User Input */}
          {gameState.isGameActive && (
            <div className="p-4 bg-black/90 border-t border-red-800">
              <div className="flex space-x-3">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What do you do? Describe your action in detail..."
                  className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  rows="3"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleUserAction}
                  disabled={!userInput.trim() || isProcessing}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all flex items-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                💡 Tip: Be specific! Instead of "attack", try "use my vampire strength to tear through the door" or "cast a protective spell around my team"
              </div>
            </div>
          )}
        </div>

        {/* Characters Panel */}
        <div className="w-1/4 bg-black/80 border-l border-red-800 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-400 creepy-text">
              👥 Your Team
            </h3>
            {gameState.isGameActive && gameState.characters.length < 6 && (
              <button
                onClick={addCharacter}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {gameState.characters.map((character) => (
              <div
                key={character.id}
                className={`p-4 rounded-lg border transition-all ${
                  character.alive
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 bg-gray-800/30 opacity-60'
                }`}
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{character.emoji}</span>
                  <div>
                    <div className={`font-bold ${character.alive ? 'text-blue-300' : 'text-gray-500'}`}>
                      {character.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {character.species}
                    </div>
                  </div>
                </div>

                {/* Health Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Health</span>
                    <span className="text-gray-300">
                      {character.hp}/{character.maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getHealthColor(character.hp, character.maxHp)}`}
                      style={{
                        width: `${(character.hp / character.maxHp) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Attack Power */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Attack</span>
                    <span className="text-gray-300">{character.atk}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                      style={{
                        width: `${(character.atk / 50) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {!character.alive && (
                  <div className="text-center text-red-400 font-bold text-sm">
                    💀 DECEASED
                  </div>
                )}
              </div>
            ))}
          </div>

          {gameState.characters.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Skull className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No survivors yet...</p>
              <p className="text-sm">Start the game to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Game
