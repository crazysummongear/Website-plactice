# React Router Integration

## Overview

The application uses React Router v7 for client-side routing with the following structure:

```
App.tsx
├── QueryClientProvider (React Query)
└── Router (React Router)
    └── AuthProvider (Authentication Context)
        └── Routes
            ├── Public Routes
            │   ├── /login (LoginPage)
            │   └── /signup (SignupPage)
            └── Protected Routes (PrivateRoute wrapper)
                ├── /dashboard (Dashboard)
                ├── /dashboard-new (DashboardPage)
                ├── /transactions (TransactionListPage)
                └── /csv-import (CsvImportPage)
```

## Route Configuration

### Public Routes

These routes are accessible without authentication:

- **`/login`** - User login page
- **`/signup`** - User registration page

### Protected Routes

These routes require authentication and are wrapped with the `PrivateRoute` component:

- **`/dashboard`** - Main dashboard (legacy)
- **`/dashboard-new`** - New dashboard implementation
- **`/transactions`** - Transaction list and management
- **`/csv-import`** - CSV file import for bulk transactions

### Special Routes

- **`/`** - Redirects to `/dashboard`
- **`*`** - Catch-all route that redirects to `/dashboard`

## Authentication Flow

1. **Unauthenticated Access**: When a user tries to access a protected route without authentication, the `PrivateRoute` component redirects them to `/login` and saves the original location.

2. **After Login**: After successful authentication, the user is redirected back to the originally requested page (if available) or to `/dashboard`.

3. **Loading State**: While authentication status is being determined, a loading spinner is displayed.

## Context Providers

### AuthProvider

Provides authentication state and methods throughout the application:

- `isAuthenticated`: Boolean indicating if user is logged in
- `loading`: Boolean indicating if auth state is being determined
- `user`: Current user object
- `idToken`: JWT token for API requests
- `login()`: Login method
- `signup()`: Registration method
- `confirmEmail()`: Email verification method
- `logout()`: Logout method
- `resetPassword()`: Password reset method

### QueryClientProvider

Provides React Query functionality for server state management:

- Automatic caching and synchronization
- Retry logic (1 retry on failure)
- Disabled refetch on window focus

## Adding New Routes

### Public Route

```tsx
<Route path="/new-public-page" element={<NewPublicPage />} />
```

### Protected Route

```tsx
<Route
  path="/new-protected-page"
  element={
    <PrivateRoute>
      <NewProtectedPage />
    </PrivateRoute>
  }
/>
```

## Navigation

Use React Router's navigation hooks and components:

```tsx
import { useNavigate, Link } from 'react-router-dom';

// Programmatic navigation
const navigate = useNavigate();
navigate('/dashboard');

// Declarative navigation
<Link to="/transactions">View Transactions</Link>
```

## Testing

The routing configuration is tested in `App.test.tsx`:

- Verifies the app renders without crashing
- Confirms React Router is configured
- Validates AuthProvider integration
- Validates QueryClientProvider integration

Run tests with:

```bash
npm test
```

## Future Enhancements

Planned routes for future implementation:

- `/categories` - Category management page
- `/settings` - User settings page
- `/reports` - Financial reports and analytics
- `/budget` - Budget management page

## Technical Details

- **Router**: BrowserRouter (uses HTML5 history API)
- **React Router Version**: 7.1.5
- **Authentication**: Context-based with JWT tokens
- **State Management**: React Query for server state, Context API for auth state
