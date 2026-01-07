'use client';

import React from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useBlogs } from '../../hooks/useBlogs';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useQuotes } from '../../hooks/useQuotes';

export default function DashboardPage() {
    const { users, loading: usersLoading } = useUsers();
    const { pagination: blogPagination, loading: blogsLoading } = useBlogs(1, 1);
    const { pagination: quotePagination, loading: quotesLoading } = useQuotes(1, 1);
    const { data: productsData, loading: productsLoading } = useProducts(1, 1);
    const { data: categoriesData, loading: categoriesLoading } = useCategories(1, 1);

    const isLoading = usersLoading || blogsLoading || quotesLoading || productsLoading || categoriesLoading;

    const stats = [
        { label: 'Total Users', value: users.length.toString(), icon: '👥' },
        { label: 'Total Blogs', value: blogPagination.total.toString(), icon: '📝' },
        { label: 'Total Quotes', value: quotePagination.total.toString(), icon: '' },
        { label: 'Total Products', value: (productsData?.total || 0).toString(), icon: '📦' },
        { label: 'Total Categories', value: categoriesData.total.toString(), icon: '📁' },
    ];

    return (
        <div className="flex flex-col gap-xl">
            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-lg">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-panel p-lg rounded-lg flex flex-col gap-sm transition-all hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-lg border border-border">
                        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xl mb-xs">
                            {stat.icon}
                        </div>
                        <div className="text-3xl font-bold text-text-main">
                            {isLoading ? '...' : stat.value}
                        </div>
                        <div className="text-text-muted text-sm">
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
