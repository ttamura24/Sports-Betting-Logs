import { useState, useEffect } from 'react';

export const useOptions = () => {
  const [sportsbooks, setSportsbooks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [betTypes, setBetTypes] = useState([]);
  const [result, setResult] = useState([]);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [sportsbooksRes, teamsRes, betTypesRes, resultRes] = await Promise.all([
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

        setSportsbooks(sportsbooksData.sort((a, b) => a.name.localeCompare(b.name)));
        setTeams(teamsData.sort((a, b) => a.name.localeCompare(b.name)));
        setBetTypes(betTypesData.sort((a, b) => a.betType.localeCompare(b.betType)));
        setResult(resultData.sort((a, b) => a.result.localeCompare(b.result)));
      } catch (err) {
        setError(err.message);
        console.log('Error fetching dropdown options:', err);
      }
    };

    fetchDropdownOptions();
  }, []);

  return { sportsbooks, teams, betTypes, result };
};