import { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

type AuthState = {
  isAuthenticated: boolean;
  userId: string | null;
  idToken: string | null;
};

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    idToken: null,
  });

  const handleLogin = (userId: string, idToken: string) => {
    setAuthState({
      isAuthenticated: true,
      userId,
      idToken,
    });
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      userId: null,
      idToken: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {authState.isAuthenticated ? (
        <Dashboard
          userId={authState.userId!}
          idToken={authState.idToken!}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;