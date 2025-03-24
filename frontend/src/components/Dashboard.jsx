import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

const Dashboard = ({ onLogout, username, userID }) => {

  const [bets, setBets] = useState([])
  const [sportsbooks, setSportsbooks] = useState([])
  const [filters, setFilters] = useState({
    sportsbook: '',
    betType: '',
    dateRange: {
      start: '',
      end: ''
    }
  })
  const navigate = useNavigate()

  const [betTypes, setBetTypes] = useState([])
  const [teams, setTeams] = useState([])
  const [results, setResults] = useState([])
  

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await fetch(`/api/bets/${userID}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bets');
        }

        const data = await response.json();
        console.log('data', data)
        setBets(data);
      } catch (error) {
        console.error('Error fetching bets:', error);
        // Optionally set some error state here
      }
    };

    if (userID) {
      fetchBets();
    }
  }, [userID]); // Dependency on userID ensures refetch if user changes

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
        <h1 className="dashboard-title">
          {username ? `${username}'s Sports Betting Log` : 'Sports Betting Log'}
        </h1>
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
            {sportsbooks && sportsbooks.map(book => (
              <option key={book._id} value={book._id}>
                {book.name}
              </option>
            ))}
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
            <option value="Spread">Spread</option>
            <option value="Moneyline">Moneyline</option>
            <option value="Over/Under">Over/Under</option>
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
              <th>Team</th>
              <th>Bet Type</th>
              <th>Description</th>
              <th>Odds</th>
              <th>Amount Wagered</th>
              <th>Amount Won</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bets
              .sort((a, b) => {
                // compare dates
                const dateComparison = new Date(b.datePlaced) - new Date(a.datePlaced);
                if (dateComparison !== 0) return dateComparison;
                
                // if dates are equal, compare sportsbook names
                const sportsbookComparison = a.sportsbookName.localeCompare(b.sportsbookName);
                if (sportsbookComparison !== 0) return sportsbookComparison;
                
                // if sportsbooks are equal, compare team names
                return a.teamName.localeCompare(b.teamName);
              })
              .map(bet => (
                <tr key={bet.id}>
                  <td>{new Date(bet.datePlaced).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                  <td>{bet.sportsbookName}</td>
                  <td>{bet.teamName}</td>
                  <td>{bet.betType}</td>
                  <td>{bet.description}</td>
                  <td>{bet.odds}</td>
                  <td>${bet.amountWagered}</td>
                  <td>${bet.amountWon}</td>
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