import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { Product } from '../types';

export function useProducts(page: number = 1, pageSize: number = 10) {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['products', page, pageSize],
        queryFn: () => productService.getAll(page, pageSize),
    });

    return {
        data,
        loading,
        error: error instanceof Error ? error.message : (error ? String(error) : ''),
        refetch
    };
}
