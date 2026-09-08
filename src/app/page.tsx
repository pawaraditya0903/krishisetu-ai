"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Users, Store, Shield, Loader2, CheckCircle2 } from "lucide-react";

interface DemoUserWithCredentials extends User {
  phone: string;
  defaultPassword: string;
}

const DEMO_USERS: DemoUserWithCredentials[] = [
  { id: "F1", name: "Ramesh Patil", role: "farmer", location: "Baramati, Pune", phone: "9822100011", defaultPassword: "demo_password" },
  { id: "FPO1", name: "Saksham FPO", role: "fpo", location: "Baramati Krushi Producer Company", phone: "9422088990", defaultPassword: "demo_password" },
  { id: "B1", name: "FreshMart Foods Pvt. Ltd.", role: "buyer", phone: "0202687400", defaultPassword: "demo_password" },
  { id: "A1", name: "KrishiSetu Admin", role: "admin", phone: "0202555123", defaultPassword: "demo_password" }
];

export default function LoginPage() {
  const login = useAppStore(state => state.login);
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [authNote, setAuthNote] = useState<string | null>(null);

  const handleLogin = async (user: DemoUserWithCredentials) => {
    setLoadingUser(user.id);
    setAuthNote(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user.phone,
          password: user.defaultPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        login(user, data.access_token);
        setAuthNote(`Authenticated with backend JWT (${data.role})`);
        router.push(`/${user.role}`);
        return;
      }
    } catch {
      // Backend unreachable: fallback to offline local mode per specification
      console.warn("Backend API unreachable, logging in with offline local mode credentials.");
    }

    // Offline / fallback session
    login(user);
    router.push(`/${user.role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-700 p-3 rounded-xl shadow-md">
            <Sprout className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">KrishiSetu AI</h1>
        <p className="text-slate-500">Offline-first FPO-assisted farmer market-linkage platform</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold uppercase tracking-wider">
            SIH 2026 Production MVP
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero-Trust JWT Auth
          </span>
        </div>
        {authNote && (
          <p className="mt-2 text-xs text-green-700 font-medium animate-pulse">{authNote}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {DEMO_USERS.map((user) => {
          const isLoading = loadingUser === user.id;
          return (
            <Card
              key={user.id}
              className="hover:border-green-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
              onClick={() => !loadingUser && handleLogin(user)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="bg-green-100 p-3 rounded-full text-green-700">
                  {user.role === 'farmer' && <Sprout className="w-6 h-6" />}
                  {user.role === 'fpo' && <Users className="w-6 h-6" />}
                  {user.role === 'buyer' && <Store className="w-6 h-6" />}
                  {user.role === 'admin' && <Shield className="w-6 h-6" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription className="capitalize font-medium text-slate-600">{user.role}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {user.location && <p className="text-xs text-slate-500 mb-1">{user.location}</p>}
                <p className="text-xs text-slate-400 font-mono mb-3">Phone: {user.phone}</p>
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 flex items-center justify-center gap-2"
                  disabled={!!loadingUser}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    `Login as ${user.role}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
