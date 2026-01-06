'use client';

import React, { useState } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { Product } from '../../../types';

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { products, loading, error, refetch } = useProducts();

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-[1.5rem] font-bold text-text-main">Products</h1>
                <button className="bg-primary text-white border-none py-sm px-lg rounded-md cursor-pointer font-medium flex items-center gap-xs transition-colors duration-200 hover:bg-primary-hover">
                    <span>+</span> Add Product
                </button>
            </div>

            <div className="glass-panel overflow-x-auto w-full">
                <div className="p-lg pb-0 mb-lg flex gap-md">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="flex-1 p-sm rounded-md border border-border bg-white/5 text-text-main"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left p-md text-text-muted font-medium border-b border-border">Product</th>
                            <th className="text-left p-md text-text-muted font-medium border-b border-border">Category</th>
                            <th className="text-left p-md text-text-muted font-medium border-b border-border">Price</th>
                            <th className="text-left p-md text-text-muted font-medium border-b border-border">Stock</th>
                            <th className="text-left p-md text-text-muted font-medium border-b border-border">Status</th>
                            <th className="text-left p-md text-text-muted font-medium border-b border-border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr><td colSpan={6} className="text-center p-8 text-text-main">No products found</td></tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="p-md border-b border-white/5 text-text-main align-middle">
                                        <div className="flex items-center gap-md">
                                            <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center text-[1.5rem]">{product.icon}</div>
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-md border-b border-white/5 text-text-main align-middle">{product.category}</td>
                                    <td className="p-md border-b border-white/5 text-text-main align-middle">{product.price}</td>
                                    <td className="p-md border-b border-white/5 text-text-main align-middle">
                                        <span className={getStockStyle(product.stock_status)}>
                                            {getStockLabel(product.stock_status || '')}
                                        </span>
                                    </td>
                                    <td className="p-md border-b border-white/5 text-text-main align-middle">
                                        <span className={`px-2 py-1 rounded-full text-[0.75rem] font-semibold inline-block ${product.status === 'Published' ? 'bg-success/10 text-success' : 'bg-slate-500/10 text-text-muted'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-md border-b border-white/5 text-text-main align-middle">
                                        <div className="flex gap-sm">
                                            <button className="bg-transparent border-none text-text-muted cursor-pointer p-1 rounded-sm transition-all duration-200 hover:text-text-main hover:bg-white/10" title="Edit">✏️</button>
                                            <button className="bg-transparent border-none text-text-muted cursor-pointer p-1 rounded-sm transition-all duration-200 hover:text-text-main hover:bg-white/10" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
