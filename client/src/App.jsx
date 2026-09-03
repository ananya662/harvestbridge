import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Auth from './pages/Auth';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerBrowse from './pages/BuyerBrowse';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
      setLoggedIn(true);
      setRole(user.role);
    }
  }, []);

  const handleAuthSuccess = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setLoggedIn(true);
    setRole(user?.role);
  };

  if (!loggedIn && !showAuth) {
    return <Home onGetStarted={() => setShowAuth(true)} />;
  }

  if (!loggedIn) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  if (role === 'buyer') {
    return <BuyerBrowse />;
  }

  return <FarmerDashboard />;
}

export default App;