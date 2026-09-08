"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { Role, RolePermissions } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminRolePermissionsPage() {
  const { rolePermissions, updateRolePermissions, language } = useAppStore();
  const isMr = language === "mr";

  const permissionKeys: Array<{ key: keyof Omit<RolePermissions, "role" | "label">; label: string; desc: string }> = [
    { key: "canViewMarketPrices", label: "View Mandi Prices", desc: "Access live Agmarknet APMC rates" },
    { key: "canUseVoiceAssistant", label: "Voice Assistant", desc: "Interact via speech in Indic languages" },
    { key: "canGradeCrop", label: "AI Quality Grading", desc: "Upload and analyze crop lot photos" },
    { key: "canCreatePools", label: "Create Freight Pools", desc: "Consolidate lots for shared transit" },
    { key: "canManageLogistics", label: "Manage Logistics", desc: "Assign trucks and route waypoints" },
    { key: "canAuthorizeEscrow", label: "Authorize Escrow", desc: "Lock or release protected bank funds" },
    { key: "canViewPrivateFarmerData", label: "View Farmer Details", desc: "Access phone and farm coordinates" },
    { key: "canManageUsers", label: "Manage Users", desc: "Create, edit, or deactivate accounts" },
    { key: "canManageMandis", label: "Manage Mandis", desc: "Add mandis or bulk import CSVs" },
    { key: "canManageSettings", label: "Discovery Settings", desc: "Tune radius and deduction engines" },
  ];

  const handleToggle = (role: Role, key: keyof Omit<RolePermissions, "role" | "label">, currentVal: boolean) => {
    // Safeguard: Do not revoke Admin management capabilities
    if (role === "admin" && (key === "canManageUsers" || key === "canManageSettings")) {
      toast.error("Security policy: Administrator management rights cannot be disabled.");
      return;
    }

    updateRolePermissions(role, { [key]: !currentVal });
    toast.success(`Updated permission "${key}" for ${role.toUpperCase()}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "भूमिका आणि परवानग्या सुरक्षा मॅट्रिक्स" : "Role-Based Access Control (RBAC) Security Matrix"}
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
              5 System Roles
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "प्रत्येक भूमिकेसाठी (शेतकरी, एफपीओ, खरेदीदार, तपासणी अधिकारी, प्रशासक) प्रवेश परवानग्या नियंत्रित करा."
              : "Enforce zero-trust granular permissions across portal capabilities and APIs."}
          </p>
        </div>
      </div>

      {/* Permissions Table Card */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="w-5 h-5 text-emerald-700" />
            <CardTitle className="text-base font-bold">Platform Capability Entitlements Matrix</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Toggles update persistent security store and apply immediately to portal navigation and routes.
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 min-w-[220px]">Capability / Feature</th>
                {rolePermissions.map((rp) => (
                  <th key={rp.role} className="p-3.5 text-center min-w-[120px]">
                    <div className="font-bold text-slate-900">{rp.label}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{rp.role}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionKeys.map(({ key, label, desc }) => (
                <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">{label}</div>
                    <div className="text-[10px] text-slate-400">{desc}</div>
                  </td>

                  {rolePermissions.map((rp) => {
                    const isGranted = !!rp[key];
                    const isLocked = rp.role === "admin" && (key === "canManageUsers" || key === "canManageSettings");

                    return (
                      <td key={rp.role} className="p-3.5 text-center">
                        <button
                          disabled={isLocked}
                          onClick={() => handleToggle(rp.role, key, isGranted)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isGranted
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200"
                          } ${isLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                          title={isLocked ? "Locked Core Admin Permission" : isGranted ? "Granted (Click to revoke)" : "Revoked (Click to grant)"}
                        >
                          {isGranted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
