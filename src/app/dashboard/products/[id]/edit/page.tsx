'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProductEditor from '../../../../../components/products/ProductEditor';

export default function EditProductPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-[1.5rem] font-bold text-text-main">Edit Product</h1>
            </div>
            <ProductEditor isEditing={true} productId={id} />
        </div>
    );
}
