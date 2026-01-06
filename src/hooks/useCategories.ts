import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import { Category } from '../types';

export function useCategories(page: number = 1, pageSize: number = 10) {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['categories', page, pageSize],
        queryFn: () => categoryService.getAll(page, pageSize),
    });

    return {
        data: data || { items: [], total: 0, page, size: pageSize, pages: 0 },
        loading,
        error: error instanceof Error ? error.message : (error ? String(error) : ''),
        refetch
    };
}
