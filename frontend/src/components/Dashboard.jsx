import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptions } from './DropdownOptions'
import '../styles/Dashboard.css'

const Dashboard = ({ onLogout, username, userID, isAdmin }) => {
  console.log('Dashboard props:', { username, userID, isAdmin });

  const [bets, setBets] = useState([])
  const { sportsbooks, teams, betTypes, result } = useOptions()
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    sportsbook: '',
    team: '',
    betType: '',
    result: '',
    dateRange: {
      start: '',
      end: ''
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await fetch(`/api/bets/${userID}/?startDate=${filters.dateRange.start}&endDate=${filters.dateRange.end}&sportsbook=${filters.sportsbook}&team=${filters.team}&betType=${filters.betType}&result=${filters.result}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bets');
        }

        const data = await response.json();
        setBets(data);
        console.log('Bets:', data);
      } catch (error) {
        console.error('Error fetching bets:', error);
        // Optionally set some error state here
      }
    };

    if (userID) {
      fetchBets();
    }
  }, [userID, filters]); // Dependency on userID and filters ensures refetch if user changes or filters change

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
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this bet?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bets/${betId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete bet');
      }

      // Remove the deleted bet from state
      setBets(prevBets => prevBets.filter(bet => bet.id !== betId));
      console.log('Bet deleted successfully');
    } catch (error) {
      console.error('Error deleting bet:', error);
      alert('Failed to delete bet: ' + error.message);
    } finally {
      setLoading(false);
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
          {!isAdmin && (
            <button onClick={handleAddBet} className="add-bet-button">
              + Add New Bet
            </button>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            name="start"
            value={filters.dateRange.start}
            onChange={handleDateRangeChange}
            className="date-input"
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            name="end"
            value={filters.dateRange.end}
            onChange={handleDateRangeChange}
            className="date-input"
          />
        </div>

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
          <label>Team</label>
          <select
            name="team"
            value={filters.team}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All</option>
            {teams && teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
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
            className="filter-select-short"
          >
            <option value="">All</option>
            {betTypes && betTypes.map(bt => (
              <option key={bt._id} value={bt._id}>
                {bt.betType}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Result</label>
          <select
            name="result"
            value={filters.result}
            onChange={handleFilterChange}
            className="filter-select-short"
          >
            <option value="">All</option>
            {result && result.map(r => (
              <option key={r._id} value={r._id}>
                {r.result}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bets-table">
        <table>
          <thead>
            <tr>
              {isAdmin && <th>Username</th>}
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
                  {isAdmin && <td>{bet.username}</td>}
                  <td>{new Date(bet.datePlaced).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                  <td>{bet.sportsbookName}</td>
                  <td>{bet.teamName}</td>
                  <td>{bet.betType}</td>
                  <td>
                    {bet.betType === 'Spread' && !bet.description.startsWith('-') && !bet.description.startsWith('+')
                      ? '+' + bet.description
                      : bet.description
                    }
                  </td>
                  <td>{bet.odds}</td>
                  <td>${bet.amountWagered}</td>
                  <td>${bet.amountWon}</td>
                  <td>
                    <span className={`result-badge ${bet.result}`}>
                      {bet.result}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleEditBet(bet.id)} 
                      className="edit-button"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteBet(bet.id)} 
                      className="delete-button"
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete'}
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