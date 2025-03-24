import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/BetForm.css'
import { calculateAmountWon, checkIfValidOdds, checkIfValidSpread, checkIfValidOverUnder, checkIfFormValid } from '../utils'

const BetForm = ({ userID }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // variables for dropdown options
  const [sportsbooks, setSportsbooks] = useState([])
  const [teams, setTeams] = useState([])
  const [betTypes, setBetTypes] = useState([])
  const [result, setResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [spreadError, setSpreadError] = useState(false)
  const [overUnderError, setOverUnderError] = useState(false)
  const [oddsError, setOddsError] = useState(false)

  const [formData, setFormData] = useState({
    sportsbookID: '',
    teamID: '',
    betTypeID: '', 
    description: '',
    odds: '',
    resultID: 'pending',
    amountWagered: '',
    amountWon: '',
    spreadLine: '',
    overUnderType: 'Over',
    overUnderLine: '',
    datePlaced: new Date().toISOString().split('T')[0],
  })
  
  // fetch dropdown options from DB
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setLoading(true);
        const [sportsbooksRes, teamsRes,betTypesRes, resultRes] = await Promise.all([
          fetch('/api/sportsbook'),
          fetch('/api/teams'),
          fetch('/api/bet-type'),
          fetch('/api/result'),
        ]);

        if (!sportsbooksRes.ok) throw new Error('Failed to fetch sportsbooks');
        if (!teamsRes.ok) throw new Error('Failed to fetch teams');
        if (!betTypesRes.ok) throw new Error('Failed to fetch bet types');
        if (!resultRes.ok) throw new Error('Failed to fetch results');

        const sportsbooksData = await sportsbooksRes.json();
        const teamsData = await teamsRes.json();
        const betTypesData = await betTypesRes.json();
        const resultData = await resultRes.json();

        setSportsbooks(sportsbooksData);
        setTeams(teamsData);
        setBetTypes(betTypesData);
        setResult(resultData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dropdown options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // calculate amount won based on result, odds, and amount wagered
  useEffect(() => {
    const resultText = result.find(r => r._id === formData.resultID)?.result;
    const amountWon = calculateAmountWon(resultText, formData.odds, formData.amountWagered);
    
    setFormData(prevState => ({
      ...prevState,
      amountWon
    }));
  }, [formData.resultID, formData.odds, formData.amountWagered, result]);

  // check for errors in form input
  useEffect(() => {
    if (formData.odds) {
      setOddsError(checkIfValidOdds(formData.odds))
    }
  }, [formData.odds])

  useEffect(() => {
    if (formData.spreadLine) {
      setSpreadError(checkIfValidSpread(formData.spreadLine))
    }
  }, [formData.spreadLine])

  useEffect(() => {
    if (formData.overUnderLine) {
      setOverUnderError(checkIfValidOverUnder(formData.overUnderLine))
    }
  }, [formData.overUnderLine])


  // fetch bet data if editing
  useEffect(() => {
    if (id) {
      const tempBet = {
        sportsbookID: '67e0b84b46dabd01144b5549',
        teamID: '67e0b84b46dabd01144b5549',
        betTypeID: '1',
        description: 'test',
        datePlaced: '2025-03-24',
        odds: '-110',
        amountWagered: '100',
        result: 'pending'
      }
      setFormData(tempBet)
    }
  }, [id])

  // update description based on bet type and team
  const updateDescription = () => {
    const betType = betTypes.find(type => type._id === formData.betTypeID)?.betType;
    if (!betType) return;
    let description = '';
    switch (betType) {
      case 'Spread':
        description = formData.spreadLine > 0 
          ? `+${formData.spreadLine}`
          : `${formData.spreadLine}`;
        break;
      case 'Over/Under':
        description = `${formData.overUnderType} ${formData.overUnderLine}`;
        break;
      case 'Moneyline':
        description = `ML`;
        break;
      default:
        description = '';
    }
    
    setFormData(prevState => ({
      ...prevState,
      description
    }));
  };

  useEffect(() => {
    updateDescription();
  }, [formData.teamID, formData.betTypeID, formData.spreadLine, formData.overUnderType, formData.overUnderLine]);

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
      const betData = {
        userID: userID,
        sportsbookID: formData.sportsbookID,
        teamID: formData.teamID,
        betTypeID: formData.betTypeID,
        description: formData.description,
        datePlaced: formData.datePlaced,
        odds: formData.odds,
        resultID: formData.resultID,
        amountWagered: formData.amountWagered,
        amountWon: formData.amountWon,
      }

      console.log('bet data', betData)

      const response = await fetch('/api/add-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save bet');
        return;
      }
      console.log('Bet saved successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving bet:', error);
      alert(error.message);
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
            {sportsbooks
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(book => (
                <option key={book._id} value={book._id}>
                  {book.name}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="teamID">Team</label>
          <select
            id="teamID"
            name="teamID"
            value={formData.teamID}
            onChange={handleChange}
            required
          >
            <option value="">Select Team</option>
            {teams
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(team => (
                <option key={team._id} value={team._id}>
                  {team.name} 
                </option>
              ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="betTypeID">Bet Type</label>
          <select
            id="betTypeID"
            name="betTypeID"
            value={formData.betTypeID}
            onChange={handleChange}
            required
          >
            <option value="">Select Bet Type</option>
            {betTypes
              .sort((a, b) => a.betType.localeCompare(b.betType))
              .map(type => (
                <option key={type._id} value={type._id}>
                  {type.betType}
                </option>
              ))}
          </select>
        </div>

        {formData.betTypeID && (
          <div className="form-group">
            <label>Bet Details</label>
            {betTypes.find(type => type._id === formData.betTypeID)?.betType === 'Spread' && (
              <>
                <input
                  type="number"
                  name="spreadLine"
                  value={formData.spreadLine}
                  onChange={handleChange}
                  placeholder="Enter spread (e.g. +9.5, -4.5)"
                  required
                  step="0.5"
                />
                {!spreadError && <div className="error-message">Invalid spread. Must end in .5</div>}
              </>
            )}

            {betTypes.find(type => type._id === formData.betTypeID)?.betType === 'Over/Under' && (
              <>
                <select
                  name="overUnderType"
                  value={formData.overUnderType}
                  onChange={handleChange}
                  required
                >
                  <option value="Over">Over</option>
                  <option value="Under">Under</option>
                </select>
                <input
                  type="number"
                  name="overUnderLine"
                  value={formData.overUnderLine}
                  onChange={handleChange}
                  placeholder="Enter line (e.g. 160.5)"
                  step="0.5"
                  required
                />
                {!overUnderError && <div className="error-message">Invalid over/under. Must end in .5</div>}
              </>
            )}

            {betTypes.find(type => type._id === formData.betTypeID)?.betType === 'Moneyline' && (
              <input
                type="text"
                value="Win"
                disabled
                className="moneyline-input"
              />
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="datePlaced">Date Placed</label>
          <input
            type="date"
            id="datePlaced"
            name="datePlaced"
            value={formData.datePlaced}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="odds">Odds</label>
          <div className="odds-input-group">
            <input
              type="number"
              id="odds"
              name="odds"
              value={formData.odds}
              onChange={handleChange}
              placeholder="Enter odds (e.g. -110, +100)"
              required
              className="odds-number-input"
            />
          </div>
          {!oddsError && <div className="error-message">Invalid odds</div>}
        </div>

        <div className="form-group">
          <label htmlFor="result">Result</label>
          <select
            id="result"
            name="resultID"
            value={formData.resultID}
            onChange={handleChange}
            required
          >
            <option value="">Select Result</option>
            {result
              .sort((a, b) => a.result.localeCompare(b.result))
              .map(result => (
                <option key={result._id} value={result._id}>
                  {result.result}
                </option>
              ))}
          </select>
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

        <div className="form-group">
          <label htmlFor="amountWon">Amount Won</label>
          <input
            type="number"
            id="amountWon"
            name="amountWon"
            value={formData.amountWon}
            onChange={handleChange}
            min="0"
            step="0.01"
            readOnly
          />
        </div>

        <div className="button-group">
          <button type="submit" className="submit-button" disabled={!checkIfFormValid(formData)}>
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