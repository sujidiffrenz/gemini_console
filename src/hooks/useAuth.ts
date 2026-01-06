import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';

export function useAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async (username: string, password: string) => {
        setLoading(true);
        setError('');
        try {
            await authService.login(username, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        router.push('/login');
    };

    return { login, logout, loading, error };
}
