"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminUserRecord {
  id: string;
  name: string;
  role: "farmer" | "fpo" | "buyer" | "admin";
  location: string;
  fpoAffiliation?: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
  phone: string;
  joinedDate: string;
}

const INITIAL_USERS: AdminUserRecord[] = [
  {
    id: "F1",
    name: "Ramesh Patil",
    role: "farmer",
    location: "Malegaon BK, Baramati, Pune",
    fpoAffiliation: "Saksham FPO (Baramati Krushi PC)",
    kycStatus: "Verified",
    phone: "+91 98221 00011",
    joinedDate: "2026-01-15",
  },
  {
    id: "F2",
    name: "Suresh Gaikwad",
    role: "farmer",
    location: "Rui Village, Baramati, Pune",
    fpoAffiliation: "Saksham FPO (Baramati Krushi PC)",
    kycStatus: "Verified",
    phone: "+91 98221 00022",
    joinedDate: "2026-02-01",
  },
  {
    id: "FPO1",
    name: "Saksham FPO Manager",
    role: "fpo",
    location: "Baramati APMC Yard Office",
    fpoAffiliation: "Baramati Krushi Producer Company Ltd.",
    kycStatus: "Verified",
    phone: "+91 94220 88990",
    joinedDate: "2025-11-20",
  },
  {
    id: "B1",
    name: "FreshMart Foods Pvt. Ltd.",
    role: "buyer",
    location: "Hadapsar Industrial Area, Pune",
    kycStatus: "Verified",
    phone: "+91 20 2687 4000",
    joinedDate: "2026-03-05",
  },
  {
    id: "A1",
    name: "KrishiSetu Admin",
    role: "admin",
    location: "Pune Headquarters",
    kycStatus: "Verified",
    phone: "+91 20 2555 1234",
    joinedDate: "2025-10-01",
  },
];

export default function AdminUsersPage() {
  const [userList, setUserList] = useState<AdminUserRecord[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleVerifyToggle = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kycStatus: u.kycStatus === "Verified" ? "Pending" : "Verified" } : u))
    );
    toast.success("User KYC Status Updated!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User &amp; Organization Management</h1>
          <p className="text-slate-500 text-sm">
            Administer farmers, FPO managers, commercial buyers, and field verifiers.
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 w-fit">
          <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" /> RBAC Policy: Strict Role Isolation
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search by name, location, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-48">
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v || "all")}>
                <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="fpo">FPO Managers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name &amp; Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>FPO Organization</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs font-semibold">{user.id}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{user.location}</TableCell>
                  <TableCell className="text-xs text-slate-600">{user.fpoAffiliation || "Direct Marketplace"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.kycStatus === "Verified"
                          ? "bg-green-100 text-green-800 border-none text-[11px]"
                          : "bg-amber-100 text-amber-800 border-none text-[11px]"
                      }
                    >
                      {user.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleVerifyToggle(user.id)}
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Toggle KYC
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
