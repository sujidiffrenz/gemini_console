'use client';

import React from 'react';
import ProductEditor from '../../../../components/products/ProductEditor';

export default function NewProductPage() {
    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-[1.5rem] font-bold text-text-main">Add Product</h1>
            </div>
            <ProductEditor />
        </div>
    );
}
