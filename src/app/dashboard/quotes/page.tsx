'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { quoteService } from '../../../services/quote.service';
import { useQuotes } from '../../../hooks/useQuotes';

export default function QuotesPage() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { quotes, loading, error, pagination, refetch } = useQuotes(page, pageSize);

    const handleDelete = async (id: number | string) => {
        if (!confirm('Are you sure you want to delete this quote?')) return;
        try {
            await quoteService.delete(id);
            refetch();
        } catch (error) {
            console.error('Failed to delete quote', error);
            alert('Failed to delete quote');
        }
    };

    if (error) {
        const errorLower = error.toLowerCase();
        const isNetworkError = errorLower.includes('network error') || errorLower.includes('unable to connect') || errorLower.includes('connect');
        const isDbError = errorLower.includes('500') || errorLower.includes('internal server error') || errorLower.includes('econnrefused') || errorLower.includes('econnreset') || errorLower.includes('socket hang up');

        return (
            <div className="flex flex-col gap-lg text-center p-8 bg-error/5 border border-error/20 rounded-lg max-w-2xl mx-auto my-xl">
                <h2 className="text-xl font-bold text-error mb-2">Failed to load quotes</h2>
                <p className="text-text-muted mb-4">
                    {isNetworkError
                        ? "Unable to connect to the server. Please ensure the backend API is running."
                        : isDbError
                            ? "The server connection was interrupted. This usually happens if the MongoDB database is not connected or the backend service is struggling."
                            : `Error: ${error}`}
                </p>
                {(isNetworkError || isDbError) && (
                    <div className="mb-6 text-sm text-text-muted p-md bg-black/20 rounded inline-block text-left">
                        <strong>Troubleshooting Checklist:</strong>
                        <ul className="list-disc list-inside mt-2">
                            <li>Is the backend service running on port 8000?</li>
                            {isDbError && <li>Is MongoDB running on port 27017?</li>}
                            <li>If the backend is running, try restarting it to clear socket hangs.</li>
                            <li>Check the browser console for more details.</li>
                        </ul>
                    </div>
                )}
                <div>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 sm:gap-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-text-main">Quotes</h1>
            </div>

            {loading ? (
                <div className="text-center p-12 text-text-muted bg-white/5 rounded-xl border border-border">
                    <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p>Loading quotes...</p>
                </div>
            ) : (
                <>
                    <div className="glass-panel border border-border overflow-hidden rounded-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[1000px]">
                                <thead>
                                    <tr>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap">#</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap">Name</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap">Company</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap">Phone</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap">Email</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border">Address</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap">Date</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border">Info</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap">Status</th>
                                        <th className="text-left p-md text-text-muted font-medium border-b border-border whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotes.map((quote, index) => (
                                        <tr key={quote._id}>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">{(page - 1) * pageSize + index + 1}</td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">{quote.name}</td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">{quote.company_name || '-'}</td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">{quote.phone_number}</td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">{quote.email_address}</td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top text-sm min-w-[200px] max-w-[300px] whitespace-normal break-words">{quote.company_address}</td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">{new Date(quote.created_at).toLocaleDateString()}</td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top text-sm min-w-[300px] max-w-[600px]">
                                                <div className="max-h-[150px] overflow-y-auto whitespace-pre-line break-words pr-2 custom-scrollbar">
                                                    {quote.additional_information || '-'}
                                                </div>
                                            </td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-[0.75rem] font-semibold inline-block ${quote.status === 'active' ? 'bg-success/10 text-success' : 'bg-slate-500/10 text-text-muted'
                                                    }`}>
                                                    {quote.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="p-md border-b border-white/5 text-text-main align-top whitespace-nowrap">
                                                <div className="flex gap-sm justify-end">
                                                    <button
                                                        onClick={() => handleDelete(quote._id)}
                                                        className="bg-transparent border border-border text-text-muted cursor-pointer p-2 rounded-md transition-colors duration-200 hover:text-text-main hover:bg-white/10 text-error hover:bg-error/10 hover:text-error"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {quotes.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="text-center p-8 text-text-muted">
                                                No quotes found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 rounded-md border border-border bg-primary text-white cursor-pointer transition-opacity duration-200 disabled:bg-transparent disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>
                                Page {page} of {pagination.pages}
                            </span>
                            <button
                                disabled={page >= pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 rounded-md border border-border bg-primary text-white cursor-pointer transition-opacity duration-200 disabled:bg-transparent disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
