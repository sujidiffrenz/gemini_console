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

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-[450px] text-text-muted">Loading Quill...</div>
});

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
    const [hasLoadedInitialContent, setHasLoadedInitialContent] = useState(false);

    // Fetch categories using useQuery hook
    const { data: categoriesData } = useCategories(1, 100);
    const availableCategories = categoriesData?.items || [];

    useEffect(() => {
        setIsClient(true);

        const initQuill = async () => {
            try {
                // Dynamically import Quill and modules
                const { Quill } = await import('react-quill-new');
                const { default: QuillTableBetter } = await import('quill-table-better');
                const { default: ImageResize } = await import('quill-image-resizer');

                if (typeof window !== 'undefined') {
                    (window as any).Quill = Quill;
                    (window as any).QuillTableBetter = QuillTableBetter;

                    // Register modules if not already registered
                    if (!Quill.imports['modules/table-better']) {
                        console.log('📦 BlogEditor: Registering Quill modules...');
                        Quill.register({
                            'modules/table-better': QuillTableBetter,
                            'modules/imageResize': ImageResize
                        }, true);
                    }
                    setIsQuillReady(true);
                }
            } catch (error) {
                console.error('❌ BlogEditor: Failed to initialize Quill:', error);
            }
        };

        initQuill();
    }, []);

    // Fetch data if blogId is provided
    const { data: fetchedBlog, isLoading, isError } = useQuery({
        queryKey: ['blog', blogId],
        queryFn: async () => {
            console.log(`🔍 BlogEditor: Fetching blog with ID: ${blogId}`);
            return blogService.getById(blogId!);
        },
        enabled: !!blogId,
    });

    // Use fetched data or initialData
    const blogData = fetchedBlog || initialData;

    useEffect(() => {
        if (blogId) {
            console.log(`📝 BlogEditor State: isEditing=${isEditing}, blogId=${blogId}`);
        }
    }, [blogId, isEditing]);

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

    // URL Helpers
    const baseUrl = configKeys.GEMINI_NEW_BASE_URL.replace(/\/$/, '');

    const makeAbsolute = (url: string) => {
        if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
        const cleanRelative = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanRelative}`;
    };

    const stripBaseUrl = (url: string) => {
        if (!url) return '';

        try {
            // Normalize ANY absolute URL (http/https) to just its path,
            // so db only stores "static/uploads/..." etc.
            const parsed = new URL(url, baseUrl);
            let relative = parsed.pathname;

            // Remove leading slash if present (e.g., /static -> static)
            if (relative.startsWith('/')) {
                relative = relative.slice(1);
            }
            return relative;
        } catch {
            // Fallback for already-relative URLs
            let relative = url;
            if (url.startsWith(baseUrl)) {
                relative = url.replace(baseUrl, '');
            }
            return relative.startsWith('/') ? relative.slice(1) : relative;
        }
    };

    const makeHtmlAbsolute = (html: string) => {
        if (!html) return '';
        // Prepend baseUrl to static/ or /static/ links and images
        return html.replace(/(src|href)="(\/?static\/[^"]+)"/g, (match, attr, p1) => {
            const cleanRelative = p1.startsWith('/') ? p1 : `/${p1}`;
            return `${attr}="${baseUrl}${cleanRelative}"`;
        });
    };

    // Helper to extract image URLs from HTML content
    const extractImages = (html: string) => {
        const urls: string[] = [];
        const regex = /src="([^"]+)"/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            urls.push(stripBaseUrl(match[1])); // Extract as relative
        }
        return urls;
    };

    // Memoized list of images currently in the editor
    const currentEditorImages = React.useMemo(() => {
        const autoExtracted = extractImages(content);
        // Deduplicate
        return Array.from(new Set(autoExtracted)).map(url => ({
            url,
            alt: "",
            caption: ""
        }));
    }, [content]);

    // Sync state when data is available
    useEffect(() => {
        if (blogData && isQuillReady && !hasLoadedInitialContent) {
            console.log('📦 BlogEditor: Starting initial content sync...', blogData.id || blogData._id);
            setTitle(blogData.title || '');
            setExcerpt(blogData.excerpt || '');

            let rawContent = Array.isArray(blogData.content) ? blogData.content[0] : (blogData.content || '');

            // Small delay to ensure Quill modules (like tables) are fully stabilized in the DOM
            const timer = setTimeout(() => {
                const editor = quillRef.current?.getEditor();
                if (!editor) {
                    console.warn('⚠️ BlogEditor: Editor ref not ready yet...');
                    return;
                }

                // 1) If backend stored a Quill Delta as JSON, respect that
                if (
                    typeof rawContent === 'string' &&
                    (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('['))
                ) {
                    try {
                        const delta = JSON.parse(rawContent);
                        console.log('📝 BlogEditor: Detected Delta JSON format');
                        editor.setContents(delta);
                        setContent(editor.root.innerHTML);
                        setHasLoadedInitialContent(true);
                        return;
                    } catch (e) {
                        console.warn('⚠️ BlogEditor: Failed to parse Delta JSON, falling back to HTML string');
                    }
                }

                // 2) HTML string path (what your API currently returns)
                //    We inject directly into editor.root so Quill's clipboard
                //    parsing does not strip <table> markup from quill-table-better.
                const htmlString =
                    typeof rawContent === 'string' ? rawContent : editor.root.innerHTML;
                const absoluteContent = makeHtmlAbsolute(htmlString || '');
                console.log('📝 BlogEditor: Injecting raw HTML into editor.root for table visibility');
                editor.root.innerHTML = absoluteContent;
                setContent(absoluteContent);

                setHasLoadedInitialContent(true);
            }, 600); // 600ms for extra breathing room

            // Sync other fields immediately
            setIsLatest(blogData.isLatest ?? true);
            setContentCategory(blogData.content_category || 'post');
            setPublishedAt(blogData.published_at ? blogData.published_at.split('T')[0] : '');
            setMetaTitle(blogData.seo?.meta_title || '');
            setMetaDesc(blogData.seo?.meta_description || '');
            setKeywords(blogData.seo?.keywords?.join(', ') || '');
            setCanonicalUrl(blogData.seo?.canonical_url || '');
            setFeaturedImageUrl(stripBaseUrl(blogData.featured_image?.url || ''));
            setFeaturedImageAlt(blogData.featured_image?.alt || '');

            const initialContentImages = blogData.content_image?.map(img => stripBaseUrl(img.url)) || [];
            setContentImages(initialContentImages.join('\n'));
            setCategories(blogData.categories?.join(', ') || '');
            setTags(blogData.tags?.join(', ') || '');

            return () => clearTimeout(timer);
        }
    }, [blogData, isQuillReady, hasLoadedInitialContent]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const cleanHtmlForSaving = (html: string) => {
                let cleaned = html;

                // 1. Remove Quill Better Table temporary tags
                cleaned = cleaned.replace(/<temporary[^>]*>.*?<\/temporary>/g, '');

                // 2. Strip base URLs and ensure static/ format (no leading slash)
                const escapedBaseUrl = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Remove base URL if present
                cleaned = cleaned.replace(new RegExp(`${escapedBaseUrl}/?`, 'g'), '');

                // Ensure /static/ becomes static/
                cleaned = cleaned.replace(/(src|href)="\/static\//g, '$1="static/');

                return cleaned;
            };

            const finalContentImages = currentEditorImages.map(img => ({
                ...img,
                url: stripBaseUrl(img.url)
            }));

            const submitData: Partial<Blog> = {
                title,
                excerpt,
                content: [cleanHtmlForSaving(content)], // Wrapped in array as per user example
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
                content_image: finalContentImages,
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
            setFeaturedImageUrl(stripBaseUrl(url)); // Store relative URL
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
                const relativeUrls = urls.map(u => stripBaseUrl(u));
                return [...currentUrls, ...relativeUrls].join('\n');
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

    const quillRef = React.useRef<any>(null);

    const removeImageFromContent = (url: string) => {
        if (!window.confirm('Are you sure you want to remove this image from the content?')) return;

        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const images = editor.root.querySelectorAll('img');
        let removed = false;
        images.forEach((img: HTMLImageElement) => {
            if (img.src === url || img.getAttribute('src') === url) {
                const Quill = (window as any).Quill;

                // Check if image is wrapped in a link
                const parentA = img.closest('a');

                if (parentA) {
                    // Remove the entire link (which contains the img)
                    const blot = Quill.find(parentA);
                    if (blot) {
                        blot.remove();
                    } else {
                        parentA.remove();
                    }
                } else {
                    // Just remove the image
                    const blot = Quill.find(img);
                    if (blot) {
                        blot.remove();
                    } else {
                        img.remove();
                    }
                }
                removed = true;
            }
        });

        if (removed) {
            setContent(editor.root.innerHTML);
        }
    };

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
                    const absoluteUrl = makeAbsolute(url);
                    const editor = quillRef.current?.getEditor();
                    const range = editor.getSelection();
                    if (range) {
                        editor.insertEmbed(range.index, 'image', absoluteUrl);

                        // Also append to content images list as relative for tracking
                        setContentImages(prev => {
                            const currentUrls = prev ? prev.split('\n').filter(u => u.trim()) : [];
                            const relativeUrl = stripBaseUrl(url);
                            if (!currentUrls.includes(relativeUrl)) {
                                return [...currentUrls, relativeUrl].join('\n');
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
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
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

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading blog details...</div>;
    }

    if (isError) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error loading blog.</div>;
    }

    // Cast ReactQuill to any to avoid "Property 'ref' does not exist" TS error
    const QuillComponent = ReactQuill as any;


    return (
        <div className="glass-panel p-4 sm:p-8 border border-border">
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
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-inherit"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Published At</label>
                    <input
                        type="date"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                    <label className="flex items-center gap-2 text-text-main cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isLatest}
                            onChange={(e) => setIsLatest(e.target.checked)}
                            className="w-4 h-4 rounded border-border bg-white text-primary focus:ring-primary/20"
                        />
                        <span>Is Latest</span>
                    </label>

                    <div className="flex items-center gap-2">
                        <label className="font-medium text-text-muted">Category Type:</label>
                        <select
                            value={contentCategory}
                            onChange={(e) => setContentCategory(e.target.value)}
                            className="p-3 rounded-md border border-border bg-white text-text-main focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
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
                        <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Canonical URL</label>
                        <input type="text" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Meta Description</label>
                    <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Keywords (comma separated)</label>
                    <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>

                {/* Images Section */}
                <h3 className="text-lg font-semibold border-b border-border pb-2 mt-4 text-text-main">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Featured Image URL</label>
                        <div className="flex gap-2">
                            <input type="text" value={featuredImageUrl} onChange={(e) => setFeaturedImageUrl(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                            {featuredImageUrl && (
                                <button
                                    type="button"
                                    onClick={() => setFeaturedImageUrl('')}
                                    className="p-3 border border-error/50 rounded-md text-error hover:bg-error/10 transition-colors"
                                    title="Remove Image"
                                >
                                    ✕
                                </button>
                            )}
                            <label className="flex items-center justify-center p-3 border border-border rounded-md cursor-pointer bg-white whitespace-nowrap hover:bg-white/10 transition-colors text-text-muted">
                                {uploadingFeatured ? '...' : 'Upload'}
                                <input type="file" accept="image/*" onChange={handleFeaturedImageUpload} className="hidden" disabled={uploadingFeatured} />
                            </label>
                        </div>
                        {featuredImageUrl && (
                            <div className="mt-2 relative w-32 h-20 rounded border border-border overflow-hidden group">
                                <img src={makeAbsolute(featuredImageUrl)} alt="Featured Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFeaturedImageUrl('')}
                                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-text-muted">Alt Text</label>
                        <input type="text" value={featuredImageAlt} onChange={(e) => setFeaturedImageAlt(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="font-medium text-text-muted">Content Images</label>
                    </div>

                    {/* Image Gallery */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4 border border-border rounded-md bg-white/50">
                        {currentEditorImages.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-text-muted text-sm">
                                No images in content. Use the editor toolbar to add images.
                            </div>
                        ) : (
                            currentEditorImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded border border-border overflow-hidden group bg-white/20">
                                    <img src={makeAbsolute(img.url)} alt={`Content ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImageFromContent(makeAbsolute(img.url))}
                                        className="absolute inset-0 bg-error/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                                    >
                                        <span className="text-lg font-bold">✕</span>
                                        <span className="text-[10px] uppercase font-bold">Remove</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="font-medium text-text-muted text-sm mb-1 block">Quick Add / Raw URLs (one per line)</label>
                        <textarea
                            value={contentImages}
                            onChange={(e) => setContentImages(e.target.value)}
                            rows={2}
                            className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all text-xs"
                            placeholder="Paste extra image URLs here..."
                        />
                        {contentImages && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Clear all raw URLs?')) setContentImages('');
                                }}
                                className="text-xs text-error hover:underline mt-1"
                            >
                                Clear Raw List
                            </button>
                        )}
                    </div>
                </div>

                {/* Taxonomies */}
                {/* <h3 className="text-lg font-semibold border-b border-border pb-2 mt-4 text-text-main">Taxonomies</h3> */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div> */}


                {/* Rich Text Editor */}
                <div className="flex flex-col gap-2 mt-4">
                    <label className="font-medium text-text-muted">Content</label>
                    <div className="bg-white text-black rounded-md overflow-hidden min-h-[450px]">
                        {isClient && isQuillReady && modules ? (
                            <QuillComponent
                                forwardedRef={quillRef}
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                style={{ height: '400px', marginBottom: '50px' }}
                                modules={modules}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[450px] text-text-muted">
                                Initializing Editor...
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
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
                        {saving ? 'Saving...' : (isEditing ? 'Update Blog' : 'Create Blog')}
                    </button>
                </div>
            </form>
        </div>
    );
}
