import DashboardLayout from "@/components/DashboardConfig/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}
