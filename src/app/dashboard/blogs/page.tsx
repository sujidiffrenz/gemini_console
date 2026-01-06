'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBlogs } from '../../../hooks/useBlogs';

export default function BlogsPage() {
    const [page, setPage] = useState(1);
    const { blogs, loading, error, pagination, refetch } = useBlogs(page);

    if (loading && blogs.length === 0) {
        return <div className="flex flex-col gap-lg text-center p-8">Loading blogs...</div>;
    }

    if (error) {
        const isDbError = error.toLowerCase().includes('500') || error.toLowerCase().includes('internal server error') || error.toLowerCase().includes('econnrefused') || error.toLowerCase().includes('econnreset') || error.toLowerCase().includes('socket hang up');

        return (
            <div className="flex flex-col gap-lg text-center p-8 bg-error/5 border border-error/20 rounded-lg">
                <h2 className="text-xl font-bold text-error mb-2">Failed to load blogs</h2>
                <p className="text-text-muted mb-4">
                    {isDbError
                        ? "The server encountered an error. This usually happens if the MongoDB database is not connected or the backend service is down."
                        : `Error: ${error}`}
                </p>
                {isDbError && (
                    <div className="mb-6 text-sm text-text-muted p-md bg-black/20 rounded inline-block text-left">
                        <strong>Troubleshooting Checklist:</strong>
                        <ul className="list-disc list-inside mt-2">
                            <li>Is MongoDB running on port 27017?</li>
                            <li>Is the backend service running on port 8000?</li>
                        </ul>
                    </div>
                )}
                <div>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold text-text-main">Blogs</h1>
                <Link href="/dashboard/blogs/new" className="bg-primary text-white px-lg py-sm rounded-md font-medium flex items-center gap-xs hover:bg-primary-hover transition-colors">
                    <span className="text-xl">+</span> Add Blog
                </Link>
            </div>

            <div className="glass-panel overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-md text-text-muted font-medium w-12">#</th>
                                <th className="text-left p-md text-text-muted font-medium">Title</th>
                                <th className="text-left p-md text-text-muted font-medium">Slug</th>
                                <th className="text-left p-md text-text-muted font-medium">Excerpt</th>
                                <th className="text-left p-md text-text-muted font-medium">Status</th>
                                <th className="text-left p-md text-text-muted font-medium">Published Date</th>
                                <th className="text-left p-md text-text-muted font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-8 text-text-muted">No blogs found</td>
                                </tr>
                            ) : (
                                blogs.map((blog, index) => {
                                    const blogId = blog._id || blog.id;
                                    const rowNumber = ((pagination.page - 1) * pagination.size) + index + 1;
                                    return (
                                        <tr key={blogId ? blogId : `blog-${index}`} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                            <td className="p-md align-middle text-text-muted text-sm">
                                                {rowNumber}
                                            </td>
                                            <td className="p-md align-middle">
                                                <div className="font-medium text-text-main">{blog.title}</div>
                                            </td>
                                            <td className="p-md align-middle text-text-muted text-sm">
                                                {blog.slug}
                                            </td>
                                            <td className="p-md align-middle text-text-muted text-sm max-w-[200px] truncate" title={blog.excerpt}>
                                                {blog.excerpt}
                                            </td>
                                            <td className="p-md align-middle">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${blog.status === 'publish' || blog.status === 'active'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-warning/10 text-warning'
                                                    }`}>
                                                    {blog.status}
                                                </span>
                                            </td>
                                            <td className="p-md align-middle text-text-muted text-sm">
                                                {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : (blog.created_at ? new Date(blog.created_at).toLocaleDateString() : '-')}
                                            </td>
                                            <td className="p-md align-middle">
                                                <div className="flex gap-sm">
                                                    <Link href={`/dashboard/blogs/${blogId}`} className="text-text-muted p-1 rounded hover:text-text-main hover:bg-white/10 transition-colors" title="Edit">
                                                        ✏️
                                                    </Link>
                                                    <button className="text-text-muted p-1 rounded hover:text-text-main hover:bg-white/10 transition-colors" title="Delete">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-md border-t border-border flex flex-col sm:flex-row justify-between items-center gap-md bg-white/5">
                    <div className="text-sm text-text-muted">
                        Showing <span className="text-text-main font-medium">{blogs.length}</span> of <span className="text-text-main font-medium">{pagination.total}</span> blogs
                    </div>
                    <div className="flex items-center gap-sm">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-md border border-border bg-white/5 text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                // Simple logic to show pages around current
                                let pageNum = 1;
                                if (pagination.pages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= pagination.pages - 2) {
                                    pageNum = pagination.pages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${page === pageNum
                                                ? 'bg-primary text-white font-bold'
                                                : 'bg-white/5 text-text-muted hover:text-text-main hover:bg-white/10'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                            disabled={page === pagination.pages || pagination.pages === 0}
                            className="px-4 py-2 rounded-md border border-border bg-white/5 text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
