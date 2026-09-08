"use client";

import { useAppStore } from "@/lib/store";
import { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Users, Store, Shield } from "lucide-react";

const DEMO_USERS: User[] = [
  { id: "F1", name: "Ramesh Patil", role: "farmer", location: "Baramati, Pune" },
  { id: "FPO1", name: "Saksham FPO", role: "fpo", location: "Baramati Krushi Producer Company" },
  { id: "B1", name: "FreshMart Foods Pvt. Ltd.", role: "buyer" },
  { id: "A1", name: "KrishiSetu Admin", role: "admin" }
];

export default function LoginPage() {
  const login = useAppStore(state => state.login);
  const router = useRouter();

  const handleLogin = (user: User) => {
    login(user);
    router.push(`/${user.role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-700 p-3 rounded-xl">
            <Sprout className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">KrishiSetu AI</h1>
        <p className="text-slate-500">Offline-first FPO-assisted farmer market-linkage platform</p>
        <span className="inline-block mt-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">SIH 2026 Prototype Demo</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {DEMO_USERS.map((user) => (
          <Card key={user.id} className="hover:border-green-500 hover:shadow-md transition-all cursor-pointer" onClick={() => handleLogin(user)}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-green-100 p-3 rounded-full text-green-700">
                {user.role === 'farmer' && <Sprout className="w-6 h-6" />}
                {user.role === 'fpo' && <Users className="w-6 h-6" />}
                {user.role === 'buyer' && <Store className="w-6 h-6" />}
                {user.role === 'admin' && <Shield className="w-6 h-6" />}
              </div>
              <div>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <CardDescription className="capitalize">{user.role}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {user.location && <p className="text-sm text-slate-500">{user.location}</p>}
              <Button className="w-full mt-4 bg-green-700 hover:bg-green-800">Login as {user.role}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
