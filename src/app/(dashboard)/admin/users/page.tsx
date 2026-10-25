"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { User, Role, UserStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  MapPin,
  Building2,
  Phone,
  Mail,
  Download,
  Filter,
  Eye,
  X,
  Sprout,
  Store,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import LocationPickerModal, { SelectedLocationData } from "@/components/location/LocationPickerModal";

export default function AdminUsersPage() {
  const {
    users,
    fpos,
    addUser,
    updateUser,
    setUserStatus,
    deleteUser,
    assignFarmerToFPO,
    removeFarmerFromFPO,
    language,
  } = useAppStore();

  const isMr = language === "mr";

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false);
  const [isAddOtherUserOpen, setIsAddOtherUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Form State for Add/Edit Farmer
  const [farmerForm, setFarmerForm] = useState({
    name: "",
    phone: "",
    email: "",
    preferredLanguage: "mr" as "mr" | "hi" | "en",
    gender: "Male" as "Male" | "Female" | "Other" | "Prefer not to say",
    farmerType: "Small/Marginal" as User["farmerType"],
    farmName: "",
    village: "",
    taluka: "Baramati",
    district: "Pune",
    state: "Maharashtra",
    pincode: "413102",
    lat: 18.1517,
    lng: 74.5772,
    farmAreaAcres: 3.5,
    primaryCrops: ["Tomato", "Onion"],
    upiId: "",
    fpoId: "",
    status: "Active" as UserStatus,
  });

  // Form State for Add Other User (FPO, Buyer, Verifier, Admin)
  const [otherUserForm, setOtherUserForm] = useState({
    name: "",
    role: "fpo" as Role,
    phone: "",
    email: "",
    organization: "",
    location: "Pune, Maharashtra",
    village: "",
    taluka: "Haveli",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411005",
    lat: 18.5204,
    lng: 73.8567,
    fpoId: "",
    status: "Active" as UserStatus,
  });

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.district && u.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.taluka && u.taluka.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.organization && u.organization.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Open Location Picker for farmer form
  const handleLocationPicked = (loc: SelectedLocationData) => {
    setFarmerForm((prev) => ({
      ...prev,
      village: loc.village || prev.village,
      taluka: loc.taluka,
      district: loc.district,
      state: loc.state,
      pincode: loc.pincode || prev.pincode,
      lat: loc.lat,
      lng: loc.lng,
    }));
    toast.success(`Coordinates updated: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
  };

  // Submit Add Farmer
  const handleCreateFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerForm.name.trim() || !farmerForm.phone.trim()) {
      toast.error("Full Name and Mobile Number are mandatory.");
      return;
    }

    // Check duplicate phone
    if (users.some((u) => u.phone === farmerForm.phone.trim())) {
      toast.error("A user with this mobile number is already registered.");
      return;
    }

    const newUser = addUser({
      name: farmerForm.name.trim(),
      role: "farmer",
      phone: farmerForm.phone.trim(),
      email: farmerForm.email.trim() || undefined,
      preferredLanguage: farmerForm.preferredLanguage,
      gender: farmerForm.gender,
      farmerType: farmerForm.farmerType,
      farmName: farmerForm.farmName.trim() || `${farmerForm.name.trim()}'s Farm`,
      village: farmerForm.village.trim() || undefined,
      taluka: farmerForm.taluka.trim(),
      district: farmerForm.district.trim(),
      state: farmerForm.state.trim(),
      pincode: farmerForm.pincode.trim() || undefined,
      lat: farmerForm.lat,
      lng: farmerForm.lng,
      farmAreaAcres: Number(farmerForm.farmAreaAcres) || 2.0,
      crops: farmerForm.primaryCrops,
      primaryCrops: farmerForm.primaryCrops,
      upiId: farmerForm.upiId.trim() || undefined,
      bankUpiMasked: farmerForm.upiId.trim() ? `****${farmerForm.upiId.slice(-4)}` : undefined,
      fpoId: farmerForm.fpoId || undefined,
      location: `${farmerForm.village ? `${farmerForm.village}, ` : ""}${farmerForm.taluka}, ${farmerForm.district}`,
      status: farmerForm.status,
      createdAt: new Date().toISOString(),
    });

    toast.success(`Farmer "${newUser.name}" created successfully with ID ${newUser.id}!`);
    setIsAddFarmerOpen(false);
  };

  // Submit Add Other User
  const handleCreateOtherUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherUserForm.name.trim() || !otherUserForm.phone.trim()) {
      toast.error("Name and Phone number are required.");
      return;
    }

    if (users.some((u) => u.phone === otherUserForm.phone.trim())) {
      toast.error("A user with this mobile number is already registered.");
      return;
    }

    const newUser = addUser({
      name: otherUserForm.name.trim(),
      role: otherUserForm.role,
      phone: otherUserForm.phone.trim(),
      email: otherUserForm.email.trim() || undefined,
      organization: otherUserForm.organization.trim() || undefined,
      location: otherUserForm.location.trim(),
      district: otherUserForm.district.trim(),
      state: otherUserForm.state.trim(),
      lat: otherUserForm.lat,
      lng: otherUserForm.lng,
      fpoId: otherUserForm.fpoId || undefined,
      status: otherUserForm.status,
      createdAt: new Date().toISOString(),
    });

    toast.success(`${otherUserForm.role.toUpperCase()} "${newUser.name}" created successfully!`);
    setIsAddOtherUserOpen(false);
  };

  // Save Edit User
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, editingUser);
    toast.success(`User "${editingUser.name}" profile updated.`);
    setEditingUser(null);
  };

  // Delete User with confirmation
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      return;
    }

    const result = deleteUser(id);
    if (result.success) {
      toast.success(`User "${name}" has been permanently removed.`);
    } else {
      toast.error(result.message || "Failed to delete user.");
    }
  };

  // Toggle User Status
  const handleStatusToggle = (user: User) => {
    const nextStatus: UserStatus =
      user.status === "Active" ? "Inactive" : user.status === "Inactive" ? "Active" : "Active";
    setUserStatus(user.id, nextStatus);
    toast.success(`User ${user.name} is now ${nextStatus}`);
  };

  // Export Users as CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Role",
      "Phone",
      "Email",
      "District",
      "State",
      "FPO_ID",
      "Status",
      "Created_At",
    ];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.role,
      u.phone || "",
      u.email || "",
      `"${u.district || ""}"`,
      `"${u.state || ""}"`,
      u.fpoId || "",
      u.status,
      u.createdAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `krishisetu_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${users.length} users to CSV.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "वापरकर्ता आणि शेतकरी व्यवस्थापन" : "User & Farmer Master Registry"}
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
              {users.length} {isMr ? "नोंदणीकृत" : "Total Users"}
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "सर्व शेतकरी, एफपीओ व्यवस्थापक, खरेदीदार आणि अधिकाऱ्यांची थेट निर्मिती आणि व्यवस्थापन करा."
              : "Live database of registered farmers, FPO managers, institutional buyers, and field verifiers."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddOtherUserOpen(true)}
            variant="outline"
            className="text-xs border-slate-300"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add FPO / Buyer / Verifier
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddFarmerOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {isMr ? "+ नवीन शेतकरी नोंदणी" : "+ Add Farmer"}
          </Button>
        </div>
      </div>

      {/* Role Summary Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { role: "farmer", label: isMr ? "शेतकरी" : "Farmers", count: users.filter((u) => u.role === "farmer").length, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { role: "fpo", label: isMr ? "एफपीओ" : "FPOs", count: users.filter((u) => u.role === "fpo").length, color: "text-amber-700 bg-amber-50 border-amber-200" },
          { role: "buyer", label: isMr ? "खरेदीदार" : "Buyers", count: users.filter((u) => u.role === "buyer").length, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { role: "verifier", label: isMr ? "तपासणी अधिकारी" : "Verifiers", count: users.filter((u) => u.role === "verifier").length, color: "text-purple-700 bg-purple-50 border-purple-200" },
          { role: "admin", label: isMr ? "प्रशासक" : "Admins", count: users.filter((u) => u.role === "admin").length, color: "text-slate-700 bg-slate-100 border-slate-200" },
        ].map((item) => (
          <div
            key={item.role}
            onClick={() => setRoleFilter(roleFilter === item.role ? "all" : item.role)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${item.color} ${
              roleFilter === item.role ? "ring-2 ring-emerald-600 font-bold shadow-xs" : "opacity-90 hover:opacity-100"
            }`}
          >
            <div className="text-xl font-extrabold">{item.count}</div>
            <div className="text-xs font-semibold">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isMr ? "नाव, फोन, तालुका, जिल्हा किंवा एफपीओने शोधा..." : "Search by name, mobile, taluka, district..."}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 text-xs px-3 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmer</option>
              <option value="fpo">FPO Manager</option>
              <option value="buyer">Buyer</option>
              <option value="verifier">Verifier</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 text-xs px-3 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">User / ID</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Location / Cluster</th>
                <th className="p-3.5">FPO Affiliation</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No users matching the filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const fpo = fpos.find((f) => f.id === user.fpoId);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.role === "farmer" && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 py-0">
                              {user.farmerType || "Farmer"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {user.id}</div>
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${
                            user.role === "farmer"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : user.role === "fpo"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : user.role === "buyer"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : user.role === "verifier"
                              ? "bg-purple-50 text-purple-800 border-purple-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div>{user.phone || "—"}</div>
                        {user.email && <div className="text-[10px] text-slate-400">{user.email}</div>}
                      </td>

                      <td className="p-3.5">
                        <div>
                          {user.village ? `${user.village}, ` : ""}
                          {user.taluka ? `${user.taluka}, ` : ""}
                          <span className="font-semibold text-slate-900">{user.district || "Maharashtra"}</span>
                        </div>
                        {user.lat && user.lng && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            📍 {user.lat.toFixed(3)}, {user.lng.toFixed(3)}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        {fpo ? (
                          <div className="text-emerald-800 font-medium truncate max-w-[180px]">
                            {fpo.name}
                          </div>
                        ) : user.role === "farmer" ? (
                          <span className="text-slate-400 italic">Independent</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                            user.status === "Active"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                              : user.status === "Pending"
                              ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {user.status}
                        </button>
                      </td>

                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingUser(user)}
                          title="View Details"
                          className="w-7 h-7 text-slate-500 hover:text-emerald-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingUser(user)}
                          title="Edit User"
                          className="w-7 h-7 text-slate-500 hover:text-blue-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id, user.name)}
                          title="Delete User"
                          className="w-7 h-7 text-slate-400 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ==================== ADD FARMER MODAL ==================== */}
      {isAddFarmerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Sprout className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {isMr ? "नवीन शेतकरी सविस्तर नोंदणी" : "Register Progressive Farmer"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr
                      ? "स्थान, संपर्क, शेती क्षेत्र, पिके आणि एफपीओ जोडणी करा."
                      : "Add complete farmer profile with location pin, crops, and FPO link."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFarmerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFarmer} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Row 1: Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "शेतकऱ्याचे पूर्ण नाव" : "Full Name"} *
                  </label>
                  <Input
                    required
                    value={farmerForm.name}
                    onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Baburao Patil"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "मोबाईल क्रमांक (10 Digit)" : "Mobile Number"} *
                  </label>
                  <Input
                    required
                    value={farmerForm.phone}
                    onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                    placeholder="9822100011"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Email & Preferred Language & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "ईमेल (पर्यायी)" : "Email (Optional)"}
                  </label>
                  <Input
                    type="email"
                    value={farmerForm.email}
                    onChange={(e) => setFarmerForm({ ...farmerForm, email: e.target.value })}
                    placeholder="farmer@krishisetu.in"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "प्राधान्य भाषा" : "Preferred Language"}
                  </label>
                  <select
                    value={farmerForm.preferredLanguage}
                    onChange={(e) =>
                      setFarmerForm({ ...farmerForm, preferredLanguage: e.target.value as any })
                    }
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "शेतकरी प्रकार" : "Farmer Category"}
                  </label>
                  <select
                    value={farmerForm.farmerType}
                    onChange={(e) =>
                      setFarmerForm({ ...farmerForm, farmerType: e.target.value as any })
                    }
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Small/Marginal">Small/Marginal (&lt; 5 acres)</option>
                    <option value="Medium">Medium (5 - 15 acres)</option>
                    <option value="Large">Large (&gt; 15 acres)</option>
                    <option value="Tenant">Tenant / Sharecropper</option>
                    <option value="FPO Member">FPO Member</option>
                  </select>
                </div>
              </div>

              {/* Location Picker Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>{isMr ? "शेताचे स्थान आणि पिन" : "Farm Location & Pin Coordinates"}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-8"
                  >
                    📍 {isMr ? "नकाशा / GPS वरून निवडा" : "Open Location Picker"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Village</label>
                    <Input
                      value={farmerForm.village}
                      onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })}
                      placeholder="Malegaon BK"
                      className="text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Taluka</label>
                    <Input
                      value={farmerForm.taluka}
                      onChange={(e) => setFarmerForm({ ...farmerForm, taluka: e.target.value })}
                      placeholder="Baramati"
                      className="text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">District *</label>
                    <Input
                      required
                      value={farmerForm.district}
                      onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
                      placeholder="Pune"
                      className="text-xs h-8 font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Pincode</label>
                    <Input
                      value={farmerForm.pincode}
                      onChange={(e) => setFarmerForm({ ...farmerForm, pincode: e.target.value })}
                      placeholder="413115"
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    Lat: {farmerForm.lat.toFixed(4)}
                  </span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    Lng: {farmerForm.lng.toFixed(4)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isMr ? "स्थान बदलण्यासाठी वरील बटण वापरा." : "Use button above to pinpoint via map."}
                  </span>
                </div>
              </div>

              {/* Row 3: Farm Area, UPI, FPO Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "शेती क्षेत्र (एकरामध्ये)" : "Farm Area (Acres)"}
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={farmerForm.farmAreaAcres}
                    onChange={(e) =>
                      setFarmerForm({ ...farmerForm, farmAreaAcres: parseFloat(e.target.value) || 0 })
                    }
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "बँक / UPI ID" : "Bank UPI ID (Payouts)"}
                  </label>
                  <Input
                    value={farmerForm.upiId}
                    onChange={(e) => setFarmerForm({ ...farmerForm, upiId: e.target.value })}
                    placeholder="farmer@okhdfcbank"
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isMr ? "एफपीओ संस्था जोडणी" : "Assign to FPO Hub"}
                  </label>
                  <select
                    value={farmerForm.fpoId}
                    onChange={(e) => setFarmerForm({ ...farmerForm, fpoId: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white font-medium"
                  >
                    <option value="">Independent (No FPO)</option>
                    {fpos.map((fpo) => (
                      <option key={fpo.id} value={fpo.id}>
                        {fpo.name} ({fpo.taluka})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold">✓ Audit Ledger Chaining:</span> Creating this farmer will record an immutable SHA-256 cryptographic audit event in the platform ledger.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddFarmerOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {isMr ? "शेतकरी जतन करा" : "Register Farmer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD OTHER USER MODAL ==================== */}
      {isAddOtherUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">Add Platform User (FPO / Buyer / Verifier / Admin)</h3>
              <button
                onClick={() => setIsAddOtherUserOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOtherUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <Input
                  required
                  value={otherUserForm.name}
                  onChange={(e) => setOtherUserForm({ ...otherUserForm, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role *</label>
                  <select
                    value={otherUserForm.role}
                    onChange={(e) => setOtherUserForm({ ...otherUserForm, role: e.target.value as Role })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="fpo">FPO Manager</option>
                    <option value="buyer">Institutional Buyer</option>
                    <option value="verifier">Field Verifier</option>
                    <option value="admin">Platform Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone *</label>
                  <Input
                    required
                    value={otherUserForm.phone}
                    onChange={(e) => setOtherUserForm({ ...otherUserForm, phone: e.target.value })}
                    placeholder="9422088990"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Organization / Enterprise</label>
                <Input
                  value={otherUserForm.organization}
                  onChange={(e) => setOtherUserForm({ ...otherUserForm, organization: e.target.value })}
                  placeholder="e.g. FreshMart Foods Pvt. Ltd."
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">District</label>
                  <Input
                    value={otherUserForm.district}
                    onChange={(e) => setOtherUserForm({ ...otherUserForm, district: e.target.value })}
                    placeholder="Pune"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={otherUserForm.status}
                    onChange={(e) => setOtherUserForm({ ...otherUserForm, status: e.target.value as UserStatus })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOtherUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT USER MODAL ==================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">Edit User: {editingUser.name} ({editingUser.id})</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Name</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <Input
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">District</label>
                  <Input
                    value={editingUser.district || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, district: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">FPO Hub</label>
                  <select
                    value={editingUser.fpoId || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, fpoId: e.target.value || undefined })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="">No FPO</option>
                    {fpos.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW USER DETAILS DRAWER ==================== */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{viewingUser.name}</h3>
                <Badge variant="outline" className="uppercase font-mono text-[10px] mt-0.5">
                  {viewingUser.role} • {viewingUser.id}
                </Badge>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-400">Mobile Phone:</span>
                <span className="font-bold text-slate-800 font-mono">{viewingUser.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-800">
                  {viewingUser.village ? `${viewingUser.village}, ` : ""}
                  {viewingUser.taluka ? `${viewingUser.taluka}, ` : ""}
                  {viewingUser.district || "Maharashtra"}
                </span>
              </div>
              {viewingUser.lat && viewingUser.lng && (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-slate-800">
                    {viewingUser.lat.toFixed(4)}°N, {viewingUser.lng.toFixed(4)}°E
                  </span>
                </div>
              )}
              {viewingUser.farmAreaAcres && (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-400">Farm Area:</span>
                  <span className="font-medium text-slate-800">{viewingUser.farmAreaAcres} Acres</span>
                </div>
              )}
              {viewingUser.primaryCrops && viewingUser.primaryCrops.length > 0 && (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-400">Crops:</span>
                  <span className="font-medium text-emerald-800">{viewingUser.primaryCrops.join(", ")}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-400">FPO Affiliation:</span>
                <span className="font-medium text-slate-800">
                  {fpos.find((f) => f.id === viewingUser.fpoId)?.name || "Independent"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Registration Date:</span>
                <span className="font-mono text-slate-700">
                  {new Date(viewingUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button
              className="w-full text-xs"
              variant="outline"
              onClick={() => setViewingUser(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Location Picker Sub-modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelectLocation={handleLocationPicked}
        initialLocation={{
          village: farmerForm.village,
          taluka: farmerForm.taluka,
          district: farmerForm.district,
          state: farmerForm.state,
          pincode: farmerForm.pincode,
          lat: farmerForm.lat,
          lng: farmerForm.lng,
        }}
        language={language}
        title={isMr ? "शेतकऱ्याचे शेत स्थान निश्चित करा" : "Pinpoint Farmer's Farm Location"}
      />
    </div>
  );
}
