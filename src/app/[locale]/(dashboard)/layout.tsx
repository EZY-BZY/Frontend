import { SidebarProvider, SidebarPanel } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/*
        Outer shell: full-height flex row.
        SidebarPanel is a flex child with fixed animated width (shrink-0).
        The content column takes the rest (flex-1, min-w-0 prevents overflow).
      */}
      <div className="flex h-screen overflow-hidden bg-[#F7F9FB]">
        {/* ── Desktop sidebar (flex sibling, NOT overlay) ── */}
        <SidebarPanel />

        {/* ── Content column ── */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Sticky top bar */}
          <TopBar />

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
