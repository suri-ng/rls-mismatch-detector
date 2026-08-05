// Dashboard.jsx

import { useEffect, useState } from 'react';
import { trackPageView, logEvent } from '../analytics';

function Dashboard({ user }) {
  const [theme, setTheme] = useState('light');
  const [notes, setNotes] = useState([]);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    trackPageView('/dashboard');
  }, []);

  useEffect(() => {
    fetch('https://api.weatherprovider.example/current?city=NYC')
      .then((res) => res.json())
      .then(setWeather);
  }, []);

  useEffect(() => {
    supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => setNotes(data));
  }, [user]);

  function handleThemeToggle() {
    logEvent('theme_toggled');
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <div className={theme}>
      <button onClick={handleThemeToggle}>Toggle theme</button>
      <WeatherWidget data={weather} />
      <NotesList notes={notes} />
    </div>
  );
}

export default Dashboard;