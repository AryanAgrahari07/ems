import './App.css';
import { BrowserRouter as Router, Route, Routes,Navigate } from "react-router-dom";
import Login from './pages/login';
import Signup from './pages/signup';
import { useEffect, useState } from 'react';
import Dashboard from './pages/dashboard';
import Emp from './components/employee-details';
import ProtectedRoute from './ProtectedRoute'; 
import {jwtDecode} from 'jwt-decode';
import Attendance from './components/Attendance';

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decodedToken = jwtDecode(savedToken);
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setToken('');
        } else {
          setToken(savedToken);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setToken('');
      }
    }
  }, []);

  const handleSetToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    setToken(token);
  };

  return (
    <Router>
    <div className="App">
          
      <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={!token ? <Login setToken={handleSetToken} /> : <Navigate to="/dashboard" />} />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Dashboard token={token} setToken={handleSetToken} />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/employee-details/:companyId/employee/:employeeId' element={ <ProtectedRoute><Emp /></ProtectedRoute>} />
          <Route path='/dashboard/employee-details/:companyId/employee/:employeeId/attendance' element={ <ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>

    </div>
    </Router>
  );
}

export default App;
