"use client";

import Navigation from "@/components/layout/Navigation";
import { useSyncExternalStore, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";

const emptySubscribe = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const currentUser = useAppStore((state) => state.currentUser);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isMounted && !currentUser) {
      router.replace("/");
    }
  }, [isMounted, currentUser, router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Loading KrishiSetu AI...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-base">Authentication Required</p>
        <p className="text-sm text-slate-400">Redirecting to login portal...</p>
      </div>
    );
  }

  return <Navigation>{children}</Navigation>;
}
