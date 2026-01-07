'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CategoryEditor from '../../../../components/categories/CategoryEditor';

export default function EditCategoryPage() {
    const params = useParams();
    // Start with the raw param 'id' which corresponds to the folder [id]
    // Decode it just in case, though usually auto-decoded
    const rawId = params?.id;
    const categoryId = rawId ? (Array.isArray(rawId) ? rawId[0] : rawId) : null;

    if (!categoryId) {
        return <div className="text-center p-8">Invalid Category ID</div>;
    }

    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold text-text-main">Edit Category</h1>
            </div>
            <CategoryEditor categoryId={categoryId} isEditing={true} />
        </div>
    );
}
