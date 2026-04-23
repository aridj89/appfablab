import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import '../App.css';

const Profile = () => {
    const { t } = useSettings();
    const [user, setUser] = useState<any>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
                setFullName(response.data.full_name);
                setEmail(response.data.email);
                if (response.data.profile_picture) {
                    setPreviewUrl(`http://127.0.0.1:8000${response.data.profile_picture}`);
                }
                setLoading(false);
            } catch (err) {
                localStorage.removeItem('access');
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        
        const token = localStorage.getItem('access');
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('email', email);
        if (password) formData.append('password', password);
        if (profilePicture) formData.append('profile_picture', profilePicture);

        try {
            const response = await axios.patch('http://127.0.0.1:8000/api/profile/', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            setUser(response.data);
            setMessage({ type: 'success', text: t('save_success') || 'Profile updated!' });
            setPassword(''); // Clear password field after save
        } catch (err: any) {
            setMessage({ type: 'error', text: t('save_error') || 'Failed to update!' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('is_staff');
        navigate('/login');
    };

    if (loading) return <div className="container"><div className="glass-card"><p>Loading...</p></div></div>;

    const isAdmin = user?.is_staff === true;

    return (
        <div className="container" style={{overflowY: 'auto', padding: '100px 20px'}}>
            <div className="glass-card" style={{maxWidth: isAdmin ? '800px' : '500px'}}>
                <h1>{t('profile')}</h1>
                <p className="subtitle">{isAdmin ? t('admin_panel') : t('dashboard')}</p>
                
                {message.text && (
                    <div className={message.type === 'success' ? 'live-tag' : 'error-toast'} style={{marginBottom: '20px'}}>
                        {message.text}
                    </div>
                )}

                {isAdmin ? (
                    <form onSubmit={handleSave} className="auth-form">
                        <div className="profile-avatar-container" onClick={() => fileInputRef.current?.click()}>
                            <img 
                                src={previewUrl || 'https://ui-avatars.com/api/?name=Admin&background=f58025&color=fff&size=150'} 
                                alt="Profile" 
                                className="profile-avatar" 
                            />
                            <div className="profile-edit-badge">
                                ✎
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                style={{display: 'none'}} 
                                accept="image/*"
                            />
                        </div>

                        <div className="profile-grid">
                            <div className="form-group-framed">
                                <label>{t('full_name')}</label>
                                <input 
                                    type="text" 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    placeholder={t('full_name')}
                                    required
                                />
                            </div>

                            <div className="form-group-framed">
                                <label>{t('email')}</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder={t('email')}
                                    required
                                />
                            </div>

                            <div className="form-group-framed">
                                <label>{t('student_id')}</label>
                                <input 
                                    type="text" 
                                    value={user.student_card_number} 
                                    readOnly
                                    style={{opacity: 0.7, cursor: 'not-allowed'}}
                                />
                            </div>

                            <div className="form-group-framed">
                                <label>{t('password')}</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder={t('password')}
                                />
                            </div>
                        </div>

                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? '...' : t('save')}
                        </button>
                    </form>
                ) : (
                    <div className="status-box" style={{textAlign: 'left'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px'}}>
                             <img 
                                src={previewUrl || `https://ui-avatars.com/api/?name=${user.full_name}&background=1e293b&color=f58025&size=80`} 
                                alt="Profile" 
                                style={{width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--primary)'}} 
                            />
                            <div>
                                <h2 style={{fontSize: '1.5rem', marginBottom: '4px'}}>{user.full_name}</h2>
                                <p style={{color: 'var(--subtitle-color)', fontSize: '0.9rem'}}>{user.email}</p>
                            </div>
                        </div>
                        
                        <div className="info-row">
                            <span>{t('student_id')}</span>
                            <p>{user.student_card_number}</p>
                        </div>
                        <div className="info-row">
                            <span>Role</span>
                            <p>Student</p>
                        </div>
                    </div>
                )}

                <div className="logout-btn-container">
                    <button onClick={handleLogout} className="btn-danger" style={{width: '100%'}}>
                        {t('logout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
