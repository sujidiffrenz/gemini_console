'use client';

import React from 'react';
import CategoryEditor from '../../../../components/categories/CategoryEditor';

export default function NewCategoryPage() {
    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold text-text-main">Add Category</h1>
            </div>
            <CategoryEditor />
        </div>
    );
}
