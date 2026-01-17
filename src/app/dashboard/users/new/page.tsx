import UserEditor from "../../../../components/users/UserEditor";

export default function NewUserPage() {
    return (
        <div className="flex flex-col gap-lg">
            <h1 className="text-2xl font-bold text-text-main mb-md">Add New User</h1>
            <UserEditor />
        </div>
    );
}
