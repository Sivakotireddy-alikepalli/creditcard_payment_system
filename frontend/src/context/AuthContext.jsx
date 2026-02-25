import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            authAPI.profile()
                .then(r => setUser(r.data))
                .catch(() => { localStorage.clear(); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (tokens, userData) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        setUser(userData);
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) await authAPI.logout(refresh);
        } catch { }
        localStorage.clear();
        setUser(null);
    };

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
