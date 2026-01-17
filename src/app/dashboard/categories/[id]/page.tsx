'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { categoryService } from '../../../../services/category.service';
import { Category, ContentSection } from '../../../../types';

export default function CategoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const rawId = params?.id;
    const categoryId = rawId ? (Array.isArray(rawId) ? rawId[0] : rawId) : null;

    useEffect(() => {
        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    const fetchCategory = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getById(categoryId!);
            if (data) {
                setCategory(data);
            } else {
                setError('Category not found');
            }
        } catch (err: any) {
            console.error('Error fetching category:', err);
            setError(err.message || 'Failed to load category');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-8">Loading category details...</div>;
    if (error || !category) return <div className="text-center p-8 text-error">{error || 'Category not found'}</div>;

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold text-text-main">{category.name}</h1>
                </div>
                <Link href={`/dashboard/categories/${categoryId}/edit`}>
                    <button className="bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-primary-hover transition-all">
                        Edit Category
                    </button>
                </Link>
            </div>

            <div className="glass-panel p-6 border border-border rounded-xl flex flex-col gap-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Slug</span>
                        <span className="text-text-main font-mono">{category.slug}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Status</span>
                        <span className={`text-sm font-bold uppercase ${category.status === 'active' ? 'text-success' : 'text-error'}`}>
                            {category.status}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Description</span>
                    <p className="text-text-main leading-relaxed">
                        {category.description || <span className="italic opacity-50">No description provided.</span>}
                    </p>
                </div>

                {/* Thumbnail */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Thumbnail</span>
                    {category.thumbnail ? (
                        <div className="w-40 h-40 rounded-lg overflow-hidden border border-border">
                            <img src={category.thumbnail} alt={category.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <span className="italic opacity-50">No thumbnail.</span>
                    )}
                </div>

                {/* Category Page Content */}
                <div className="flex flex-col gap-6 pt-6 border-t border-border">
                    <h2 className="text-xl font-bold text-text-main">Page Content</h2>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Content Title</span>
                        <p className="text-lg font-semibold text-text-main">{category.category_content_title || <span className="italic opacity-50">No content title.</span>}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Content Description</span>
                        <p className="text-text-main leading-relaxed">{category.category_content_description || <span className="italic opacity-50">No content description.</span>}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Content Sections</span>
                        <div className="grid grid-cols-1 gap-4">
                            {category.sub_content_category && category.sub_content_category.length > 0 ? (
                                category.sub_content_category.map((section: ContentSection, idx: number) => (
                                    <div key={idx} className="p-4 rounded-lg bg-white/5 border border-border">
                                        <h3 className="text-text-main font-bold mb-2">{section.title}</h3>
                                        <p className="text-text-muted text-sm">{section.description}</p>
                                    </div>
                                ))
                            ) : (
                                <span className="italic opacity-50 py-4 text-center border-2 border-dashed border-border rounded-lg">No content sections.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
