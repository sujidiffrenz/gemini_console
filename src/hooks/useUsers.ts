import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { User } from '../types';

export function useUsers() {
    const { data: users = [], isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            console.log('useUsers: queryFn triggered');
            try {
                const data = await userService.getAll();
                console.log('useUsers: userService.getAll returned:', data);
                return data;
            } catch (err) {
                console.error('useUsers: userService.getAll errored:', err);
                throw err;
            }
        },
        retry: false, // Disable retries for debugging
    });

    console.log('useUsers Lifecycle:', { usersCount: users.length, loading, isFetching, hasError: !!error });

    return {
        users,
        loading,
        error: error instanceof Error ? error.message : (error ? String(error) : ''),
        refetch
    };
}
