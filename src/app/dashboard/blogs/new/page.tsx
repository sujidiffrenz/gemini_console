'use client';

import React from 'react';
import BlogEditor from '../../../../components/blogs/BlogEditor';

export default function NewBlogPage() {
    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold text-text-main">Create New Blog</h1>
            </div>
            <BlogEditor />
        </div>
    );
}
