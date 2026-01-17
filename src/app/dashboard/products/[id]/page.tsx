'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../../services/product.service';
import Link from 'next/link';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id),
        enabled: !!id,
    });

    if (isLoading) {
        return <div className="p-8 text-center text-text-muted">Loading product details...</div>;
    }

    if (error || !product) {
        return (
            <div className="p-8 text-center flex flex-col gap-4">
                <div className="text-error">Failed to load product or product not found.</div>
                <button
                    onClick={() => router.back()}
                    className="mx-auto text-primary hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Helper to get image URL
    const getImageUrl = () => {
        if (!product.images) return undefined;
        if (typeof product.images === 'string') return product.images;
        if (Array.isArray(product.images) && product.images.length > 0) {
            const img = product.images[0];
            return typeof img === 'string' ? img : img.src;
        }
        return undefined;
    };

    const imageUrl = getImageUrl();
    const price = product.sale_price ? (
        <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">${product.sale_price}</span>
            <span className="text-sm text-text-muted line-through">${product.regular_price || product.price}</span>
        </div>
    ) : (
        <span className="text-xl font-bold text-text-main">${product.regular_price || product.price || '0.00'}</span>
    );

    return (
        <div className="flex flex-col gap-6 sm:gap-lg max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="text-text-muted hover:text-text-main transition-colors"
                    >
                        ← Back
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-text-main">Product Details</h1>
                </div>
                <div className="flex gap-3">
                    <Link href={`/dashboard/products/${id}/edit`}>
                        <button className="w-full sm:w-auto bg-primary text-white py-2 px-4 sm:px-6 rounded-md hover:bg-primary-hover transition-colors font-medium shadow-lg shadow-primary/20">
                            Edit Product
                        </button>
                    </Link>
                </div>
            </div>

            <div className="glass-panel border border-border p-4 sm:p-6 lg:p-8 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Image Section */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        <div className="aspect-square w-full rounded-lg overflow-hidden border border-white/10 bg-black/20 relative group">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={product.post_title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-white/10 bg-white/5">
                                    📷
                                </div>
                            )}
                        </div>

                        {/* Status Tags */}
                        <div className="flex flex-wrap gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock_status === 'outofstock' ? 'bg-error/20 text-error' :
                                product.stock_status === 'onbackorder' ? 'bg-warning/20 text-warning' :
                                    'bg-success/20 text-success'
                                }`}>
                                {product.stock_status === 'outofstock' ? 'Out of Stock' :
                                    product.stock_status === 'onbackorder' ? 'On Backorder' : 'In Stock'}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${product.post_status === 'publish' ? 'bg-primary/20 text-primary' : 'bg-text-muted/20 text-text-muted'
                                }`}>
                                {product.post_status || 'Draft'}
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-2 break-words">{product.post_title}</h2>
                            <div className="text-text-muted font-mono text-sm mb-4 break-all">Slug: {product.post_name || product.slug}</div>
                            {price}
                        </div>

                        {product.post_excerpt && (
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <h3 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Short Description</h3>
                                <div className="text-text-main/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.post_excerpt }} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Meta Info */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-white/10 pb-2">Specifications</h3>
                                <dl className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm">
                                    <dt className="text-text-muted">Brand:</dt>
                                    <dd className="text-text-main font-medium">{product.meta?.brand || '-'}</dd>

                                    <dt className="text-text-muted">Material:</dt>
                                    <dd className="text-text-main font-medium">{product.meta?.material || '-'}</dd>

                                    <dt className="text-text-muted">Thickness:</dt>
                                    <dd className="text-text-main font-medium">{product.meta?.thickness || '-'}</dd>

                                    <dt className="text-text-muted">Fire Safe:</dt>
                                    <dd className="text-text-main font-medium">{product.meta?.fire_resistant || 'No'}</dd>
                                </dl>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-white/10 pb-2">Download</h3>
                                {product.meta?.download_url ? (
                                    <a
                                        href={product.meta.download_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        Download Resource
                                    </a>
                                ) : (
                                    <span className="text-text-muted italic">No download available</span>
                                )}
                            </div>
                        </div>

                        {product.post_content && (
                            <div className="mt-2">
                                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-white/10 pb-2 mb-4">Description</h3>
                                <div
                                    className="prose prose-invert max-w-none text-text-main/80 break-words [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto"
                                    dangerouslySetInnerHTML={{ __html: product.post_content }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
