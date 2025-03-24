export const calculateAmountWon = (resultText, odds, amountWagered) => {
  if (!resultText || !odds || !amountWagered) return '0';
  
  if (resultText === 'Win') {
    const oddsNum = parseFloat(odds);
    const wager = parseFloat(amountWagered);
    
    let winnings = oddsNum >= 0 
      ? wager * (oddsNum / 100)
      : wager * (100 / Math.abs(oddsNum));
      
    // Add wager to winnings numerically, then format
    return (winnings + wager).toFixed(2);
  } 
  
  if (resultText === 'Loss') {
    return '0';
  } 
  
  if (resultText === 'Push') {
    return parseFloat(amountWagered).toFixed(2);
  }
  
  return '0';
};

export const checkIfValidSpread = (spread) => {
  return !isNaN(spread) && 
    spread !== 0 && 
    spread % 1 === 0.5 && 
    (spread >= 0.5 || spread <= -0.5);
}

export const checkIfValidOverUnder = (overUnder) => {
  return !isNaN(overUnder) && 
    overUnder !== 0 && 
    overUnder % 1 === 0.5 && 
    (overUnder >= 0.5 || overUnder <= -0.5);
}

export const checkIfValidOdds = (odds) => {
  return !isNaN(odds) && 
    odds !== 0 && odds % 1 === 0 &&
    (odds >= 100 || odds <= -105);
}

export const checkIfFormValid = (formData) => {
  return formData.sportsbookID !== '' && 
    formData.teamID !== '' && 
    formData.betTypeID !== '' && 
    formData.datePlaced !== '' && 
    formData.odds !== '' && 
    checkIfValidOdds(formData.odds) && 
    formData.amountWagered !== '' && 
    formData.resultID !== '';
}