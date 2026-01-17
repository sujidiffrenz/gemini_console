import DashboardLayout from "@/components/DashboardConfig/DashboardLayout";
import AuthGuard from "@/components/Auth/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </AuthGuard>
    );
}
