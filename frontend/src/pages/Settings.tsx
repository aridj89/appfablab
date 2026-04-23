import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import '../App.css';

const Settings = () => {
    const { language, setLanguage, fontSize, setFontSize, layoutDirection, setLayoutDirection, t } = useSettings();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('access');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({
                full_name: response.data.full_name,
                email: response.data.email,
                password: '',
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access');
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;

        try {
            await axios.patch('http://127.0.0.1:8000/api/profile/', updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'Profile updated!', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Failed to update!', type: 'error' });
        }
    };

    if (loading) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container" style={{overflowY: 'auto', padding: '100px 20px', display: 'block'}}>
            <div className="glass-card" style={{maxWidth: '800px', margin: '0 auto'}}>
                <h1>{t('settings')}</h1>
                <p className="subtitle">{t('account_settings')}</p>

                {message.text && (
                    <div className={message.type === 'success' ? 'live-tag' : 'error-toast'} style={{marginBottom: '20px'}}>
                        {message.text}
                    </div>
                )}

                <div className="profile-grid">
                    <div className="form-group-framed">
                        <label>{t('full_name')}</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group-framed">
                        <label>{t('email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group-framed">
                        <label>{t('password')}</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{gridColumn: '1 / -1', marginTop: '20px'}}>
                        <p className="subtitle" style={{textAlign: 'left', marginBottom: '15px'}}>{t('app_settings')}</p>
                    </div>

                    <div className="form-group-framed">
                        <label>{t('language')}</label>
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '1rem', padding: '8px 0', cursor: 'pointer'}}
                        >
                            <option value="en" style={{background: 'var(--card-bg)'}}>English 🇬🇧</option>
                            <option value="fr" style={{background: 'var(--card-bg)'}}>Français 🇫🇷</option>
                            <option value="ar" style={{background: 'var(--card-bg)'}}>العربية 🇩🇿</option>
                        </select>
                    </div>

                    <div className="form-group-framed">
                        <label>{t('layout_dir')}</label>
                        <select 
                            value={layoutDirection} 
                            onChange={(e) => setLayoutDirection(e.target.value as 'ltr' | 'rtl')}
                            style={{width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '1rem', padding: '8px 0', cursor: 'pointer'}}
                        >
                            <option value="ltr" style={{background: 'var(--card-bg)'}}>{t('ltr')}</option>
                            <option value="rtl" style={{background: 'var(--card-bg)'}}>{t('rtl')}</option>
                        </select>
                    </div>

                    <div className="form-group-framed" style={{gridColumn: '1 / -1'}}>
                        <label>{t('font_size')} ({fontSize}px)</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0'}}>
                            <span style={{fontSize: '0.8rem'}}>A</span>
                            <input 
                                type="range" 
                                min="12" 
                                max="24" 
                                value={fontSize} 
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                style={{flexGrow: 1, accentColor: 'var(--primary)'}}
                            />
                            <span style={{fontSize: '1.2rem'}}>A</span>
                        </div>
                    </div>
                </div>

                <button onClick={handleSubmit} className="save-btn" style={{marginTop: '40px'}}>
                    {t('save')}
                </button>
            </div>
        </div>
    );
};

export default Settings;
