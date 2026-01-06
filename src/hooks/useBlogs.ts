import { useQuery } from '@tanstack/react-query';
import { blogService } from '../services/blog.service';
import { Blog, PaginatedResult } from '../types';

export const useBlogs = (page = 1, pageSize = 10) => {
    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['blogs', page, pageSize],
        queryFn: () => blogService.getAll(page, pageSize),
    });

    const blogs = data?.items || [];
    const pagination = {
        total: data?.total || 0,
        page: data?.page || page,
        size: data?.size || pageSize,
        pages: data?.pages || 0
    };

    return {
        blogs,
        loading,
        error: error instanceof Error ? error.message : (error ? String(error) : null),
        pagination,
        refetch
    };
};
