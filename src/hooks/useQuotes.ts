import { useQuery } from '@tanstack/react-query';
import { quoteService } from '../services/quote.service';

export const useQuotes = (page = 1, pageSize = 10) => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['quotes', page, pageSize],
        queryFn: () => quoteService.getAll(page, pageSize),
    });

    const quotes = data?.items || [];
    const pagination = {
        total: data?.total || 0,
        page: data?.page || page,
        size: data?.size || pageSize,
        pages: data?.pages || 0
    };

    return {
        quotes,
        loading,
        error: error instanceof Error ? error.message : (error ? String(error) : null),
        pagination,
        refetch
    };
};
