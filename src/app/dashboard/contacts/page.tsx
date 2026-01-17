'use client';

import React, { useState, useEffect } from 'react';
import { contactService } from '../../../services/contact.service';
import { Contact } from '../../../types';

export default function ContactsPage() {
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allContacts, startDate, endDate]);

    const fetchContacts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await contactService.getAll();
            setAllContacts(data);
        } catch (err: any) {
            console.error('Failed to load contacts:', err);
            const errorMessage = err.message || 'Failed to load contacts';

            // Provide more specific error messages
            if (errorMessage.includes('Network Error') || errorMessage.includes('connect')) {
                setError('Unable to connect to the server. Please ensure the backend API is running.');
            } else if (err.response?.status === 404) {
                setError('Contacts endpoint not found. Please check the API configuration.');
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Authentication failed. Please log in again.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!allContacts) return;

        const filtered = allContacts.filter(contact => {
            const contactDate = new Date(contact.created_at).toISOString().split('T')[0];
            return contactDate >= startDate && contactDate <= endDate;
        });

        // Sort by date descending (newest first)
        const sorted = [...filtered].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setFilteredContacts(sorted);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;
        try {
            await contactService.delete(id);
            setAllContacts(allContacts.filter(c => c._id !== id));
        } catch (err) {
            console.error('Failed to delete contact:', err);
            alert('Failed to delete contact');
        }
    };

    if (loading && allContacts.length === 0) {
        return <div className="flex flex-col gap-lg text-center p-8 text-text-muted">Loading contacts...</div>;
    }

    if (error && allContacts.length === 0) {
        const isNetworkError = error.toLowerCase().includes('network') || error.toLowerCase().includes('connect');
        return (
            <div className="flex flex-col gap-lg text-center p-8 bg-error/5 border border-error/20 rounded-lg max-w-2xl mx-auto my-xl">
                <h2 className="text-xl font-bold text-error mb-2">Failed to load contacts</h2>
                <p className="text-text-muted mb-4">{error}</p>
                {isNetworkError && (
                    <div className="mb-6 text-sm text-text-muted p-md bg-black/20 rounded inline-block text-left">
                        <strong>Troubleshooting Checklist:</strong>
                        <ul className="list-disc list-inside mt-2">
                            <li>Is the backend service running on port 8000?</li>
                            <li>Is the API endpoint <code className="bg-black/30 px-1 rounded">/api/contacts/</code> available?</li>
                            <li>Check the browser console for more details</li>
                        </ul>
                    </div>
                )}
                <div>
                    <button
                        onClick={fetchContacts}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-text-main">Contacts</h1>

                {/* Date Filters */}
                <div className="flex flex-wrap items-center gap-3 p-3 glass-panel border border-border rounded-lg">
                    {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        return (
                            <>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">From</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        max={today}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-white/5 border border-border rounded px-2 py-1 text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">To</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        max={today}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-white/5 border border-border rounded px-2 py-1 text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    />
                                </div>
                            </>
                        );
                    })()}
                    <button
                        onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setStartDate(today);
                            setEndDate(today);
                        }}
                        className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors px-2"
                    >
                        Today
                    </button>
                </div>
            </div>

            <div className="glass-panel border border-border overflow-hidden rounded-xl">
                <div className="overflow-x-auto pb-4">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-border bg-white/5 text-xs text-text-muted font-medium uppercase tracking-wider">
                                <th className="text-center w-12 px-4 py-3">#</th>
                                <th className="text-left w-28 px-4 py-3">Date</th>
                                <th className="text-left w-40 px-4 py-3">Name</th>
                                <th className="text-left w-56 px-4 py-3">Email/Phone</th>
                                <th className="text-left w-64 px-4 py-3">Company</th>
                                <th className="text-left px-4 py-3">Message</th>
                                {/* <th className="text-right px-4 py-3 w-20">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-text-muted italic">
                                        No contacts found for the selected range.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact, index) => (
                                    <tr key={contact._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-4 py-3 text-center align-middle text-sm text-text-muted border-r border-white/5">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 align-middle text-sm text-text-muted whitespace-nowrap">
                                            {new Date(contact.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 align-middle font-semibold text-text-main">
                                            {contact.name}
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-text-main">{contact.email}</span>
                                                <span className="text-xs text-text-muted">{contact.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-text-main">{contact.company_name}</span>
                                                <span className="text-xs text-text-muted whitespace-normal break-words leading-relaxed">{contact.company_address}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            <div className="text-xs text-text-muted whitespace-normal break-words leading-relaxed py-1">
                                                {contact.message}
                                            </div>
                                        </td>
                                        {/* <td className="px-4 py-3 align-middle text-right">
                                            <button
                                                onClick={() => handleDelete(contact._id)}
                                                className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-error transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-white/5 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-text-muted italic">Showing {filteredContacts.length} contacts</span>
                    {filteredContacts.length > 0 && <span className="text-xs text-text-muted">Filtered from {allContacts.length} total</span>}
                </div>
            </div>
        </div>
    );
}
