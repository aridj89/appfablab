import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import '../App.css';

const Register = () => {
    const { t } = useSettings();
    const [formData, setFormData] = useState({
        full_name: '',
        student_card_number: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/register/', formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.email?.[0] || 'Registration failed. Check your data.');
        }
    };

    return (
        <div className="auth-page">
            <div className="glass-card">
                <h1>FAB<span>LAB</span></h1>
                <p className="subtitle">{t('join')}</p>
                {error && <p style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{error}</p>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <input
                            type="text"
                            name="full_name"
                            placeholder={t('full_name')}
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            name="student_card_number"
                            placeholder={t('student_id')}
                            value={formData.student_card_number}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder={t('email')}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder={t('password')}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">{t('signup_title')}</button>
                </form>
                <p className="read-the-docs">
                    {t('already_have')} <Link to="/login" style={{color: 'var(--primary)'}}>{t('login_title')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
