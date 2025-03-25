import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/BetForm.css'
import { calculateAmountWon, checkIfValidOdds, checkIfValidSpread, checkIfValidOverUnder, checkIfFormValid } from '../utils'
import { useOptions } from './DropdownOptions'

const BetForm = ({ userID }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { sportsbooks, teams, betTypes, result, loading, error } = useOptions()
  
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
      const isValid = checkIfValidSpread(Number(formData.spreadLine));
      setSpreadError(!isValid);
    }
  }, [formData.spreadLine])

  useEffect(() => {
    if (formData.overUnderLine) {
      setOverUnderError(checkIfValidOverUnder(formData.overUnderLine))
    }
  }, [formData.overUnderLine])


  // fetch bet data if editing
  useEffect(() => {
    const fetchBetData = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/bets/single/${id}`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch bet data');
          }

          const betData = await response.json();
          console.log('Fetched bet data:', betData);

          const formDataToSet = {
            sportsbookID: betData.sportsbookID,
            teamID: betData.teamID,
            betTypeID: betData.betTypeID,
            description: betData.description,
            odds: betData.odds,
            resultID: betData.resultID,
            amountWagered: betData.amountWagered,
            amountWon: betData.amountWon,
            datePlaced: new Date(betData.datePlaced).toISOString().split('T')[0],
            spreadLine: !betData.description.includes('Over') && !betData.description.includes('Under') && !betData.description.includes('ML')
              ? betData.description
              : '',
            overUnderType: betData.description.startsWith('Over') ? 'Over' : 'Under',
            overUnderLine: betData.description.includes('Over') || betData.description.includes('Under')
              ? betData.description.split(' ')[1]
              : ''
          };
          
          console.log('Setting form data:', formDataToSet);
          
          setFormData(formDataToSet);
        } catch (error) {
          console.error('Error fetching bet data:', error);
        }
      }
    };

    fetchBetData();
  }, [id]);

  // update description based on bet type and team
  const updateDescription = () => {
    const betType = betTypes.find(type => type._id === formData.betTypeID)?.betType;
    if (!betType) return;
    let description = '';
    switch (betType) {
      case 'Spread':
        description = `${formData.spreadLine}`;
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
    e.preventDefault();
    setLoading(true);
    try {
      const betData = {
        userID,
        sportsbookID: formData.sportsbookID,
        teamID: formData.teamID,
        betTypeID: formData.betTypeID,
        description: formData.description,
        datePlaced: formData.datePlaced,
        odds: formData.odds,
        resultID: formData.resultID,
        amountWagered: formData.amountWagered,
        amountWon: formData.amountWon,
      };

      // If we have an id, we're editing
      const url = id ? `/api/bets/${id}` : '/api/add-bet';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(betData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save bet');
      }

      console.log(`Bet ${id ? 'updated' : 'created'} successfully`);
      navigate('/dashboard');
    } catch (error) {
      console.error(`Error ${id ? 'updating' : 'creating'} bet:`, error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

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
                {spreadError && <div className="error-message">Invalid spread. Must end in .5</div>}
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
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading || !checkIfFormValid(formData)}
          >
            {loading ? 'Saving...' : (id ? 'Update Bet' : 'Add Bet')}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default BetForm 