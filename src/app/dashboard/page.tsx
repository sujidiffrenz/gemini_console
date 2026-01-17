'use client';

import React from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useBlogs } from '../../hooks/useBlogs';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useQuotes } from '../../hooks/useQuotes';

export default function DashboardPage() {
    const { pagination: userPagination, loading: usersLoading } = useUsers(1, 1);
    const { pagination: blogPagination, loading: blogsLoading } = useBlogs(1, 1);
    const { pagination: quotePagination, loading: quotesLoading } = useQuotes(1, 1);
    const { data: productsData, loading: productsLoading } = useProducts(1, 1);
    const { data: categoriesData, loading: categoriesLoading } = useCategories(1, 1);

    const isLoading = usersLoading || blogsLoading || quotesLoading || productsLoading || categoriesLoading;

    const stats = [
        { label: 'Total Users', value: userPagination.total.toString(), icon: '👥' },
        { label: 'Total Blogs', value: blogPagination.total.toString(), icon: '📝' },
        { label: 'Total Quotes', value: quotePagination.total.toString(), icon: '' },
        { label: 'Total Products', value: (productsData?.total || 0).toString(), icon: '📦' },
        { label: 'Total Categories', value: categoriesData.total.toString(), icon: '📁' },
    ];

    return (
        <div className="flex flex-col gap-6 sm:gap-lg">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-lg">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-panel p-5 sm:p-lg rounded-xl flex flex-col gap-sm transition-all hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-lg border border-border group">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl mb-xs transition-colors group-hover:bg-primary group-hover:text-white">
                            {stat.icon}
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-text-main">
                            {isLoading ? '...' : stat.value}
                        </div>
                        <div className="text-text-muted text-sm font-medium">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Optional: Add Activity table if needed */}
            {/* <div className="glass-panel border border-border rounded-lg overflow-hidden">
                <div className="p-lg border-b border-border">
                    <h2 className="text-lg font-semibold text-text-main">Recent Activity</h2>
                </div>
            </div> */}
        </div>
    );
}
