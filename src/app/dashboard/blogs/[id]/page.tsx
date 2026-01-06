'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BlogEditor from '../../../../components/blogs/BlogEditor';

export default function EditBlogPage() {
    const params = useParams();
    const blogId = params?.id ? Number(params.id) : null;

    if (!blogId) {
        return <div className="text-center p-8">Invalid Blog ID</div>;
    }

    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold text-text-main">Edit Blog</h1>
            </div>
            <BlogEditor blogId={blogId} isEditing={true} />
        </div>
    );
}
