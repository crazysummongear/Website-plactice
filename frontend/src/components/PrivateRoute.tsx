import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Private route component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Saves the current location to redirect back after successful login
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
