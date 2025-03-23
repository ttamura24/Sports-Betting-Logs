import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isSignup) {
        // sign up logic here
        console.log('Signup with:', formData)
        onLogin(true)
        navigate('/dashboard')
      } else {
        // authentication logic here
        onLogin(true)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(isSignup ? 'Error creating account' : 'Invalid credentials')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sports Betting Logs</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
          <p className="toggle-form">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="toggle-button"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login