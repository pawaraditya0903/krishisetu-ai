"use client";

import Navigation from "@/components/layout/Navigation";
import { useSyncExternalStore } from "react";

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

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading KrishiSetu AI...</div>;
  }

  return <Navigation>{children}</Navigation>;
}
