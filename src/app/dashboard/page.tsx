// src/app/dashboard/page.tsx
import { getAuthSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import StockDashboard from "../../components/dashboard/Dashboard";

export default async function DashboardPage() {
    const session = await getAuthSession();

    if (!session) {
        redirect('/login');
    }

    // Your existing Dashboard component already handles the session with useSession()
    return <StockDashboard />;
}