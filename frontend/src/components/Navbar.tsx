import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Navbar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('access');
    const isStaff = localStorage.getItem('is_staff') === 'true';

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('is_staff');
        navigate('/login');
    };

    if (!isAuthenticated) return null;

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <>
            <button className={`burger-btn ${isCollapsed ? 'collapsed' : ''}`} onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </button>
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-brand">
                    {isCollapsed ? 'F' : <>FAB<span>LAB</span></>}
                </div>
                <nav className="sidebar-nav">
                    {!isStaff && (
                        <Link to="/labo" className={isActive('/labo')}>
                            <span className="icon">🔬</span>
                            {!isCollapsed && ` ${t('dashboard')}`}
                        </Link>
                    )}
                    <Link to="/profile" className={isActive('/profile')}>
                        <span className="icon">👤</span>
                        {!isCollapsed && ` ${t('profile')}`}
                    </Link>
                    {isStaff && (
                        <Link to="/admin" className={isActive('/admin')}>
                            <span className="icon">🛡️</span>
                            {!isCollapsed && ` ${t('admin_panel')}`}
                        </Link>
                    )}
                    <Link to="/settings" className={isActive('/settings')}>
                        <span className="icon">⚙️</span>
                        {!isCollapsed && ` ${t('settings')}`}
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        {isCollapsed ? '🚪' : t('logout')}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
