import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import DashboardNav from "@/components/DashboardNav";
import { UserProvider } from "@/context/UserContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const userData = await User.findById((session.user as any).id).select("-password");
  const user = JSON.parse(JSON.stringify(userData));

  return (
    <UserProvider initialUser={user}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
        {/* Simplified Background to fix lag */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)]" />
        </div>

        <DashboardNav />
        
        <main className="relative pt-32 pb-20 z-10 w-full max-w-full">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
