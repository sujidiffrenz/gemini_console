'use client';

import React from 'react';
import UserEditor from "../../../../components/users/UserEditor";
import { useParams } from 'next/navigation';

export default function EditUserPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div className="flex flex-col gap-lg">
            <h1 className="text-2xl font-bold text-text-main mb-md">Edit User</h1>
            <UserEditor isEditing={true} userId={id} />
        </div>
    );
}
