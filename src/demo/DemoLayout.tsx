import { Outlet, Link } from "react-router-dom";
import { SeedDataProvider } from "./SeedDataProvider";
import DemoSidebar from "./DemoSidebar";

export default function DemoLayout() {
  return (
    <SeedDataProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <DemoSidebar />
        <main className="flex-1 overflow-auto">
          <div className="border-b border-black bg-secondary px-4 sm:px-6 lg:px-8 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 border border-black bg-white font-bold uppercase text-xs tracking-wide">
              Demo
            </span>
            <span className="text-black">
              Sample data only — nothing here is saved.
            </span>
            <Link to="/auth" className="underline font-medium">
              Use the real app
            </Link>
          </div>
          <Outlet />
        </main>
      </div>
    </SeedDataProvider>
  );
}
