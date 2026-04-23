import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { GoogleLogin } from '@react-oauth/google';
import '../App.css';

const Login = () => {
    const { t, language, setLanguage, setLayoutDirection } = useSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        setLayoutDirection(lang === 'ar' ? 'rtl' : 'ltr');
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/google-login/', {
                token: credentialResponse.credential,
            });
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            localStorage.setItem('is_staff', response.data.is_staff);
            if (response.data.is_staff === true || response.data.is_staff === 'true') {
                navigate('/admin');
            } else {
                navigate('/labo');
            }
        } catch (err: any) {
            setError('Google login failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                email,
                password,
            });
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            localStorage.setItem('is_staff', response.data.is_staff);
            if (response.data.is_staff === true || response.data.is_staff === 'true') {
                navigate('/admin');
            } else {
                navigate('/labo');
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.status === 403) {
                setError('Your account is pending approval by the admin.');
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="glass-card">
                <div className="lang-switcher">
                    <button
                        type="button"
                        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => handleLanguageChange('en')}
                    >EN</button>
                    <button
                        type="button"
                        className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
                        onClick={() => handleLanguageChange('fr')}
                    >FR</button>
                    <button
                        type="button"
                        className={`lang-btn ${language === 'ar' ? 'active' : ''}`}
                        onClick={() => handleLanguageChange('ar')}
                    >ع</button>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <img 
                        src="/logo.png" 
                        alt="FabLab Logo" 
                        style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }}
                        onError={(e: any) => e.target.style.display = 'none'} 
                    />
                </div>
                <h1>FAB<span>LAB</span></h1>
                <p className="subtitle">{t('welcome')}</p>
                {error && <p style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{error}</p>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder={t('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder={t('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">{t('login_title')}</button>
                </form>

                <div className="separator">
                    <span>{t('or') || 'OR'}</span>
                </div>

                <div className="social-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_blue"
                        shape="pill"
                        width="100%"
                    />
                </div>
                <p className="read-the-docs">
                    {t('no_account')} <Link to="/register" style={{color: 'var(--primary)'}}>{t('signup_title')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
