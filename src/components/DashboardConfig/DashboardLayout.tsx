import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background text-text-main">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 border-l border-white/5">
                <Header />
                <main className="flex-1 p-lg overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
