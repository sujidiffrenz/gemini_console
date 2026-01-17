'use client';

import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-background text-text-main relative overflow-x-hidden">
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 border-l border-border bg-background">
                <Header onMenuClick={toggleSidebar} />
                <main className="flex-1 p-4 sm:p-lg overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
