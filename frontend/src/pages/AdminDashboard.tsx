import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import '../App.css';

const AdminDashboard = () => {
    const { t } = useSettings();
    const [sessions, setSessions] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'sessions' | 'students'>('students');
    const [loading, setLoading] = useState(true);
    const [editingPassword, setEditingPassword] = useState<{id: number, email: string} | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('access');
        try {
            if (activeTab === 'sessions') {
                const res = await axios.get('http://127.0.0.1:8000/api/lab/sessions/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSessions(res.data);
            } else {
                const res = await axios.get('http://127.0.0.1:8000/api/admin/students/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(res.data);
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                localStorage.removeItem('is_staff');
                window.location.href = '/login';
            }
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const toggleAccess = async (id: number) => {
        const token = localStorage.getItem('access');
        try {
            await axios.post(`http://127.0.0.1:8000/api/admin/students/${id}/toggle-access/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Error');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPassword) return;
        const token = localStorage.getItem('access');
        try {
            await axios.post(`http://127.0.0.1:8000/api/admin/students/${editingPassword.id}/reset-password/`, 
                { password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Success');
            setEditingPassword(null);
            setNewPassword('');
        } catch (err) {
            alert('Error');
        }
    };

    const calculateDuration = (start: string, end: string | null) => {
        if (!end) return '...';
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return `${hrs}h ${mins}m`;
    };

    if (loading && !editingPassword) return <div className="container"><p>{t('loading') || 'Loading...'}</p></div>;

    return (
        <div className="container" style={{display: 'block', maxWidth: '1200px', margin: '0 auto'}}>
            <div className="admin-tabs">
                <button 
                    className={activeTab === 'students' ? 'active' : ''} 
                    onClick={() => setActiveTab('students')}
                >
                    {t('student_id')}
                </button>
                <button 
                    className={activeTab === 'sessions' ? 'active' : ''} 
                    onClick={() => setActiveTab('sessions')}
                >
                    {t('lab_logs')}
                </button>
            </div>

            <div className="glass-card" style={{maxWidth: '100%', padding: '40px'}}>
                {activeTab === 'students' ? (
                    <>
                        <h1>{t('admin_panel')}</h1>
                        <p className="subtitle">{t('account_settings')}</p>
                        
                        <div className="table-container" style={{marginTop: '30px'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                                <thead>
                                    <tr style={{borderBottom: '2px solid var(--glass-border)', color: 'var(--subtitle-color)', fontSize: '0.8rem'}}>
                                        <th style={{padding: '16px'}}>Student</th>
                                        <th style={{padding: '16px'}}>ID</th>
                                        <th style={{padding: '16px'}}>Status</th>
                                        <th style={{padding: '16px'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student.id} style={{borderBottom: '1px solid var(--glass-border)'}}>
                                            <td style={{padding: '16px'}}>
                                                <div style={{fontWeight: 700}}>{student.full_name}</div>
                                                <div style={{fontSize: '0.8rem', color: 'var(--subtitle-color)'}}>{student.email}</div>
                                            </td>
                                            <td style={{padding: '16px'}}>{student.student_card_number}</td>
                                            <td style={{padding: '16px'}}>
                                                <span className={`status-pill ${student.is_active ? 'active' : 'inactive'}`}>
                                                    {student.is_active ? '✔' : '...'}
                                                </span>
                                            </td>
                                            <td style={{padding: '16px'}}>
                                                <div style={{display: 'flex', gap: '10px'}}>
                                                    <button 
                                                        onClick={() => toggleAccess(student.id)}
                                                        className={`btn-sm ${student.is_active ? 'btn-danger' : 'btn-success'}`}
                                                    >
                                                        {student.is_active ? '⛔' : '✔'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingPassword({id: student.id, email: student.email})}
                                                        className="btn-sm btn-secondary"
                                                    >
                                                        🔑
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <h1>{t('lab_logs')}</h1>
                        <div className="table-container" style={{marginTop: '30px'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                                <thead>
                                    <tr style={{borderBottom: '2px solid var(--glass-border)', color: 'var(--subtitle-color)', fontSize: '0.8rem'}}>
                                        <th style={{padding: '16px'}}>Student</th>
                                        <th style={{padding: '16px'}}>Room</th>
                                        <th style={{padding: '16px'}}>Entry</th>
                                        <th style={{padding: '16px'}}>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map(session => (
                                        <tr key={session.id} style={{borderBottom: '1px solid var(--glass-border)'}}>
                                            <td style={{padding: '16px'}}>
                                                <div style={{fontWeight: 600}}>{session.user_name}</div>
                                            </td>
                                            <td style={{padding: '16px'}}>{session.location.replace('_', ' ')}</td>
                                            <td style={{padding: '16px'}}>{new Date(session.entry_time).toLocaleString()}</td>
                                            <td style={{padding: '16px'}}>{calculateDuration(session.entry_time, session.exit_time)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {editingPassword && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content" style={{maxWidth: '400px'}}>
                        <h2>{t('reset_pass')}</h2>
                        <p className="subtitle">{editingPassword.email}</p>
                        <form onSubmit={handleResetPassword} className="auth-form">
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    placeholder={t('password')} 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit">{t('save')}</button>
                                <button type="button" onClick={() => setEditingPassword(null)} className="btn-secondary">X</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
