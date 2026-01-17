'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: '📊' },
    { label: 'Users', path: '/dashboard/users', icon: '👥' },
    { label: 'Products', path: '/dashboard/products', icon: '📦' },
    { label: 'Categories', path: '/dashboard/categories', icon: '🏷️' },
    { label: 'Blogs', path: '/dashboard/blogs', icon: '📰' },
    { label: 'Quotes', path: '/dashboard/quotes', icon: '💬' },
    { label: 'Contacts', path: '/dashboard/contacts', icon: '📞' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className={`
            fixed lg:sticky top-0 left-0 z-50
            w-[280px] h-screen
            flex flex-col p-6
            border-r border-border bg-surface lg:bg-surface/80 backdrop-blur-[20px]
            transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
        `}>
            <div className="flex items-center justify-between mb-8">
                <div className="text-[1.5rem] font-bold text-text-main flex items-center gap-sm">
                    <span className="bg-gradient-to-r from-primary to-[#818cf8] bg-clip-text text-transparent font-extrabold uppercase tracking-tight">Gemini</span>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-black/5 rounded-md text-text-muted hover:text-text-main transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => onClose()}
                        className={`
                            flex items-center gap-4 p-3 rounded-lg
                            text-text-muted transition-all duration-200 font-medium
                            hover:bg-black/5 hover:text-text-main group
                            ${pathname === item.path ? 'bg-primary/10 text-primary' : ''}
                        `}
                    >
                        <span className={`text-xl transition-transform group-hover:scale-110 ${pathname === item.path ? 'scale-110' : ''}`}>
                            {item.icon}
                        </span>
                        {item.label}
                    </Link>
                ))}

                <button
                    onClick={() => {
                        onClose();
                        logout();
                    }}
                    className={`
                        flex items-center gap-4 p-3 rounded-lg
                        text-text-muted transition-all duration-200 font-medium
                        hover:bg-error/10 hover:text-error group mt-auto
                    `}
                >
                    <span className="text-xl transition-transform group-hover:scale-110">
                        🚪
                    </span>
                    Sign Out
                </button>
            </nav>
        </aside>
    );
}
