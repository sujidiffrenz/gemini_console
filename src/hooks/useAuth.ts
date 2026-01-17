import { useAuthContext } from '../providers/AuthProvider';

export function useAuth() {
    const { login, logout, loading, isAuthenticated } = useAuthContext();

    return { login, logout, loading, isAuthenticated };
}
