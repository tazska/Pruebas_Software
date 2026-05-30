import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, LayoutDashboard, LogIn } from 'lucide-react';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <ShoppingBag size={24} color="var(--primary)" />
          <span>MiniShop</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Hola, <strong>{user.username}</strong>
              </span>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                <LogOut size={16} /> Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn">
              <LogIn size={18} /> Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
