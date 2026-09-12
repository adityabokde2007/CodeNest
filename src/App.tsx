import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './lib/firebase';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Dismiss loading screen after 1.8 seconds (giving the progress bar time to hit 100%)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !authChecked) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
        <Route 
          path="/dashboard" 
          element={
            user ? <Dashboard /> : <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
