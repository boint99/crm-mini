# HƯỚNG DẪN QUY TRÌNH: AUTHENTICATION ĐƠN GIẢN (LOGIN ONLY)

## 1. Giới thiệu

Quy trình này cung cấp hệ thống **authentication đơn giản** dựa trên response thực tế:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accountId": 3,
    "accountName": "admin@crm.local",
    "isLogin": true,
    "id": "019e9374-5f33-77cc-911b-4fa0ac60950b",
    "status": "ENABLE",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Yêu cầu:**
- ✅ Login với email/password
- ✅ Lưu accessToken vào cookie
- ✅ Gửi token trong API requests từ cookie
- ✅ Protect routes
- ✅ Logout đơn giản

## 2. Cấu hình Environment

```env
VITE_API_URL=http://localhost:8017/api
```

---

## 3. Redux Slice


---

## 4. Redux Actions

```javascript
// redux/actions/authActions.js
import authService from '../../services/authService';
import { loginStart, loginSuccess, loginFailure } from '../slices/authSlice';

/**
 * Thunk Action: Login
 */
export const loginThunk = (credentials) => async (dispatch) => {
  dispatch(loginStart());

  try {
    const response = await authService.login(credentials);

    // Map response data
    const payload = {
      user: {
        accountId: response.data.accountId,
        accountName: response.data.accountName,
        id: response.data.id,
        status: response.data.status
      },
      accessToken: response.data.accessToken
    };

    dispatch(loginSuccess(payload));

    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    const errorPayload = {
      message: error.response?.data?.message || 'Login failed',
      code: error.response?.data?.code || 'LOGIN_ERROR'
    };
    dispatch(loginFailure(errorPayload));
    throw error;
  }
};
```

---

## 5. Redux Selectors

```javascript
// redux/selectors/authSelectors.js

export const selectUser = (state) => state.auth.user;

export const selectAccessToken = (state) => state.auth.accessToken;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectIsLoading = (state) => state.auth.isLoading;

export const selectError = (state) => state.auth.error;
```

---

## 6. Cấu hình Redux Store + Redux Persist

```javascript
// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';

// ===== PERSIST CONFIG =====
const persistConfig = {
  key: 'auth_simple',
  storage,
  whitelist: ['auth']
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// ===== CREATE STORE =====
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

// ===== CREATE PERSISTOR =====
export const persistor = persistStore(store);
```

---

## 7. Axios Client + Token Interceptor

```javascript
// services/apiClient.js
import axios from 'axios';
import { store } from '../redux/store';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8017/api';

// ===== CREATE AXIOS INSTANCE =====
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ===== REQUEST INTERCEPTOR - Add token to header =====
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR - Handle errors =====
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired -> Logout
      // You can dispatch logout action here if needed
      console.('Unauthorized - Token invalid');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 8. Auth Service

```javascript
// services/authService.js
import apiClient from './apiClient';

