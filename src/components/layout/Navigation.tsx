"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import {
  Sprout,
  LayoutDashboard,
  Camera,
  LineChart,
  TrendingUp,
  Users,
  ShoppingCart,
  FileText,
  CheckSquare,
  Truck,
  Store,
  ShieldAlert,
  LogOut,
  Wifi,
  WifiOff,
  Mic,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { translations, Language } from "@/lib/i18n";
import VoiceAssistantModal from "./VoiceAssistantModal";

export default function Navigation({ children }: { children: React.ReactNode }) {
  const { currentUser, isOffline, setOffline, logout, language, setLanguage } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const t = translations[language] || translations.en;

  if (!currentUser) {
    return <div className="p-8 text-center text-slate-500">Redirecting to login...</div>;
  }

  const navConfig = {
    farmer: [
      { name: t.nav.dashboard, href: "/farmer", icon: LayoutDashboard },
      { name: t.nav.gradeCrop, href: "/farmer/grade", icon: Camera },
      { name: t.nav.marketPrices, href: "/farmer/market", icon: LineChart },
      { name: t.nav.saleAdvisor, href: "/farmer/advisor", icon: TrendingUp },
      { name: t.nav.pooling, href: "/farmer/pooling", icon: Users },
      { name: t.nav.myOrders, href: "/farmer/orders", icon: ShoppingCart },
      { name: t.nav.settlement, href: "/farmer/settlement", icon: FileText },
    ],
    fpo: [
      { name: t.nav.dashboard, href: "/fpo", icon: LayoutDashboard },
      { name: t.nav.verifyLots, href: "/fpo/verify", icon: CheckSquare },
      { name: t.nav.poolManagement, href: "/fpo/pools", icon: Users },
      { name: t.nav.logistics, href: "/fpo/logistics", icon: Truck },
      { name: t.nav.buyers, href: "/fpo/buyers", icon: Store },
    ],
    buyer: [
      { name: t.nav.marketplace, href: "/buyer", icon: Store },
      { name: t.nav.myOffers, href: "/buyer/offers", icon: ShoppingCart },
      { name: t.nav.deliveryAcceptance, href: "/buyer/delivery", icon: CheckSquare },
    ],
    admin: [
      { name: t.nav.dashboard, href: "/admin", icon: LayoutDashboard },
      { name: t.nav.users, href: "/admin/users", icon: Users },
      { name: t.nav.marketData, href: "/admin/market", icon: LineChart },
      { name: t.nav.modelMonitoring, href: "/admin/model", icon: ShieldAlert },
    ],
  };

  const links = navConfig[currentUser.role] || [];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <div className="bg-green-700 p-1.5 rounded-lg text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">{t.appName}</span>
            <div className="text-[10px] text-green-700 font-semibold tracking-wider uppercase">
              {t.nav.fpoTagline}
            </div>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-2">
            {t.nav.navigationLabel}
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-50 text-green-800 border-l-4 border-green-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-green-700" : "text-slate-500"}`} />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate text-slate-900">{currentUser.name}</div>
              <div className="text-xs text-slate-500 capitalize">{currentUser.role}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> {t.nav.logout}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <Sprout className="w-6 h-6 text-green-700" />
            <span className="font-bold text-lg">{t.appName}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-600 text-sm">
            {currentUser.location && (
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-700">
                📍 {currentUser.location}
              </span>
            )}
            <span className="text-xs text-slate-400">| {t.nav.pilotCluster}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
              <Languages className="w-3.5 h-3.5 ml-1.5 mr-1 text-slate-500 hidden sm:inline" />
              {(["en", "mr", "hi"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded text-xs font-medium uppercase transition-colors ${
                    language === lang
                      ? "bg-white text-green-700 font-bold shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "mr" ? "मराठी" : "हिंदी"}
                </button>
              ))}
            </div>

            {/* Voice Assistant (Gemini & Indic NLU) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceOpen(true)}
              className="text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs"
            >
              <Mic className="w-3.5 h-3.5 mr-1.5 text-amber-700" /> {t.nav.saleAdvisor ? (language === "mr" ? "आवाज" : language === "hi" ? "आवाज़" : "Voice") : "Voice"}
            </Button>

            {/* Offline Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffline(!isOffline)}
              className={`text-xs ${
                isOffline
                  ? "text-red-600 border-red-300 bg-red-50"
                  : "text-green-700 border-green-300 bg-green-50"
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5 mr-1.5" /> : <Wifi className="w-3.5 h-3.5 mr-1.5" />}
              <span className="hidden sm:inline">{isOffline ? t.offline : t.online}</span>
            </Button>

            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight border border-emerald-200 hidden sm:inline-flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.demoBadge}
            </span>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          {isOffline && (
            <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg flex items-start text-xs sm:text-sm">
              <WifiOff className="w-5 h-5 mr-3 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <p className="font-semibold">{t.offlineNotice}</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  {t.offlineNoticeSub}
                </p>
              </div>
            </div>
          )}
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around pb-safe z-20">
          {links.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center p-2.5 flex-1 ${
                  active ? "text-green-700 font-bold" : "text-slate-500"
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${active ? "text-green-700" : ""}`} />
                <span className="text-[10px] text-center truncate w-full">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal open={isVoiceOpen} onOpenChange={setIsVoiceOpen} />
    </div>
  );
}
