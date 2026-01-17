'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '../../../hooks/useProducts';
import { Product } from '../../../types';
import { productService } from '../../../services/product.service';

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data, loading, error, refetch } = useProducts(page, pageSize);

    const products = data?.items || [];
    const totalPages = data?.pages || 0;

    const filteredProducts = products.filter(product =>
        (product.post_title || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(product.category) ? product.category.join(' ') : (product.category || '')).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(p => p + 1);
    };

    const handleDelete = async (id: string | number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.delete(id);
                refetch();
            } catch (error) {
                console.error('Failed to delete product', error);
                alert('Failed to delete product');
            }
        }
    };

    const getStockStyle = (status: string | undefined) => {
        if (status === 'outofstock') return 'text-error font-semibold';
        if (status === 'onbackorder') return 'text-warning font-semibold';
        return '';
    };

    const getStockLabel = (status: string | undefined) => {
        if (status === 'outofstock') return 'Out of Stock';
        if (status === 'onbackorder') return 'On Backorder';
        return 'In Stock';
    };

    if (loading && products.length === 0) return <div className="flex flex-col gap-lg text-center p-8 text-text-muted">Loading products...</div>;
    if (error) {
        const isDbError = error.toLowerCase().includes('500') || error.toLowerCase().includes('internal server error') || error.toLowerCase().includes('econnrefused') || error.toLowerCase().includes('econnreset') || error.toLowerCase().includes('socket hang up');

        return (
            <div className="flex flex-col gap-lg text-center p-8 bg-error/5 border border-error/20 rounded-lg max-w-2xl mx-auto my-xl">
                <h2 className="text-xl font-bold text-error mb-2">Failed to load products</h2>
                <p className="text-text-muted mb-4">
                    {isDbError
                        ? "The server connection was interrupted or is unreachable. This usually happens if the MongoDB database is not connected or the backend service is struggling."
                        : `Error: ${error}`}
                </p>
                {isDbError && (
                    <div className="mb-6 text-sm text-text-muted p-md bg-black/20 rounded inline-block text-left">
                        <strong>Troubleshooting Checklist:</strong>
                        <ul className="list-disc list-inside mt-2">
                            <li>Is MongoDB running on port 27017?</li>
                            <li>Is the backend service running on port 8000?</li>
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
        );
    }

    return (
        <div className="flex flex-col gap-6 sm:gap-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-text-main">Products</h1>
                <Link href="/dashboard/products/new" className="w-full sm:w-auto">
                    <button className="w-full bg-primary text-white border-none py-3 px-6 rounded-lg cursor-pointer font-semibold flex items-center justify-center gap-2 transition-all hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20">
                        <span className="text-xl leading-none">+</span> Add Product
                    </button>
                </Link>
            </div>

            <div className="glass-panel border border-border overflow-hidden rounded-xl">
                {/* <div className="p-4 sm:p-lg border-b border-white/5 bg-white/5">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full p-3 pl-10 rounded-lg border border-border bg-black/20 text-text-main focus:border-primary focus:outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
                    </div>
                </div> */}

                {/* Mobile / small screens: cards */}
                <div className="block md:hidden">
                    <div className="divide-y divide-white/5">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center p-8 text-text-main">No products found</div>
                        ) : (
                            filteredProducts.map((product, index) => {
                                const id = product._id || product.id;
                                const title = product.post_title || product.name || 'Untitled';
                                const slug = product.post_name || product.slug || '-';
                                const category = Array.isArray(product.category) ? product.category.join(', ') : (product.category || '-');
                                const rowNumber = (page - 1) * pageSize + index + 1;

                                return (
                                    <div key={String(id || product.slug || index)} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 w-8 text-text-muted font-mono text-sm pt-1">
                                                #{rowNumber}
                                            </div>
                                            <div className="shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[1.25rem]">
                                                {product.icon || '📦'}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="text-text-main font-semibold truncate">{title}</div>
                                                        <div className="text-xs text-text-muted mt-1 break-all">Slug: {slug}</div>
                                                    </div>

                                                    <div className="flex gap-2 shrink-0">
                                                        {id && (
                                                            <>
                                                                <Link href={`/dashboard/products/${id}`}>
                                                                    <button className="bg-transparent border-none text-text-muted cursor-pointer p-2 rounded-md transition-all duration-200 hover:text-text-main hover:bg-white/10" title="View">
                                                                        👁️
                                                                    </button>
                                                                </Link>
                                                                <Link href={`/dashboard/products/${id}/edit`}>
                                                                    <button className="bg-transparent border-none text-text-muted cursor-pointer p-2 rounded-md transition-all duration-200 hover:text-text-main hover:bg-white/10" title="Edit">
                                                                        ✏️
                                                                    </button>
                                                                </Link>
                                                                <button
                                                                    className="bg-transparent border-none text-text-muted cursor-pointer p-2 rounded-md transition-all duration-200 hover:text-text-main hover:bg-white/10"
                                                                    title="Delete"
                                                                    onClick={() => handleDelete(id)}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className={`text-xs font-semibold ${getStockStyle(product.stock_status)}`}>
                                                        {getStockLabel(product.stock_status || '')}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-[0.75rem] font-semibold inline-block ${product.status === 'Published'
                                                        ? 'bg-success/10 text-success'
                                                        : 'bg-slate-500/10 text-text-muted'
                                                        }`}>
                                                        {product.post_status}
                                                    </span>
                                                </div>

                                                <div className="mt-3 text-sm text-text-main/80 line-clamp-2">
                                                    {product.post_excerpt || ''}
                                                </div>

                                                <div className="mt-2 text-xs text-text-muted">
                                                    Category: {category}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 border-t border-border gap-3">
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

                {/* Desktop / medium+ screens: table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-center px-2 py-3 text-sm text-text-muted font-medium border-b border-border w-10">#</th>
                                <th className="text-left pl-2 pr-4 py-3 text-sm text-text-muted font-medium border-b border-border w-[300px]">Product</th>
                                <th className="text-left px-4 py-3 text-sm text-text-muted font-medium border-b border-border min-w-[200px]">Description</th>
                                <th className="text-left px-4 py-3 text-sm text-text-muted font-medium border-b border-border whitespace-nowrap">Stock</th>
                                <th className="text-left px-4 py-3 text-sm text-text-muted font-medium border-b border-border whitespace-nowrap">Status</th>
                                <th className="text-left px-4 py-3 text-sm text-text-muted font-medium border-b border-border">Slug</th>
                                <th className="text-left px-4 py-3 text-sm text-text-muted font-medium border-b border-border">Category</th>
                                <th className="text-left px-4 py-3 text-sm text-text-muted font-medium border-b border-border text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr><td colSpan={8} className="text-center p-8 text-text-main">No products found</td></tr>
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <tr key={String(product._id || product.id || product.slug || index)} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-2 py-3 border-b border-white/5 text-text-muted align-top font-mono text-sm text-center">
                                            {(page - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="pl-2 pr-4 py-3 border-b border-white/5 text-text-main align-top">
                                            <div className="flex items-start gap-3">

                                                <div className="min-w-0">
                                                    <div className="font-medium truncate max-w-[200px]" title={product.post_title}>{product.post_title}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 border-b border-white/5 text-text-main align-top">
                                            <div className="line-clamp-2 text-sm text-text-main/80 max-w-[300px]" title={product.post_excerpt}>
                                                {product.post_excerpt}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-b border-white/5 text-text-main align-top whitespace-nowrap">
                                            <span className={getStockStyle(product.stock_status)}>
                                                {getStockLabel(product.stock_status || '')}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 border-b border-white/5 text-text-main align-top whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block ${product.status === 'Published' ? 'bg-success/10 text-success' : 'bg-slate-500/10 text-text-muted'
                                                }`}>
                                                {product.post_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border-b border-white/5 text-text-main align-top text-sm font-mono text-text-muted max-w-[150px] truncate">
                                            {product.slug}
                                        </td>
                                        <td className="px-4 py-3 border-b border-white/5 text-text-main align-top text-sm">
                                            {product.category}
                                        </td>
                                        <td className="px-4 py-3 border-b border-white/5 text-text-main align-top text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/dashboard/products/${product._id || product.id}`}>
                                                    <button className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded hover:text-primary hover:bg-primary/10 transition-colors" title="View">
                                                        👁️
                                                    </button>
                                                </Link>
                                                <Link href={`/dashboard/products/${product._id || product.id}/edit`}>
                                                    <button className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                                                        ✏️
                                                    </button>
                                                </Link>
                                                <button
                                                    className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded hover:text-error hover:bg-error/10 transition-colors"
                                                    title="Delete"
                                                    onClick={() => product.id && handleDelete(product.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
        </div>
    );
}
