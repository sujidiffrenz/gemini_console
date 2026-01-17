import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../../types';
import { productService } from '../../services/product.service';
import { useCategories } from '../../hooks/useCategories';

interface ProductEditorProps {
    initialData?: Product;
    isEditing?: boolean;
    productId?: number | string;
}

export default function ProductEditor({ initialData, isEditing = false, productId }: ProductEditorProps) {
    const router = useRouter();

    // Fetch product if editing and no initialData
    const { data: fetchedProduct } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productService.getById(String(productId)),
        enabled: !!productId && !initialData,
    });

    const product = initialData || fetchedProduct;

    // Core Fields
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('publish');

    // Pricing
    const [regularPrice, setRegularPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [taxStatus, setTaxStatus] = useState('taxable');
    const [taxClass, setTaxClass] = useState('');

    // Inventory
    const [sku, setSku] = useState(''); // Note: SKU wasn't in type but is standard. Using it if present or just generic meta? Meta has properties.
    const [stockStatus, setStockStatus] = useState('instock');
    const [manageStock, setManageStock] = useState('no');

    // Images
    const [imageUrl, setImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Download
    const [downloadUrl, setDownloadUrl] = useState('');

    // Meta & Attributes (simplified for now as direct fields or JSON)
    const [brand, setBrand] = useState('');
    const [thickness, setThickness] = useState('');
    const [material, setMaterial] = useState('');
    const [fireResistant, setFireResistant] = useState('No');

    // Categories
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [saving, setSaving] = useState(false);

    // Fetch categories
    const { data: categoriesData } = useCategories(1, 100);
    const categories = categoriesData?.items || [];

    useEffect(() => {
        if (product) {
            setTitle(product.post_title || product.name || '');
            setSlug(product.post_name || product.slug || '');
            setExcerpt(product.post_excerpt || '');
            setContent(product.post_content || '');
            setStatus(product.post_status || 'publish');

            setRegularPrice(product.regular_price || product.price || '');
            setSalePrice(product.sale_price || '');

            setStockStatus(product.stock_status || 'instock');
            setManageStock(product.manage_stock || 'no');

            // Handle images: could be string or array
            if (typeof product.images === 'string') {
                setImageUrl(product.images);
            } else if (Array.isArray(product.images) && product.images.length > 0) {
                const firstImage = product.images[0];
                if (typeof firstImage === 'string') {
                    setImageUrl(firstImage);
                } else if (typeof firstImage === 'object' && 'src' in firstImage) {
                    setImageUrl(firstImage.src);
                }
            }

            // Meta
            if (product.meta) {
                setBrand(product.meta.brand || '');
                setThickness(product.meta.thickness || '');
                setMaterial(product.meta.material || '');
                setFireResistant(product.meta.fire_resistant || 'No');
                setDownloadUrl(product.meta.download_url || '');
            }

            // Categories
            if (Array.isArray(product.category)) {
                // Ensure we have strings (slugs)
                setSelectedCategories(product.category.map((c: any) =>
                    typeof c === 'object' ? String(c.slug || c._id || c.id) : String(c)
                ));
            } else if (Array.isArray(product.categories)) {
                setSelectedCategories(product.categories.map((c: any) =>
                    typeof c === 'object' ? String(c.slug || c._id || c.id) : String(c)
                ));
            }
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: any = {
                post_title: title,
                post_name: (slug || title).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                post_content: content,
                post_excerpt: excerpt,
                post_status: status,
                stock_status: stockStatus,
                manage_stock: manageStock,
                images: imageUrl || "",
                category: selectedCategories,
                meta: {
                    brand,
                    thickness,
                    material,
                    fire_resistant: fireResistant,
                    download_url: downloadUrl,
                    regular_price: regularPrice || "",
                    sale_price: salePrice || ""
                },
                attributes: {},
                tax_status: taxStatus,

                menu_order: 0,
                comment_status: 'open',
                downloadable: 'no',
                virtual: 'no',
                backorders: 'no',
                sold_individually: 'no',
                post_author: 1,
                post_date: new Date().toISOString()
            };

            console.log('Submitting Product Payload:', payload);

            const id = productId || product?._id || product?.id;

            if (isEditing && id) {
                await productService.update(id, payload);
            } else {
                await productService.create(payload);
            }

            router.push('/dashboard/products');
        } catch (error) {
            console.error('Failed to save product', error);
            alert('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const url = await productService.uploadFile(file);
            setImageUrl(url);
        } catch (error) {
            console.error('Failed to upload image', error);
            alert('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const toggleCategory = (slug: string) => {
        setSelectedCategories(prev =>
            prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
        );
    };

    return (
        <div className="glass-panel p-4 sm:p-8 border border-border">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Main Options */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Basic Info */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">Basic Info</h3>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-muted font-medium">Product Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-muted font-medium">Description</label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    rows={5}
                                    className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-inherit transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-muted font-medium">Download URL</label>
                                <input
                                    type="text"
                                    value={downloadUrl}
                                    onChange={e => setDownloadUrl(e.target.value)}
                                    placeholder="https://example.com/file.pdf"
                                    className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-muted font-medium">Short Description (Excerpt)</label>
                                <textarea
                                    value={excerpt}
                                    onChange={e => setExcerpt(e.target.value)}
                                    rows={3}
                                    className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-inherit transition-all"
                                />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">Pricing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-muted font-medium">Regular Price</label>
                                    <input
                                        type="number"
                                        value={regularPrice}
                                        onChange={e => setRegularPrice(e.target.value)}
                                        className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-muted font-medium">Sale Price</label>
                                    <input
                                        type="number"
                                        value={salePrice}
                                        onChange={e => setSalePrice(e.target.value)}
                                        className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Specs / Meta */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">Specifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-muted font-medium">Brand</label>
                                    <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-muted font-medium">Material</label>
                                    <input type="text" value={material} onChange={e => setMaterial(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-muted font-medium">Thickness</label>
                                    <input type="text" value={thickness} onChange={e => setThickness(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-muted font-medium">Fire Resistant</label>
                                    <select value={fireResistant} onChange={e => setFireResistant(e.target.value)} className="p-3 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all">
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Options */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">
                        {/* Status */}
                        <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-text-main">Publish</h3>
                            <div className="flex items-center justify-between gap-2">
                                <label className="text-text-muted text-sm">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="p-2 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                >
                                    <option value="publish">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-text-main">Product Image</h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-text-muted text-sm">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        placeholder="https://"
                                        className="p-2 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 w-full transition-all"
                                    />
                                    <label className="flex items-center justify-center p-2 border border-border rounded-md cursor-pointer bg-white hover:bg-surface-hover transition-colors whitespace-nowrap text-text-muted">
                                        {uploadingImage ? '...' : 'Upload'}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-text-main">Inventory</h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-text-muted text-sm">Stock Status</label>
                                <select
                                    value={stockStatus}
                                    onChange={e => setStockStatus(e.target.value)}
                                    className="p-2 rounded-md border border-border bg-white text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                >
                                    <option value="instock">In Stock</option>
                                    <option value="outofstock">Out of Stock</option>
                                    <option value="onbackorder">On Backorder</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-text-main">Categories</h3>
                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                                {categories.map(cat => {
                                    const catId = String(cat.slug || '');
                                    return (
                                        <label key={catId} className="flex items-center gap-2 text-text-muted text-sm cursor-pointer hover:text-text-main">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(catId)}
                                                onChange={() => toggleCategory(catId)}
                                                className="rounded border-border bg-white text-primary focus:ring-primary"
                                            />
                                            {cat.name}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Bottom Action Bar */}
                <div className="flex justify-end pt-6 border-t border-border">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto bg-primary text-white py-3 px-8 rounded-md font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 text-lg shadow-lg"
                    >
                        {saving ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form>
        </div>
    );
}
