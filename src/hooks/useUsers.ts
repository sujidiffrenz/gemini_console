import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { User, PaginatedResult } from '../types';

export function useUsers(page = 1, pageSize = 10) {
    const { data, isLoading: loading, error, isFetching, refetch } = useQuery({
        queryKey: ['users', page, pageSize],
        queryFn: async () => {
            console.log('useUsers: queryFn triggered');
            try {
                const data = await userService.getAll(page, pageSize);
                console.log('useUsers: userService.getAll returned:', data);
                return data;
            } catch (err) {
                console.error('useUsers: userService.getAll errored:', err);
                throw err;
            }
        },
        retry: false,
    });

    const defaultData: PaginatedResult<User> = { items: [], total: 0, page, size: pageSize, pages: 0 };
    const result = data || defaultData;

    console.log('useUsers Lifecycle:', { usersCount: result.items.length, loading, isFetching, hasError: !!error });

    return {
        users: result.items,
        pagination: {
            total: result.total,
            page: result.page,
            size: result.size,
            pages: result.pages
        },
        loading,
        error: error instanceof Error ? error.message : (error ? String(error) : ''),
        refetch
    };
}
