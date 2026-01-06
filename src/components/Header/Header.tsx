'use client';

import React from 'react';

export default function Header({ title = "Dashboard" }: { title?: string }) {
    return (
        <header className="h-[70px] flex items-center justify-between px-xl bg-transparent backdrop-blur-[10px] sticky top-0 z-40">
            <h2 className="text-xl font-semibold text-text-main">{title}</h2>

            <div className="flex items-center gap-lg">
                {/* Search and other actions could go here */}
            </div>
        </header>
    );
}
