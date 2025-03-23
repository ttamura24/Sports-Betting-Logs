import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import Login from './components/Login'
import Dashboard from './components/Dashboard'
import BetForm from './components/BetForm'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (status) => {
    setIsAuthenticated(status)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/bet/:id?" 
            element={
              isAuthenticated ? (
                <BetForm />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
