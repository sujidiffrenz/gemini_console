'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUsers } from '../../../hooks/useUsers';
import { User } from '../../../types';
import { userService } from '../../../services/user.service';

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const { users, pagination, loading, error, refetch } = useUsers(page, pageSize);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    const filteredUsers = (users || []).filter((user: User) =>
        (user?.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    React.useEffect(() => {
        console.log('UsersPage State Changed:', { usersCount: users.length, loading, hasError: !!error });
    }, [users, loading, error]);

    const handleDelete = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        setDeletingId(id);
        try {
            await userService.delete(id);
            refetch();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        } finally {
            setDeletingId(null);
        }
    };

    // If it's loading for too long, we might want to know
    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col gap-lg text-center p-8">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-primary rounded-full mb-4" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="text-text-muted">Loading users...</p>
            </div>
        );
    }

    if (error) {
        const errorLower = error.toLowerCase();
        const isNetworkError = errorLower.includes('network error') || errorLower.includes('unable to connect') || errorLower.includes('connect');
        const isDbError = errorLower.includes('500') || errorLower.includes('internal server error') || errorLower.includes('econnrefused') || errorLower.includes('econnreset') || errorLower.includes('socket hang up');
        
        return (
            <div className="flex flex-col gap-lg text-center p-8 bg-error/5 border border-error/20 rounded-lg max-w-2xl mx-auto my-xl">
                <h2 className="text-xl font-bold text-error mb-2">Failed to load users</h2>
                <p className="text-text-muted mb-4">
                    {isNetworkError
                        ? "Unable to connect to the server. Please ensure the backend API is running."
                        : isDbError
                        ? "The server encountered an error. This usually happens if the database is not connected or the backend service is down."
                        : `Error: ${error}`}
                </p>
                {(isNetworkError || isDbError) && (
                    <div className="mb-6 text-sm text-text-muted p-md bg-black/20 rounded inline-block text-left">
                        <strong>Troubleshooting Checklist:</strong>
                        <ul className="list-disc list-inside mt-2">
                            {isNetworkError && (
                                <>
                                    <li>Is the backend service running on port 8000?</li>
                                    <li>Is the API endpoint <code className="bg-black/30 px-1 rounded">/api/users/</code> available?</li>
                                </>
                            )}
                            {isDbError && (
                                <>
                                    <li>Is MongoDB running on port 27017?</li>
                                    <li>Is the backend service running on port 8000?</li>
                                </>
                            )}
                            <li>Check the browser console for more details</li>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-md">
                <h1 className="text-2xl font-bold text-text-main">Users</h1>
                <Link href="/dashboard/users/new" className="w-full sm:w-auto bg-primary text-white px-lg py-sm rounded-md font-medium flex items-center justify-center gap-xs hover:bg-primary-hover transition-colors">
                    <span className="text-xl">+</span> Add User
                </Link>
            </div>

            <div className="glass-panel overflow-hidden border border-border">
                {/* <div className="p-lg pb-0">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full p-sm rounded-md border border-border bg-white/5 text-text-main focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div> */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-md text-text-muted font-medium w-16">S.No</th>
                                <th className="text-left p-md text-text-muted font-medium">Name</th>
                                <th className="text-left p-md text-text-muted font-medium">Email</th>
                                <th className="text-left p-md text-text-muted font-medium">Role</th>
                                <th className="text-left p-md text-text-muted font-medium">Status</th>
                                <th className="text-left p-md text-text-muted font-medium text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-text-muted transition-all duration-300">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user: User, index: number) => {
                                    const serialNumber = (pagination.page - 1) * pagination.size + index + 1;
                                    const userId = user._id || user.id;
                                    return (
                                        <tr key={String(userId || index)} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                            <td className="p-md align-middle text-text-muted">{serialNumber}</td>
                                            <td className="p-md align-middle">
                                                <div className="flex items-center gap-md">
                                                    <span className="text-text-main font-medium">{user.user_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-md align-middle text-text-main">{user.email}</td>
                                            <td className="p-md align-middle text-text-main capitalize">{user.role}</td>
                                            <td className="p-md align-middle">
                                                <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold inline-block ${user.isActive
                                                    ? 'bg-success/10 text-success border border-success/20'
                                                    : 'bg-error/10 text-error border border-error/20'
                                                    }`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-md align-middle">
                                                <div className="flex gap-sm justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/dashboard/users/${userId}`}
                                                        className="text-text-muted p-2 rounded-md hover:text-text-main hover:bg-white/10 transition-all duration-200"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        onClick={() => userId && handleDelete(userId)}
                                                        disabled={deletingId === userId}
                                                        className="text-text-muted p-2 rounded-md hover:text-error hover:bg-error/10 transition-all duration-200 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deletingId === userId ? '...' : '🗑️'}
                                                    </button>
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
                <div className="flex flex-col sm:flex-row justify-between items-center p-md gap-4 border-t border-border bg-white/5">
                    <div className="text-sm text-text-muted order-2 sm:order-1">
                        Showing {pagination.total > 0 ? ((pagination.page - 1) * pagination.size) + 1 : 0} to {Math.min(pagination.page * pagination.size, pagination.total)} of {pagination.total} users
                    </div>
                    <div className="flex gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={pagination.page <= 1 || loading}
                            className="px-6 py-2 rounded-md border border-border text-text-muted hover:text-text-main hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1 px-2">
                            <span className="text-sm text-text-main font-semibold">{pagination.page}</span>
                            <span className="text-sm text-text-muted">/</span>
                            <span className="text-sm text-text-muted">{pagination.pages || 1}</span>
                        </div>
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                            disabled={pagination.page >= pagination.pages || loading || pagination.pages === 0}
                            className="px-6 py-2 rounded-md border border-border text-text-muted hover:text-text-main hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
