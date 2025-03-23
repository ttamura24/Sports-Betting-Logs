import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/BetForm.css'

const BetForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    sportsbookID: '',
    betType: '',
    betList: [],
    odds: '',
    amountWagered: '',
    result: 'pending'
  })

  useEffect(() => {
    if (id) {
      // fetch bet data if editing
      const tempBet = {
        sportsbookID: '1',
        betType: 'moneyline',
        betList: [],
        odds: '-110',
        amountWagered: '100',
        result: 'pending'
      }
      setFormData(dummyBet)
    }
  }, [id])

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
      // save bet
      console.log('Saving bet:', formData)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving bet:', error)
    }
  }

  return (
    <div className="bet-form-container">
      <h2>{id ? 'Edit Bet' : 'Add New Bet'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="sportsbookID">Sportsbook</label>
          <select
            id="sportsbookID"
            name="sportsbookID"
            value={formData.sportsbookID}
            onChange={handleChange}
            required
          >
            <option value="">Select Sportsbook</option>
            <option value="1">DraftKings</option>
            <option value="2">FanDuel</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="betType">Bet Type</label>
          <select
            id="betType"
            name="betType"
            value={formData.betType}
            onChange={handleChange}
            required
          >
            <option value="">Select Bet Type</option>
            <option value="moneyline">Moneyline</option>
            <option value="spread">Spread</option>
            <option value="overunder">Over/Under</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="odds">Odds</label>
          <input
            type="text"
            id="odds"
            name="odds"
            value={formData.odds}
            onChange={handleChange}
            placeholder="-110"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amountWagered">Amount Wagered</label>
          <input
            type="number"
            id="amountWagered"
            name="amountWagered"
            value={formData.amountWagered}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        {id && (
          <div className="form-group">
            <label htmlFor="result">Result</label>
            <select
              id="result"
              name="result"
              value={formData.result}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="push">Push</option>
            </select>
          </div>
        )}

        <div className="button-group">
          <button type="submit" className="submit-button">
            {id ? 'Update Bet' : 'Add Bet'}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default BetForm 