'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '../../types';
import { categoryService } from '../../services/category.service';
import { configKeys } from '../../configKeys';

interface CategoryEditorProps {
    initialData?: Category;
    isEditing?: boolean;
    categoryId?: number | string;
}

export default function CategoryEditor({ initialData, isEditing = false, categoryId }: CategoryEditorProps) {
    const router = useRouter();
    const [name, setName] = useState('');

    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [parentId, setParentId] = useState<number | string>(0);
    const [status, setStatus] = useState('active');
    const [categoryContentTitle, setCategoryContentTitle] = useState('');
    const [categoryContentDescription, setCategoryContentDescription] = useState('');
    const [subContentCategory, setSubContentCategory] = useState<{ title: string; description: string }[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [categoryId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load parent categories for selection
            const parents = await categoryService.getParents();
            setCategories(parents || []);

            if (isEditing && categoryId) {
                // If we don't have initialData, fetch it
                if (!initialData) {
                    const cat = await categoryService.getById(categoryId);
                    if (cat) {
                        setName(cat.name);
                        setDescription(cat.description || '');
                        setThumbnail(cat.thumbnail || '');
                        setParentId(cat.parent || 0);
                        setStatus(cat.status || 'active');
                        setCategoryContentTitle(cat.category_content_title || '');
                        setCategoryContentDescription(cat.category_content_description || '');
                        setSubContentCategory(cat.sub_content_category || []);
                    }
                }
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            const detail = error?.response?.data?.detail || error?.message || 'Unknown error';
            alert(`Error loading data: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
        } finally {
            setLoading(false);
        }
    };

    // If initialData is provided directly (e.g. from server component)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setThumbnail(initialData.thumbnail || '');
            setParentId(initialData.parent || 0);
            setStatus(initialData.status || 'active');
            setCategoryContentTitle(initialData.category_content_title || '');
            setCategoryContentDescription(initialData.category_content_description || '');
            setSubContentCategory(initialData.sub_content_category || []);
        }
    }, [initialData]);


    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Use our new uploadFile method
            const url = await categoryService.uploadFile(file);
            setThumbnail(url);
        } catch (error: any) {
            console.error('Failed to upload thumbnail', error);
            alert(`Failed to upload thumbnail: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const addContentSection = () => {
        setSubContentCategory([...subContentCategory, { title: '', description: '' }]);
    };

    const removeContentSection = (index: number) => {
        setSubContentCategory(subContentCategory.filter((_, i) => i !== index));
    };

    const updateContentSection = (index: number, field: 'title' | 'description', value: string) => {
        const updated = [...subContentCategory];
        updated[index] = { ...updated[index], [field]: value };
        setSubContentCategory(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Helper to strip base URL for saving
        const stripBaseUrl = (url: string) => {
            const baseUrl = configKeys.GEMINI_NEW_BASE_URL.replace(/\/$/, '');
            if (url.startsWith(baseUrl)) {
                return url.replace(baseUrl, '');
            }
            return url;
        };

        const submitData: Partial<Category> = {
            name,
            description,
            thumbnail: stripBaseUrl(thumbnail),
            parent: Number(parentId) || 0,
            status,
            tax_status: 'taxable',
            tax_class: '',
            category_content_title: categoryContentTitle,
            category_content_description: categoryContentDescription,
            sub_content_category: subContentCategory,
            // Slug is usually auto-generated by backend, but we can generate it here if needed
            // slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        };

        try {
            if (isEditing && categoryId) {
                await categoryService.update(categoryId, submitData);
            } else {
                await categoryService.create(submitData);
            }
            router.push('/dashboard/categories');
            router.refresh();
        } catch (error) {
            console.error('Failed to save category', error);
            alert('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    if (loading && isEditing) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="glass-panel p-4 sm:p-8 w-full max-w-[800px] mx-auto border border-border">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-inherit"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Parent Category</label>
                    <select
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    >
                        <option value={0} className="bg-surface">None (Top Level)</option>
                        {categories
                            .filter(c => {
                                // In "Add" mode (no categoryId), show all parents.
                                if (!categoryId) return true;
                                // In "Edit" mode, prevent selecting self as parent.
                                const cId = String(c._id || c.id || c.term_id);
                                const currentId = String(categoryId);
                                return cId !== currentId;
                            })
                            .map((cat) => {
                                const value = cat._id ?? cat.id ?? cat.term_id;
                                return (
                                    <option key={String(value)} value={String(value)} className="bg-surface">
                                        {cat.name}
                                    </option>
                                );
                            })}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    >
                        <option value="active" className="bg-surface">Active</option>
                        <option value="deleted" className="bg-surface">Deleted</option>
                    </select>
                </div>


                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Thumbnail</label>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={thumbnail}
                                onChange={(e) => setThumbnail(e.target.value)}
                                className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder="Image URL"
                            />
                        </div>
                        <label className="flex items-center justify-center p-3 border border-border rounded-md cursor-pointer bg-white whitespace-nowrap hover:bg-white/10 transition-colors text-text-muted">
                            {uploading ? 'Uploading...' : 'Upload'}
                            <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={uploading} />
                        </label>
                    </div>
                    {thumbnail && (
                        <div className="mt-2 w-[100px] h-[100px] rounded-md overflow-hidden border border-border">
                            <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Category Page Content Section */}
                <div className="flex flex-col gap-6 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-text-main">Category Page Content</h3>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Content Title</label>
                        <input
                            type="text"
                            value={categoryContentTitle}
                            onChange={(e) => setCategoryContentTitle(e.target.value)}
                            className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                            placeholder="e.g. Complete Insulation Solutions..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Content Description</label>
                        <textarea
                            value={categoryContentDescription}
                            onChange={(e) => setCategoryContentDescription(e.target.value)}
                            rows={4}
                            className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-inherit"
                            placeholder="Main category description for the page..."
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <label className="font-medium text-text-muted">Content Sections (Subtitles & Descriptions)</label>
                            <button
                                type="button"
                                onClick={addContentSection}
                                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-hover transition-colors flex items-center gap-1"
                            >
                                <span className="text-lg">+</span> Add Section
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {subContentCategory.map((section, index) => (
                                <div key={index} className="p-4 border border-border rounded-lg bg-surface/50 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeContentSection(index)}
                                        className="absolute top-2 right-2 p-1 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                                        title="Remove Section"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-text-muted uppercase">Subtitle {index + 1}</label>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => updateContentSection(index, 'title', e.target.value)}
                                                className="p-2 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                                placeholder="e.g. Gyproc ISOVER ECO PAD"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-text-muted uppercase">Section Description</label>
                                            <textarea
                                                value={section.description}
                                                onChange={(e) => updateContentSection(index, 'description', e.target.value)}
                                                rows={3}
                                                className="p-2 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-inherit"
                                                placeholder="Detailed description for this section..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {subContentCategory.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-border rounded-lg text-text-muted italic text-sm">
                                    No sections added yet. Click "Add Section" to create content structures.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-6 py-3 rounded-md border border-border bg-transparent text-text-main cursor-pointer hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-8 py-3 rounded-md border-none bg-primary text-white cursor-pointer font-semibold transition-all disabled:opacity-70 hover:bg-primary-hover shadow-lg shadow-primary/20"
                    >
                        {saving ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
                    </button>
                </div>
            </form>
        </div>
    );
}
