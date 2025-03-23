import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

const Dashboard = ({ onLogout }) => {
  const [bets, setBets] = useState([])
  const [filters, setFilters] = useState({
    sportsbook: '',
    betType: '',
    dateRange: {
      start: '',
      end: ''
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    // fetch bets from the backend
    const tempBets = [
      {
        id: 1,
        sportsbookName: 'DraftKings',
        betType: 'Moneyline',
        amountWagered: 100,
        amountReturned: 190,
        result: 'Win',
        date: '2024-03-15'
      }
    ]
    setBets(tempBets)
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }))
  }

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target
    setFilters(prevFilters => ({
      ...prevFilters,
      dateRange: {
        ...prevFilters.dateRange,
        [name]: value
      }
    }))
  }

  const handleAddBet = () => {
    navigate('/bet')
  }

  const handleEditBet = (betId) => {
    navigate(`/bet/${betId}`)
  }

  const handleDeleteBet = async (betId) => {
    // delete functionality
    if (window.confirm('Are you sure you want to delete this bet?')) {
      console.log('Deleting bet:', betId)
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Betting Log</h1>
        <div className="header-buttons">
          <button onClick={handleAddBet} className="add-bet-button">
            + Add New Bet
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Sportsbook</label>
          <select
            name="sportsbook"
            value={filters.sportsbook}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="draftkings">DraftKings</option>
            <option value="fanduel">FanDuel</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Bet Type</label>
          <select
            name="betType"
            value={filters.betType}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="moneyline">Moneyline</option>
            <option value="spread">Spread</option>
            <option value="overunder">Over/Under</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-inputs">
            <input
              type="date"
              name="start"
              value={filters.dateRange.start}
              onChange={handleDateRangeChange}
              className="date-input"
            />
            <input
              type="date"
              name="end"
              value={filters.dateRange.end}
              onChange={handleDateRangeChange}
              className="date-input"
            />
          </div>
        </div>
      </div>

      <div className="bets-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Sportsbook</th>
              <th>Bet Type</th>
              <th>Amount Wagered</th>
              <th>Amount Returned</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bets.map(bet => (
              <tr key={bet.id}>
                <td>{bet.date}</td>
                <td>{bet.sportsbookName}</td>
                <td>{bet.betType}</td>
                <td>${bet.amountWagered}</td>
                <td>${bet.amountReturned}</td>
                <td>
                  <span className={`result-badge ${bet.result.toLowerCase()}`}>
                    {bet.result}
                  </span>
                </td>
                <td className="action-buttons">
                  <button onClick={() => handleEditBet(bet.id)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteBet(bet.id)} className="delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard 