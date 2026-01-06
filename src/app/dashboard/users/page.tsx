'use client';

import React, { useState } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { User } from '../../../types';

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { users, loading, error, refetch } = useUsers();

    React.useEffect(() => {
        console.log('UsersPage State Changed:', { usersCount: users.length, loading, hasError: !!error });
    }, [users, loading, error]);

    const filteredUsers = (users || []).filter(user =>
        (user?.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If it's loading for too long, we might want to know
    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col gap-lg text-center p-8">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-primary rounded-full mb-4" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="text-text-muted">Loading users...</p>
                <button
                    onClick={() => console.log('Current users state on manual check:', users)}
                    className="mt-4 text-xs text-text-muted hover:text-text-main underline"
                >
                    Check State in Console
                </button>
            </div>
        );
    }

    if (error) {
        const isDbError = error.toLowerCase().includes('500') || error.toLowerCase().includes('internal server error') || error.toLowerCase().includes('econnrefused') || error.toLowerCase().includes('econnreset') || error.toLowerCase().includes('socket hang up');
        return (
            <div className="flex flex-col gap-lg">
                <div className="text-error text-center p-8 bg-error/5 border border-error/20 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-text-muted mb-4">
                        {isDbError
                            ? "The server encountered an error. This usually happens if the database is not connected or the backend service is down."
                            : `Error: ${error}`}
                    </p>
                    {isDbError && (
                        <div className="mb-6 text-sm text-text-muted p-md bg-black/20 rounded inline-block text-left">
                            <strong>Possible Fixes:</strong>
                            <ul className="list-disc list-inside mt-2">
                                <li>Ensure MongoDB is running on port 27017.</li>
                                <li>Check if the backend service is healthy.</li>
                            </ul>
                        </div>
                    )}
                    <div>
                        <button
                            onClick={() => refetch()}
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
                        >
                            Retry Request
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold text-text-main">Users</h1>
                <button className="bg-primary text-white px-lg py-sm rounded-md font-medium flex items-center gap-xs hover:bg-primary-hover transition-colors">
                    <span className="text-xl">+</span> Add User
                </button>
            </div>

            <div className="glass-panel overflow-hidden border border-border">
                <div className="p-lg pb-0">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full p-sm rounded-md border border-border bg-white/5 text-text-main focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-md text-text-muted font-medium">Name</th>
                                <th className="text-left p-md text-text-muted font-medium">Email</th>
                                <th className="text-left p-md text-text-muted font-medium">Role</th>
                                <th className="text-left p-md text-text-muted font-medium">Status</th>
                                <th className="text-left p-md text-text-muted font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-text-muted">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 last:border-0">
                                        <td className="p-md align-middle">
                                            <div className="flex items-center gap-md">
                                                <span className="text-text-main font-medium">{user.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-md align-middle text-text-main">{user.email}</td>
                                        <td className="p-md align-middle text-text-main">{user.role}</td>
                                        <td className="p-md align-middle">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${user.isActive
                                                ? 'bg-success/10 text-success'
                                                : 'bg-error/10 text-error'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-md align-middle">
                                            <div className="flex gap-sm">
                                                <button className="text-text-muted p-1 rounded hover:text-text-main hover:bg-white/10 transition-colors" title="Edit">✏️</button>
                                                <button className="text-text-muted p-1 rounded hover:text-text-main hover:bg-white/10 transition-colors" title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
