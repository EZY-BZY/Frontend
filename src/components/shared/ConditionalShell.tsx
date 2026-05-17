"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";
import { tokenStore } from "@/lib/api-client";

type AuthState = "checking" | "ok" | "redirect";

function AuthLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#F7F9FB]">
      <Image src="/logo.png" alt="B-EASY" width={80} height={80} priority />
      <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[#0A3D62]" />
      </div>
    </div>
  );
}

export function ConditionalShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const isLanding = pathname === `/${locale}` || pathname === `/${locale}/`;

  const [authState, setAuthState] = useState<AuthState>(
    isLanding ? "ok" : "checking"
  );

  useEffect(() => {
    if (isLanding) {
      setAuthState("ok");
      return;
    }
    const token = tokenStore.getAccess();
    if (token) {
      setAuthState("ok");
    } else {
      setAuthState("redirect");
      router.replace(`/${currentLocale}/login`);
    }
  }, [isLanding, router, currentLocale]);

  if (isLanding) {
    return <>{children}</>;
  }

  if (authState === "checking" || authState === "redirect") {
    return <AuthLoader />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#F7F9FB]">
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
