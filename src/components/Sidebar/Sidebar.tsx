'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Users', path: '/dashboard/users', icon: '👥' },
    { label: 'Products', path: '/dashboard/products', icon: '📦' },
    { label: 'Categories', path: '/dashboard/categories', icon: '🏷️' },
    { label: 'Blogs', path: '/dashboard/blogs', icon: '📰' },
    { label: 'Quotes', path: '/dashboard/quotes', icon: '💬' },
    { label: 'SignOut', path: '/login', icon: '🚪' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-[260px] h-screen sticky top-0 flex flex-col p-lg border-r border-white/5 bg-[#0f1115]/80 backdrop-blur-[10px] z-50 overflow-y-auto">
            <div className="text-[1.5rem] font-bold mb-xl text-text-main flex items-center gap-sm">
                <span className="bg-gradient-to-r from-primary to-[#a5b4fc] bg-clip-text text-transparent">Gemini</span> Admin
            </div>

            <nav className="flex flex-col gap-xs flex-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-md p-md rounded-md text-text-muted transition-all duration-150 font-medium cursor-pointer hover:bg-surface-hover hover:text-text-main hover:translate-x-1 ${pathname === item.path ? 'bg-primary/10 text-primary border-l-[3px] border-primary' : ''
                            }`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