class AuthService {
  /**
   * Login
   * @param {Object} credentials - { accountName, password }
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }
}

export default new AuthService();
```

---

## 9. Custom Hooks

```javascript
// hooks/useAuth.js
import { useSelector } from 'react-redux';
import {
  selectUser,
  selectAccessToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectError
} from '../redux/selectors/authSelectors';

export const useAuth = () => {
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error
  };
};
```

```javascript
// hooks/useLogin.js
import { useDispatch } from 'react-redux';
import { loginThunk } from '../redux/actions/authActions';

export const useLogin = () => {
  const dispatch = useDispatch();

  const login = async (credentials) => {
    try {
      const result = await dispatch(loginThunk(credentials));
      return result;
    } catch (error) {
      throw error;
    }
  };

  return { login };
};
```

```javascript
// hooks/useLogout.js
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

export const useLogout = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return { logout: handleLogout };
};
```

---

## 10. Login Component

```javascript
// components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
  const [credentials, setCredentials] = useState({
    accountName: '',
    password: ''
  });
  const [localError, setLocalError] = useState(null);

  const navigate = useNavigate();
  const { isLoading, error: reduxError } = useAuth();
  const { login } = useLogin();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!credentials.accountName || !credentials.password) {
      setLocalError('Please enter email and password');
      return;
    }

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setLocalError(message);
    }
  };

  const displayError = localError || reduxError?.message;

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

        {displayError && <div className="error-message">{displayError}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="accountName"
            value={credentials.accountName}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="admin@crm.local"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

---

## 11. Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 12. Profile/Dashboard Component

```javascript
// components/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div>No user data</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="user-info">
        <h2>Welcome, {user.accountName}</h2>
        <p><strong>Account ID:</strong> {user.accountId}</p>
        <p><strong>Status:</strong> {user.status}</p>
      </div>

      <button onClick={handleLogout} disabled={isLoading}>
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

export default Dashboard;
```

---

## 13. App Router

```javascript
// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;
```

---

## 14. Main Entry Point

```javascript
// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 15. Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User nhập credentials:                             │
│     - accountName (email)                               │
│     - password                                          │
│                                                         │
│  2. Click "Login" button                               │
│     └─> handleSubmit() → validation                    │
│                                                         │
│  3. useLogin hook gọi loginThunk                       │
│     └─> dispatch(loginThunk(credentials))              │
│                                                         │
│  4. Redux Thunk:                                       │
│     └─> authService.login(credentials)                 │
│                                                         │
│  5. Axios gửi POST /auth/login                        │
│     Request Interceptor: add Authorization header       │
│                                                         │
│  6. Backend response:                                   │
│     {                                                   │
│       success: true,                                    │
│       data: {                                           │
│         accountId: 3,                                   │
│         accountName: "admin@crm.local",                │
│         id: "uuid",                                     │
│         status: "ENABLE",                              │
│         accessToken: "jwt-token"                       │
│       }                                                 │
│     }                                                   │
│                                                         │
│  7. Redux dispatch loginSuccess:                       │
│     state.auth.user = {                                │
│       accountId: 3,                                     │
│       accountName: "admin@crm.local",                  │
│       id: "uuid",                                       │
│       status: "ENABLE"                                  │
│     }                                                   │
│     state.auth.accessToken = "jwt-token"              │
│     state.auth.isAuthenticated = true                  │
│                                                         │
│  8. Redux Persist lưu state vào localStorage           │
│                                                         │
│  9. Frontend redirect to /dashboard                    │
│     navigate('/dashboard')                             │
│                                                         │
│  10. Dashboard component render:                       │
│      - Display user info (accountName, status)         │
│      - Show logout button                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PROTECTED API REQUEST FLOW                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Component gọi API:                                 │
│     apiClient.get('/users')                            │
│                                                         │
│  2. Request Interceptor:                               │
│     - Lấy accessToken từ Redux state                   │
│     - Thêm vào header:                                 │
│       Authorization: Bearer <accessToken>              │
│                                                         │
│  3. Axios gửi request với token                        │
│                                                         │
│  4. Backend verify token:                              │
│     ✓ Hợp lệ → Trả về data                             │
│     ✗ Hết hạn → Trả về 401                             │
│                                                         │
│  5. Response Interceptor xử lý:                        │
│     ✓ 200-299 → Return response                        │
│     ✗ 401 → User token invalid (logout?)               │
│                                                         │
│  6. Component nhận data                                │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  PAGE REFRESH FLOW                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User refresh page (F5)                             │
│                                                         │
│  2. App.jsx mounts                                     │
│                                                         │
│  3. Redux Persist REHYDRATE:                           │
│     - Load state từ localStorage                       │
│     - Restore Redux auth state                         │
│                                                         │
│  4. PersistGate cho phép render App                    │
│                                                         │
│  5. State restored:                                    │
│     - user data                                        │
│     - accessToken                                      │
│     - isAuthenticated = true                           │
│                                                         │
│  6. ProtectedRoute check isAuthenticated:              │
│     ✓ True → Render Dashboard                          │
│     ✗ False → Redirect to /login                       │
│                                                         │
│  7. User không bị logout                               │
│     (stays logged in after page refresh)               │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    LOGOUT FLOW                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User click "Logout" button                         │
│                                                         │
│  2. Component gọi logout hook                          │
│     useLogout() → handleLogout()                       │
│                                                         │
│  3. Redux dispatch logout action                       │
│                                                         │
│  4. Redux reducer clear state:                         │
│     - user = null                                      │
│     - accessToken = null                               │
│     - isAuthenticated = false                          │
│                                                         │
│  5. Redux Persist xóa localStorage                     │
│                                                         │
│  6. Frontend redirect to /login                        │
│     navigate('/login')                                 │
│                                                         │
│  7. Login page render                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 16. Redux State Structure

```javascript
{
  auth: {
    user: {
      accountId: 3,
      accountName: "admin@crm.local",
      id: "019e9374-5f33-77cc-911b-4fa0ac60950b",
      status: "ENABLE"
    },
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    isAuthenticated: true,
    isLoading: false,
    error: null
  }
}
```

---

## 17. Request/Response Examples

### Request to Login

```javascript
POST /auth/login
Content-Type: application/json

{
  "accountName": "admin@crm.local",
  "password": "password123"
}
```

### Response from Login

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accountId": 3,
    "accountName": "admin@crm.local",
    "isLogin": true,
    "login": 0,
    "description": null,
    "employeeId": null,
    "status": "ENABLE",
    "id": "019e9374-5f33-77cc-911b-4fa0ac60950b",
    "createdAt": "2026-06-04T16:25:37.856Z",
    "updatedAt": "2026-06-04T16:25:37.856Z",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhZG1pbkBjcm0ubG9jYWwiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzgwNzU2NTMwLCJleHAiOjE3ODA4NDI5MzB9.WQXSXsWDPsHxa8v2XupAh4mXYiaurHwlj-cQ19b7vTo"
  }
}
```

### Authenticated Request

```javascript
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 18. File Structure

```
src/
├── redux/
│   ├── slices/
│   │   └── authSlice.js          # Auth reducer (login, logout, Thunk)
│   ├── selectors/
│   │   └── authSelectors.js      # Selectors
│   └── store.js                  # Store + persist
├── services/
│   ├── apiClient.js              # Axios + interceptor
│   └── authService.js            # Login API call
├── hooks/
│   ├── useAuth.js                # Get auth state
│   ├── useLogin.js               # Login action
│   └── useLogout.js              # Logout action
├── pages/
│   ├── auth/Login.jsx            # Login form
│   └── Dashboard/Dashboard.jsx        # Dashboard page
├── components/
│   └── auth/ProtectedRoute.jsx    # Route protection
├── App.jsx                       # Main app
├── main.jsx                      # Entry point
└── .env                          # Environment variables
```

---

## 19. Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "redux": "^4.2.1",
    "react-redux": "^8.1.1",
    "@reduxjs/toolkit": "^1.9.3",
    "redux-persist": "^6.0.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "vite": "^4.3.0"
  }
}
```

---

## 20. Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cat > .env << EOF
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000
EOF

# 3. Start development server
npm run dev
```

---

## 21. Best Practices

### ✅ DO's

```javascript
// ✅ ĐÚNG - Sử dụng custom hooks
const { user, isAuthenticated } = useAuth();

// ✅ ĐÚNG - Dispatch thông qua hooks
const { login } = useLogin();
await login(credentials);

// ✅ ĐÚNG - Handle errors properly
try {
  await login(credentials);
} catch (error) {
  setError(error.response?.data?.message);
}

// ✅ ĐÚNG - Check auth before rendering
{isAuthenticated && <Dashboard />}

// ✅ ĐÚNG - Use selectors để lấy state
const accessToken = useSelector(selectAccessToken);
```

### ❌ DON'Ts

```javascript
// ❌ SAI - Hardcode tokens
const token = 'my-secret-token';

// ❌ SAI - Lưu tokens ở component state
const [token, setToken] = useState(null);

// ❌ SAI - Call API trực tiếp không có interceptor
fetch('/api/data');

// ❌ SAI - Không handle errors
const result = await login(credentials);

// ❌ SAI - Store tokens ở localStorage directly
localStorage.setItem('token', token);
```

---

## 22. Testing Checklist

- [ ] Login form displays correctly
- [ ] Can login with valid credentials
- [ ] Redux state updates after login
- [ ] Token added to API requests
- [ ] Protected routes accessible when authenticated
- [ ] Redirects to login when not authenticated
- [ ] Logout clears all state
- [ ] State persists after page refresh
- [ ] localStorage not have auth data
- [ ] Error messages display correctly

---

## 23. Troubleshooting

### Token not in request header

```javascript

// Check Request Interceptor
apiClient.interceptors.request.use((config) => {
  console.log('Request headers:', config.headers);
  return config;
});
```

## 24. Lời kết

Quy trình này cung cấp **hệ thống authentication** với:

✅ **Redux Setup** - Chỉ cần 1 slice (auth)
✅ **Axios Interceptor** - Tự động thêm token
✅ **Redux Persist** - Lưu state vào localStorage khôn lưu accessToken và refeshtoken cùng user người dùng
✅ **Protected Routes** - Protect dựa vào auth state
✅ **Custom Hooks** - useAuth, useLogin, useLogout
✅ **Error Handling** - Xử lý lỗi đơn giản
