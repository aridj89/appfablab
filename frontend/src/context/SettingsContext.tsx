import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

interface SettingsContextType {
    language: string;
    setLanguage: (lang: string) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    layoutDirection: 'ltr' | 'rtl';
    setLayoutDirection: (dir: 'ltr' | 'rtl') => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize') || '16'));
    const [layoutDirection, setLayoutDirection] = useState<'ltr' | 'rtl'>((localStorage.getItem('layoutDirection') as 'ltr' | 'rtl') || 'ltr');

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        localStorage.setItem('layoutDirection', layoutDirection);
        document.documentElement.dir = layoutDirection;
    }, [layoutDirection]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize.toString());
        document.documentElement.style.setProperty('--root-font-size', `${fontSize}px`);
    }, [fontSize]);

    const t = (key: string) => {
        return translations[language]?.[key] || key;
    };

    const isRTL = layoutDirection === 'rtl';

    return (
        <SettingsContext.Provider value={{ language, setLanguage, fontSize, setFontSize, layoutDirection, setLayoutDirection, t, isRTL }}>
            <div className={isRTL ? 'rtl-context' : ''}>
                {children}
            </div>
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};
