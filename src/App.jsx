import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './components/Login'
import Game from './components/Game'
import './App.css'

function App() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen">
      <Routes>
        <Route 
          path="/" 
          element={user ? <Game /> : <Login />} 
        />
        <Route 
          path="/game" 
          element={user ? <Game /> : <Login />} 
        />
      </Routes>
    </div>
  )
}

export default App
