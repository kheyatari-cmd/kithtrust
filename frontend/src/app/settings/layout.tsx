import { Sidebar } from "@/components/layout/sidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-0 mt-14 md:mt-0">
        <div className="bg-grid min-h-screen">
          <div className="bg-gradient-radial min-h-screen p-4 md:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
