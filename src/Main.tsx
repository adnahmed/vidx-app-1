import { useEffect, useState } from 'react';
import './Main.css';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

function Main() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [planMaxVideos, setPlanMaxVideos] = useState(10);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    const maxVideos = localStorage.getItem('planMaxVideos');

    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setPlanMaxVideos(parseInt(maxVideos || '10'));
    }
  }, []);

  const handleLogin = (email: string, token: string, maxVideos: number) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('planMaxVideos', maxVideos.toString());
    setIsLoggedIn(true);
    setUserEmail(email);
    setPlanMaxVideos(maxVideos);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('planMaxVideos');
    setIsLoggedIn(false);
    setUserEmail('');
    setPlanMaxVideos(10);
  };

  if (isLoggedIn) {
    return (
      <Dashboard
        userEmail={userEmail}
        planMaxVideos={planMaxVideos}
        onLogout={handleLogout}
      />
    );
  }

  return <LandingPage onLogin={handleLogin} />;
}

export default Main;
