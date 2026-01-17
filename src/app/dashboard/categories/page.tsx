'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '../../../hooks/useCategories';
import { categoryService } from '../../../services/category.service';
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

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoryService.delete(id);
            refetch();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category');
        }
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
        <div className="flex flex-col gap-6 sm:gap-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-text-main">Categories</h1>
                <Link href="/dashboard/categories/new" className="w-full sm:w-auto">
                    <button className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20">
                        <span className="text-xl leading-none">+</span> Add Category
                    </button>
                </Link>
            </div>

            <div className="glass-panel border border-border overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-white/5">
                                <th className="text-center w-10 px-2 py-3 text-text-muted font-medium text-sm uppercase tracking-wider">#</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium text-sm uppercase tracking-wider">Category</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium text-sm uppercase tracking-wider">Type</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium text-sm uppercase tracking-wider">Slug</th>
                                <th className="text-right px-4 py-3 text-text-muted font-medium text-sm uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-text-muted">No categories found</td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat: Category, index: number) => {
                                    const categoryId = cat.id || cat._id;
                                    return (
                                        <tr key={categoryId || index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                            <td className="w-10 px-2 py-3 text-center align-middle text-text-muted text-sm border-r border-white/5">
                                                {(page - 1) * pageSize + index + 1}
                                            </td>
                                            <td className="px-4 py-3 align-middle">
                                                <Link href={`/dashboard/categories/${categoryId}`} className="flex items-center gap-3 group/link">
                                                    <span className="text-text-main font-semibold group-hover/link:text-primary transition-colors">{cat.name}</span>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 align-middle">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cat.parent === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                                    {cat.parent === 0 ? 'Category' : 'Sub'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 align-middle text-text-muted font-mono text-xs">
                                                {cat.slug}
                                            </td>
                                            <td className="px-4 py-3 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/dashboard/categories/${categoryId}`}
                                                        className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-primary transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/categories/${categoryId}/edit`}
                                                        className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-secondary transition-all shadow-sm"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(categoryId!)}
                                                        className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-error transition-all shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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
        </div >
    );
}
