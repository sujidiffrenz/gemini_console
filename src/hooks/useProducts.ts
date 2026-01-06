import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { Product } from '../types';

export function useProducts() {
    const { data: products = [], isLoading: loading, error, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: productService.getAll,
    });

    return {
        products,
        loading,
        error: error instanceof Error ? error.message : (error ? String(error) : ''),
        refetch
    };
}
