'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '../../../hooks/useCategories';
import { Category } from '../../../types';

export default function CategoriesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data, loading, error, refetch } = useCategories(page, pageSize);

    const categories = data?.items || [];
    const totalPages = data?.pages || 0;

    const filteredCategories = categories.filter((cat: Category) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(p => p + 1);
    };

    if (loading && categories.length === 0) {
        return <div className="flex flex-col gap-lg text-center p-8">Loading categories...</div>;
    }

    if (error) {
        const isDbError = error.toLowerCase().includes('500') || error.toLowerCase().includes('internal server error') || error.toLowerCase().includes('econnrefused') || error.toLowerCase().includes('econnreset') || error.toLowerCase().includes('socket hang up');

        return (
            <div className="flex flex-col gap-lg">
                <div className="text-error text-center p-8 bg-error/5 border border-error/20 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Failed to load categories</h2>
                    <p className="text-text-muted mb-4">
                        {isDbError
                            ? "The server encountered an error or is unreachable. This usually happens if the MongoDB database is not connected or the backend service is down."
                            : `Error: ${error}`}
                    </p>
                    {isDbError && (
                        <div className="mb-6 text-sm text-text-muted p-md bg-black/20 rounded inline-block text-left">
                            <strong>Troubleshooting checklist:</strong>
                            <ul className="list-disc list-inside mt-2">
                                <li>Is MongoDB running on port 27017?</li>
                                <li>Is the FastAPI backend running on port 8000?</li>
                                <li>Check if any firewall is blocking the connection.</li>
                            </ul>
                        </div>
                    )}
                    <div>
                        <button
                            onClick={() => refetch()}
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
                        >
                            Retry Loading
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold text-text-main">Categories</h1>
                <Link href="/dashboard/categories/new" className="bg-primary text-white px-lg py-sm rounded-md font-medium flex items-center gap-xs hover:bg-primary-hover transition-colors">
                    <span className="text-xl">+</span> Add Category
                </Link>
            </div>

            <div className="glass-panel overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-md text-text-muted font-medium">#</th>
                                <th className="text-left p-md text-text-muted font-medium">Category</th>
                                <th className="text-left p-md text-text-muted font-medium">Category Type</th>
                                <th className="text-left p-md text-text-muted font-medium">Slug</th>
                                <th className="text-left p-md text-text-muted font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-text-muted">No categories found</td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat: Category, index: number) => (
                                    <tr key={cat._id} className="border-b border-white/5 last:border-0">
                                        <td className="p-md align-middle text-text-main">
                                            {(page - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="p-md align-middle">
                                            <div className="flex items-center gap-md">
                                                <span className="text-text-main font-medium">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-md align-middle text-text-main">
                                            {cat.parent === 0 ? 'Category' : 'Subcategory'}
                                        </td>
                                        <td className="p-md align-middle text-text-main font-mono text-sm">
                                            {cat.slug}
                                        </td>
                                        <td className="p-md align-middle">
                                            <div className="flex gap-sm">
                                                <Link href={`/dashboard/categories/${cat._id}`} className="text-text-muted p-1 rounded hover:text-text-main hover:bg-white/10 transition-colors" title="Edit">✏️</Link>
                                                <button className="text-text-muted p-1 rounded hover:text-text-main hover:bg-white/10 transition-colors" title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-end p-lg border-t border-border gap-md">
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className="bg-transparent border border-border text-text-main px-4 py-2 rounded-md hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-text-muted text-sm">
                        Page {page} of {totalPages || 1}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={page >= totalPages}
                        className="bg-transparent border border-border text-text-main px-4 py-2 rounded-md hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
