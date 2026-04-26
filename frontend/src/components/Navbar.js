import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-logo">
          ❤️‍🔥 Life<span>QR</span>
        </Link>
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>Profile</Link>
          <Link to="/qr" className={`nav-link ${location.pathname === '/qr' ? 'active' : ''}`}>My QR</Link>
          <Link to="/scan-logs" className={`nav-link ${location.pathname === '/scan-logs' ? 'active' : ''}`}>Scan Log</Link>
          <button onClick={handleLogout} className="btn btn-ghost" style={{fontSize:13,padding:'8px 14px'}}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
