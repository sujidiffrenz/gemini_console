'use client';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Blog } from '../../types';
import { blogService } from '../../services/blog.service';
import { configKeys } from '../../configKeys';

import 'quill-table-better/dist/quill-table-better.css';
import { useCategories } from '../../hooks/useCategories';

const ReactQuill = dynamic(async () => {
    const { default: RQ, Quill } = await import('react-quill-new');
    const { default: QuillTableBetter } = await import('quill-table-better');
    const { default: ImageResize } = await import('quill-image-resizer');

    if (typeof window !== 'undefined') {
        (window as any).Quill = Quill;
        (window as any).QuillTableBetter = QuillTableBetter;

        // Register modules if not already registered
        if (!Quill.imports['modules/table-better']) {
            Quill.register({
                'modules/table-better': QuillTableBetter,
                'modules/imageResize': ImageResize
            }, true);
        }
    }

    return RQ;
}, { ssr: false });

import 'react-quill-new/dist/quill.snow.css';

interface BlogEditorProps {
    initialData?: Blog;
    isEditing?: boolean;
    blogId?: number | string;
}

export default function BlogEditor({ initialData, isEditing = false, blogId }: BlogEditorProps) {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isQuillReady, setIsQuillReady] = useState(false);

    // Fetch categories using useQuery hook
    const { data: categoriesData } = useCategories(1, 100);
    const availableCategories = categoriesData?.items || [];

    useEffect(() => {
        setIsClient(true);

        // Polling check for Quill on window
        const checkQuill = setInterval(() => {
            if (typeof window !== 'undefined' && (window as any).Quill) {
                setIsQuillReady(true);
                clearInterval(checkQuill);
            }
        }, 100);

        return () => clearInterval(checkQuill);
    }, []);

    // Fetch data if blogId is provided
    const { data: fetchedBlog, isLoading, isError } = useQuery({
        queryKey: ['blog', blogId],
        queryFn: () => blogService.getById(blogId!),
        enabled: !!blogId,
    });

    // Use fetched data or initialData
    const blogData = fetchedBlog || initialData;

    // Core Fields
    const [title, setTitle] = useState('');

    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [isLatest, setIsLatest] = useState(true);
    const [contentCategory, setContentCategory] = useState('post');
    const [publishedAt, setPublishedAt] = useState('');

    // SEO Fields
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDesc, setMetaDesc] = useState('');
    const [keywords, setKeywords] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');

    // Image Fields
    const [featuredImageUrl, setFeaturedImageUrl] = useState('');
    const [featuredImageAlt, setFeaturedImageAlt] = useState('');

    // Content Images
    const [contentImages, setContentImages] = useState('');

    // Taxonomies
    const [categories, setCategories] = useState('');
    const [tags, setTags] = useState('');

    const [saving, setSaving] = useState(false);
    const [uploadingFeatured, setUploadingFeatured] = useState(false);
    const [uploadingContent, setUploadingContent] = useState(false);

    // Sync state when data is available
    useEffect(() => {
        if (blogData) {
            setTitle(blogData.title || '');

            setExcerpt(blogData.excerpt || '');
            setContent(Array.isArray(blogData.content) ? blogData.content[0] : (blogData.content || ''));
            setIsLatest(blogData.isLatest ?? true);
            setContentCategory(blogData.content_category || 'post');
            setPublishedAt(blogData.published_at ? blogData.published_at.split('T')[0] : '');

            setMetaTitle(blogData.seo?.meta_title || '');
            setMetaDesc(blogData.seo?.meta_description || '');
            setKeywords(blogData.seo?.keywords?.join(', ') || '');
            setCanonicalUrl(blogData.seo?.canonical_url || '');

            setFeaturedImageUrl(blogData.featured_image?.url || '');
            setFeaturedImageAlt(blogData.featured_image?.alt || '');

            setContentImages(blogData.content_image?.map(img => img.url).join('\n') || '');

            setCategories(blogData.categories?.join(', ') || '');
            setTags(blogData.tags?.join(', ') || '');
        }
    }, [blogData]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Helper to strip base URL
            const stripBaseUrl = (url: string) => {
                const baseUrl = configKeys.GEMINI_NEW_BASE_URL.replace(/\/$/, '');
                if (url.startsWith(baseUrl)) {
                    return url.replace(baseUrl, '');
                }
                return url;
            };

            // Construct Blog object matching exactly the user provided structure
            const submitData: Partial<Blog> = {
                title,
                excerpt,
                content: [content], // Wrapped in array as per user example
                isLatest,
                content_category: contentCategory,
                seo: {
                    meta_title: metaTitle,
                    meta_description: metaDesc,
                    keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
                    canonical_url: canonicalUrl
                },
                featured_image: {
                    url: stripBaseUrl(featuredImageUrl),
                    alt: featuredImageAlt,
                    caption: "" // Added as per user example
                },
                content_image: contentImages.split('\n').map(url => ({
                    url: stripBaseUrl(url.trim()),
                    alt: "",
                    caption: ""
                })).filter(img => img.url),
                categories: categories.split(',').map(c => c.trim()).filter(c => c),
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                status: 'active', // Changed from 'publish' to 'active' as per user example
                published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
            };

            // Include slug only if it existed or if we want to send it (it's optional now)
            if (blogData?.slug) {
                submitData.slug = blogData.slug;
            } else {
                submitData.slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            }

            // Determine ID to update: use blogId prop or initialData._id or initialData.id
            const idToUpdate = blogId || initialData?._id || initialData?.id;

            if (isEditing && idToUpdate) {
                await blogService.update(idToUpdate, submitData);
            } else {
                await blogService.create(submitData);
            }
            router.push('/dashboard/blogs');
        } catch (error: any) {
            console.error('Failed to save blog', error);
            // Alert more details if available
            const msg = error.response?.data?.detail
                ? JSON.stringify(error.response.data.detail)
                : (error.message || 'Failed to save blog');
            alert(`Failed to save blog: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFeatured(true);
        try {
            const url = await blogService.uploadFile(file);
            setFeaturedImageUrl(url);
        } catch (error: any) {
            console.error('Failed to upload featured image', error);
            const isDbError = error.response?.status === 500;
            const detail = error.response?.data?.detail ? `: ${JSON.stringify(error.response.data.detail)}` : '';
            alert(isDbError
                ? 'Failed to upload featured image. The server returned a 500 error. Please ensure MongoDB is running and check the backend logs for details.'
                : `Failed to upload featured image${detail}`);
        } finally {
            setUploadingFeatured(false);
        }
    };

    const handleContentImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingContent(true);
        try {
            const uploadPromises = Array.from(files).map(file => blogService.uploadFile(file));
            const urls = await Promise.all(uploadPromises);

            setContentImages(prev => {
                const currentUrls = prev ? prev.split('\n') : [];
                return [...currentUrls, ...urls].join('\n');
            });
        } catch (error: any) {
            console.error('Failed to upload content images', error);
            const isDbError = error.response?.status === 500;
            alert(isDbError
                ? 'Failed to upload content images. The server returned a 500 error. Please ensure MongoDB is running and check the backend logs for details.'
                : 'Failed to upload content images');
        } finally {
            setUploadingContent(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading blog details...</div>;
    }

    if (isError) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error loading blog.</div>;
    }

    const quillRef = React.useRef<any>(null);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                try {
                    const url = await blogService.uploadFile(file);
                    const editor = quillRef.current?.getEditor();
                    const range = editor.getSelection();
                    if (range) {
                        editor.insertEmbed(range.index, 'image', url);

                        // Also append to content images list to ensure it's tracked
                        setContentImages(prev => {
                            const currentUrls = prev ? prev.split('\n').filter(u => u.trim()) : [];
                            if (!currentUrls.includes(url)) {
                                return [...currentUrls, url].join('\n');
                            }
                            return prev;
                        });
                    }
                } catch (error: any) {
                    console.error('Editor image upload failed', error);
                    const isDbError = error.response?.status === 500;
                    alert(isDbError
                        ? 'Editor image upload failed (500). Please ensure MongoDB is running and check backend logs.'
                        : 'Editor image upload failed');
                }
            }
        };
    };

    const insertTable = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            const tableModule = editor.getModule('table-better');
            if (tableModule) {
                tableModule.insertTable(3, 3);
            }
        }
    };

    const modules = React.useMemo(() => {
        if (!isClient) return null;

        // Ensure Quill is available on window for modules that depend on it
        const Quill = (window as any).Quill;
        const QuillTableBetter = (window as any).QuillTableBetter;

        if (!Quill || !isQuillReady) {
            return {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    ['link', 'image']
                ]
            };
        }

        return {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['link', 'image', 'table'],
                    ['clean']
                ],
                handlers: {
                    table: insertTable,
                    image: imageHandler
                }
            },
            table: false, // CRITICAL: Disable standard table module
            'table-better': {
                language: 'en_US',
                menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'delete'],
                toolbar: true
            },
            imageResize: {
                parchment: Quill.import('parchment'),
                modules: ['Resize', 'DisplaySize', 'Toolbar']
            },
            keyboard: {
                bindings: QuillTableBetter?.keyboardBindings || {}
            }
        };
    }, [isClient, isQuillReady]);

    // Cast ReactQuill to any to avoid "Property 'ref' does not exist" TS error
    const QuillComponent = ReactQuill as any;


    return (
        <div className="glass-panel p-8 border border-border">
            <style jsx global>{`
                .ql-editor table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 20px;
                }
                .ql-editor td, .ql-editor th {
                    border: 1px solid #ccc;
                    padding: 8px;
                    min-width: 20px;
                }
            `}</style>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Main Info Section */}
                <h3 className="text-lg font-semibold border-b border-border pb-2 text-text-main">Basic Info</h3>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                        className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all font-inherit"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Published At</label>
                    <input
                        type="date"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
                <div className="flex gap-8 items-center">
                    <label className="flex items-center gap-2 text-text-main cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isLatest}
                            onChange={(e) => setIsLatest(e.target.checked)}
                            className="w-4 h-4 rounded border-border bg-white/5 text-primary focus:ring-primary"
                        />
                        <span>Is Latest</span>
                    </label>

                    <div className="flex items-center gap-2">
                        <label className="font-medium text-text-muted">Category Type:</label>
                        <select
                            value={contentCategory}
                            onChange={(e) => setContentCategory(e.target.value)}
                            className="p-3 rounded-md border border-border bg-white/5 text-text-main focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        >
                            <option value="blog" className="bg-surface">Blog</option>
                            <option value="news" className="bg-surface">News</option>
                        </select>
                    </div>
                </div>

                {/* SEO Section */}
                <h3 className="text-lg font-semibold border-b border-border pb-2 mt-4 text-text-main">SEO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Meta Title</label>
                        <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Canonical URL</label>
                        <input type="text" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Meta Description</label>
                    <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Keywords (comma separated)</label>
                    <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                </div>

                {/* Images Section */}
                <h3 className="text-lg font-semibold border-b border-border pb-2 mt-4 text-text-main">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Featured Image URL</label>
                        <div className="flex gap-2">
                            <input type="text" value={featuredImageUrl} onChange={(e) => setFeaturedImageUrl(e.target.value)} className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                            <label className="flex items-center justify-center p-3 border border-border rounded-md cursor-pointer bg-white/5 whitespace-nowrap hover:bg-white/10 transition-colors">
                                {uploadingFeatured ? '...' : 'Upload'}
                                <input type="file" accept="image/*" onChange={handleFeaturedImageUpload} className="hidden" disabled={uploadingFeatured} />
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Alt Text</label>
                        <input type="text" value={featuredImageAlt} onChange={(e) => setFeaturedImageAlt(e.target.value)} className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Content Image URLs (one per line)</label>
                    <textarea
                        value={contentImages}
                        onChange={(e) => setContentImages(e.target.value)}
                        rows={3}
                        className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
                    />
                    <div className="mt-2">
                        <label className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-md cursor-pointer bg-white/5 text-sm hover:bg-white/10 transition-colors">
                            {uploadingContent ? 'Uploading...' : 'Upload Images'}
                            <input type="file" accept="image/*" multiple onChange={handleContentImagesUpload} className="hidden" disabled={uploadingContent} />
                        </label>
                    </div>
                </div>

                {/* Taxonomies */}
                <h3 className="text-lg font-semibold border-b border-border pb-2 mt-4 text-text-main">Taxonomies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Category</label>
                        <select
                            value={categories}
                            onChange={(e) => setCategories(e.target.value)}
                            className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        >
                            <option value="" className="bg-surface">Select a category</option>
                            {availableCategories.map(cat => (
                                <option key={cat._id} value={cat.name} className="bg-surface">{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Tags (comma separated)</label>
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="p-3 rounded-md border border-border bg-white/5 text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                </div>


                {/* Rich Text Editor */}
                <div className="flex flex-col gap-2 mt-4">
                    <label className="font-medium text-text-muted">Content</label>
                    <div className="bg-white text-black rounded-md overflow-hidden min-h-[450px]">
                        {modules && (
                            <QuillComponent
                                forwardedRef={quillRef}
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                style={{ height: '400px', marginBottom: '50px' }}
                                modules={modules}
                            />
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-md border border-border bg-transparent text-text-main cursor-pointer hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-md border-none bg-primary text-white cursor-pointer font-semibold transition-all disabled:opacity-70 hover:bg-primary-hover"
                    >
                        {saving ? 'Saving...' : (isEditing ? 'Update Blog' : 'Create Blog')}
                    </button>
                </div>
            </form>
        </div>
    );
}
