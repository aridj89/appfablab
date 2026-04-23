import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import '../App.css';

const Labo = () => {
    const { t, language } = useSettings();
    const [activeSession, setActiveSession] = useState<any>(null);
    const [location, setLocation] = useState('');
    const [activity, setActivity] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [durationStr, setDurationStr] = useState('00:00:00');

    const locations = [
        { id: 'SALLE_ELECTRONIC', name: language === 'ar' ? 'غرفة الإلكترونيات' : language === 'fr' ? 'Salle Electronique' : 'Electronic Room', icon: '⚡' },
        { id: 'SALLE_MECANIC', name: language === 'ar' ? 'غرفة الميكانيك' : language === 'fr' ? 'Salle Mécanique' : 'Mechanic Room', icon: '⚙️' },
        { id: 'SALLE_MAINTENANCE', name: language === 'ar' ? 'غرفة الصيانة' : language === 'fr' ? 'Salle Maintenance' : 'Maintenance Room', icon: '🔧' },
        { id: 'BUREAU_3D', name: language === 'ar' ? 'مكتب الطباعة ثلاثية الأبعاد' : language === 'fr' ? 'Bureau Impression 3D' : '3D Printing Desk', icon: '🖨️' },
        { id: 'BUREAU_CC', name: language === 'ar' ? 'مكتب CC' : language === 'fr' ? 'Bureau CC' : 'CC Desk', icon: '💻' },
    ];

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        let timer: any;
        if (activeSession) {
            timer = setInterval(() => {
                const start = new Date(activeSession.entry_time).getTime();
                const now = new Date().getTime();
                const diff = now - start;
                
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                
                setDurationStr(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [activeSession]);

    const fetchAllData = async () => {
        const token = localStorage.getItem('access');
        try {
            const activeRes = await axios.get('http://127.0.0.1:8000/api/lab/active-session/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveSession(activeRes.data);
        } catch (err: any) {
            if (err.response?.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                localStorage.removeItem('is_staff');
                window.location.href = '/login';
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access');
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/lab/check-in/', 
                { location, activity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActiveSession(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        const token = localStorage.getItem('access');
        try {
            await axios.post('http://127.0.0.1:8000/api/lab/check-out/', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveSession(null);
            setError('');
            fetchAllData();
        } catch (err: any) {
            setError('Check-out failed');
        }
    };

    if (loading) return <div className="container"><p>{t('loading') || '...'}</p></div>;

    return (
        <div className="container">
            <div className="glass-card" style={{ maxWidth: '700px', width: '100%', padding: '40px' }}>
                <div className="lab-header">
                    <h1>{t('lab_control')}</h1>
                    <p className="subtitle">{t('lab_hours')}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '0.85rem', color: 'var(--subtitle-color)' }}>
                        <span>📅 {new Date().toLocaleDateString()}</span>
                        <span style={{ color: activeSession ? '#10b981' : 'var(--subtitle-color)' }}>
                            {activeSession ? '● ' + (t('live_session') || 'LIVE') : '○ ' + (t('no_session') || 'No active session')}
                        </span>
                    </div>
                </div>

                {error && <div className="error-toast" style={{ marginTop: '20px' }}>{error}</div>}

                {activeSession ? (
                    <div style={{ marginTop: '30px' }}>
                        <div className="status-badge live" style={{ marginBottom: '15px' }}>● {t('live_session')}</div>
                        <div className="timer-display">{durationStr}</div>
                        
                        <div className="session-info-grid">
                            <div className="info-box">
                                <label>{t('room')}</label>
                                <p>{locations.find(l => l.id === activeSession.location)?.name}</p>
                            </div>
                            <div className="info-box">
                                <label>{t('started')}</label>
                                <p>{new Date(activeSession.entry_time).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        <div className="activity-info">
                            <label>{t('current_activity')}</label>
                            <p>{activeSession.activity}</p>
                        </div>

                        <button onClick={handleCheckOut} className="checkout-btn" style={{ width: '100%' }}>
                            {t('end_session')}
                        </button>
                    </div>
                ) : (
                    <div style={{ marginTop: '30px' }}>
                        <h2 style={{ marginBottom: '8px' }}>{t('enter_lab')}</h2>
                        <p className="subtitle" style={{ marginBottom: '25px' }}>{t('describe_activity')}</p>
                        
                        <form onSubmit={handleCheckIn} className="auth-form">
                            <div className="location-grid">
                                {locations.map(loc => (
                                    <div 
                                        key={loc.id} 
                                        className={`location-card ${location === loc.id ? 'selected' : ''}`}
                                        onClick={() => setLocation(loc.id)}
                                    >
                                        <span className="loc-icon">{loc.icon}</span>
                                        <span className="loc-name">{loc.name}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="input-group" style={{ marginTop: '20px' }}>
                                <textarea 
                                    placeholder={t('describe_activity')}
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                    required
                                    className="custom-textarea"
                                />
                            </div>
                            
                            <button type="submit" disabled={!location || !activity} className="checkin-btn" style={{ width: '100%' }}>
                                {t('begin_session')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Labo;
