"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FPOOrganization, FPOCollectionCenter } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  UserPlus,
  UserMinus,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import LocationPickerModal, { SelectedLocationData } from "@/components/location/LocationPickerModal";

export default function AdminFPOsPage() {
  const {
    fpos,
    users,
    addFPO,
    updateFPO,
    setFPOStatus,
    deleteFPO,
    addCollectionCenter,
    assignFarmerToFPO,
    removeFarmerFromFPO,
    language,
  } = useAppStore();

  const isMr = language === "mr";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isAddFPOOpen, setIsAddFPOOpen] = useState(false);
  const [editingFPO, setEditingFPO] = useState<FPOOrganization | null>(null);
  const [rosterFPO, setRosterFPO] = useState<FPOOrganization | null>(null);
  const [collectionCentersFPO, setCollectionCentersFPO] = useState<FPOOrganization | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Form State for FPO Add/Edit
  const [fpoForm, setFpoForm] = useState<Partial<FPOOrganization>>({
    name: "",
    regNumber: "",
    contactPerson: "",
    phone: "",
    email: "",
    village: "",
    taluka: "Baramati",
    district: "Pune",
    state: "Maharashtra",
    pincode: "413115",
    lat: 18.1517,
    lng: 74.5772,
    supportedCrops: ["Tomato", "Onion", "Soybean"],
    serviceFeePaisePerQtl: 150,
    poolMinKg: 500,
    poolMaxKg: 10000,
    defaultPoolClosingDays: 3,
    status: "Active",
  });

  // Center form inside Collection Centers Modal
  const [newCenterForm, setNewCenterForm] = useState({
    name: "",
    village: "",
    taluka: "Baramati",
    district: "Pune",
    state: "Maharashtra",
    lat: 18.1517,
    lng: 74.5772,
    capacityKg: 20000,
    contactPerson: "",
    phone: "",
  });

  // Assign Farmer Search
  const [assignFarmerSearch, setAssignFarmerSearch] = useState("");

  const filteredFPOs = fpos.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.taluka.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Location Picked
  const handleLocationPicked = (loc: SelectedLocationData) => {
    setFpoForm((prev) => ({
      ...prev,
      village: loc.village || prev.village,
      taluka: loc.taluka,
      district: loc.district,
      state: loc.state,
      pincode: loc.pincode || prev.pincode,
      lat: loc.lat,
      lng: loc.lng,
    }));
    toast.success(`Coordinates captured: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
  };

  // Submit Add / Edit FPO
  const handleSaveFPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpoForm.name?.trim() || !fpoForm.phone?.trim()) {
      toast.error("FPO Name and Contact Phone are required.");
      return;
    }

    if (editingFPO) {
      updateFPO(editingFPO.id, fpoForm);
      toast.success(`FPO "${fpoForm.name}" updated successfully.`);
      setEditingFPO(null);
    } else {
      const created = addFPO({
        name: fpoForm.name.trim(),
        regNumber: fpoForm.regNumber?.trim(),
        contactPerson: fpoForm.contactPerson?.trim() || "Chief Executive Officer",
        phone: fpoForm.phone.trim(),
        email: fpoForm.email?.trim() || undefined,
        village: fpoForm.village?.trim() || undefined,
        taluka: fpoForm.taluka?.trim() || "District Center",
        district: fpoForm.district?.trim() || "Maharashtra",
        state: fpoForm.state?.trim() || "Maharashtra",
        pincode: fpoForm.pincode?.trim() || undefined,
        lat: fpoForm.lat || 18.5204,
        lng: fpoForm.lng || 73.8567,
        supportedCrops: fpoForm.supportedCrops || ["Tomato", "Onion"],
        serviceFeePaisePerQtl: fpoForm.serviceFeePaisePerQtl || 150,
        poolMinKg: fpoForm.poolMinKg || 500,
        poolMaxKg: fpoForm.poolMaxKg || 10000,
        defaultPoolClosingDays: fpoForm.defaultPoolClosingDays || 3,
        managerIds: [],
        memberFarmerIds: [],
        collectionCenters: [],
        status: fpoForm.status || "Active",
        createdAt: new Date().toISOString(),
      });

      toast.success(`FPO "${created.name}" created with ID ${created.id}!`);
      setIsAddFPOOpen(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = (fpo: FPOOrganization) => {
    const nextStatus: FPOOrganization["status"] =
      fpo.status === "Active" ? "Inactive" : fpo.status === "Inactive" ? "Active" : "Active";
    setFPOStatus(fpo.id, nextStatus);
    toast.success(`FPO ${fpo.name} status changed to ${nextStatus}`);
  };

  // Delete FPO
  const handleDeleteFPO = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete FPO "${name}"?`)) {
      const result = deleteFPO(id);
      if (result.success) {
        toast.success(`FPO "${name}" deleted.`);
      } else {
        toast.error(result.message || "Failed to delete FPO.");
      }
    }
  };

  // Add Collection Center
  const handleAddCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionCentersFPO || !newCenterForm.name.trim()) return;

    addCollectionCenter(collectionCentersFPO.id, {
      name: newCenterForm.name.trim(),
      village: newCenterForm.village.trim() || undefined,
      taluka: newCenterForm.taluka.trim(),
      district: newCenterForm.district.trim(),
      state: newCenterForm.state.trim(),
      lat: newCenterForm.lat,
      lng: newCenterForm.lng,
      capacityKg: Number(newCenterForm.capacityKg) || 15000,
      contactPerson: newCenterForm.contactPerson.trim() || undefined,
      phone: newCenterForm.phone.trim() || undefined,
      status: "Active",
    });

    toast.success(`Collection Center "${newCenterForm.name}" added.`);
    setNewCenterForm({
      name: "",
      village: "",
      taluka: collectionCentersFPO.taluka,
      district: collectionCentersFPO.district,
      state: collectionCentersFPO.state,
      lat: collectionCentersFPO.lat,
      lng: collectionCentersFPO.lng,
      capacityKg: 20000,
      contactPerson: "",
      phone: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "शेतकरी उत्पादक संस्था (FPO) व्यवस्थापन" : "Farmer Producer Organization (FPO) Directory"}
            </h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-mono text-xs">
              {fpos.length} {isMr ? "नोंदणीकृत एफपीओ" : "Active FPOs"}
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "एफपीओ संस्था, संकलन केंद्रे, सामायिक वाहतूक दर आणि सभासद शेतकरी थेट व्यवस्थापित करा."
              : "Register FPOs, configure village collection centers, manage service fees, and manage member farmer rosters."}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingFPO(null);
            setFpoForm({
              name: "",
              regNumber: "",
              contactPerson: "",
              phone: "",
              email: "",
              taluka: "Baramati",
              district: "Pune",
              state: "Maharashtra",
              pincode: "413115",
              lat: 18.1517,
              lng: 74.5772,
              supportedCrops: ["Tomato", "Onion", "Soybean"],
              serviceFeePaisePerQtl: 150,
              poolMinKg: 500,
              poolMaxKg: 10000,
              defaultPoolClosingDays: 3,
              status: "Active",
            });
            setIsAddFPOOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {isMr ? "+ नवीन एफपीओ नोंदणी" : "+ Register FPO"}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isMr ? "एफपीओ नाव, संपर्क व्यक्ती, तालुका किंवा जिल्ह्याने शोधा..." : "Search by FPO name, contact, district, taluka..."}
              className="pl-9 text-xs h-9"
            />
          </div>

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
        </CardContent>
      </Card>

      {/* FPOs Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFPOs.map((fpo) => {
          const memberFarmers = users.filter((u) => u.fpoId === fpo.id || fpo.memberFarmerIds.includes(u.id));

          return (
            <Card key={fpo.id} className="bg-white border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{fpo.name}</h3>
                    </div>
                    {fpo.regNumber && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Reg: {fpo.regNumber}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleStatus(fpo)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      fpo.status === "Active"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-slate-100 text-slate-600 border-slate-300"
                    }`}
                  >
                    {fpo.status}
                  </button>
                </CardHeader>

                <CardContent className="p-4 pt-1 space-y-3 text-xs text-slate-600">
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Headquarters:</span>
                      <span className="font-semibold text-slate-800">
                        {fpo.village ? `${fpo.village}, ` : ""}{fpo.taluka}, {fpo.district}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact Person:</span>
                      <span className="font-medium text-slate-800">{fpo.contactPerson}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Phone:</span>
                      <span>{fpo.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fee / Qtl:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{(fpo.serviceFeePaisePerQtl / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Supported Crops:</span>
                    <div className="flex flex-wrap gap-1">
                      {fpo.supportedCrops.map((c) => (
                        <span
                          key={c}
                          className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary counts */}
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <button
                      onClick={() => setCollectionCentersFPO(fpo)}
                      className="p-2 bg-slate-100/70 hover:bg-slate-200/60 rounded-xl border border-slate-200 transition-colors"
                    >
                      <div className="text-base font-extrabold text-slate-900">
                        {fpo.collectionCenters.length}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">Collection Hubs</div>
                    </button>

                    <button
                      onClick={() => setRosterFPO(fpo)}
                      className="p-2 bg-emerald-50/70 hover:bg-emerald-100/60 rounded-xl border border-emerald-200 transition-colors"
                    >
                      <div className="text-base font-extrabold text-emerald-800">
                        {memberFarmers.length}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Member Farmers</div>
                    </button>
                  </div>
                </CardContent>
              </div>

              <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRosterFPO(fpo)}
                  className="text-xs h-7 text-emerald-800 border-emerald-300 bg-white"
                >
                  <Users className="w-3 h-3 mr-1" /> View Roster
                </Button>

                <div className="space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingFPO(fpo);
                      setFpoForm(fpo);
                      setIsAddFPOOpen(true);
                    }}
                    className="w-7 h-7 text-slate-500 hover:text-blue-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFPO(fpo.id, fpo.name)}
                    className="w-7 h-7 text-slate-400 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ==================== ADD / EDIT FPO MODAL ==================== */}
      {isAddFPOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <h3 className="font-bold text-base text-slate-900">
                {editingFPO ? `Edit FPO: ${editingFPO.name}` : "Register New FPO Hub"}
              </h3>
              <button
                onClick={() => setIsAddFPOOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFPO} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">FPO Legal Entity Name *</label>
                <Input
                  required
                  value={fpoForm.name || ""}
                  onChange={(e) => setFpoForm({ ...fpoForm, name: e.target.value })}
                  placeholder="e.g. Baramati Krushi Producer Company Ltd."
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CIN / Registration No.</label>
                  <Input
                    value={fpoForm.regNumber || ""}
                    onChange={(e) => setFpoForm({ ...fpoForm, regNumber: e.target.value })}
                    placeholder="U01111PN2019PTC184910"
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Person *</label>
                  <Input
                    required
                    value={fpoForm.contactPerson || ""}
                    onChange={(e) => setFpoForm({ ...fpoForm, contactPerson: e.target.value })}
                    placeholder="e.g. Vikas Kadam"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                  <Input
                    required
                    value={fpoForm.phone || ""}
                    onChange={(e) => setFpoForm({ ...fpoForm, phone: e.target.value })}
                    placeholder="9422088990"
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <Input
                    type="email"
                    value={fpoForm.email || ""}
                    onChange={(e) => setFpoForm({ ...fpoForm, email: e.target.value })}
                    placeholder="contact@fpo.org"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Location Picker Bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" /> Location &amp; Base Coordinates
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="text-xs bg-white text-amber-700 border-amber-300 hover:bg-amber-50 h-7"
                  >
                    📍 Pinpoint on Map / GPS
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Taluka</label>
                    <Input
                      value={fpoForm.taluka || ""}
                      onChange={(e) => setFpoForm({ ...fpoForm, taluka: e.target.value })}
                      className="text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">District *</label>
                    <Input
                      required
                      value={fpoForm.district || ""}
                      onChange={(e) => setFpoForm({ ...fpoForm, district: e.target.value })}
                      className="text-xs h-8 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Pincode</label>
                    <Input
                      value={fpoForm.pincode || ""}
                      onChange={(e) => setFpoForm({ ...fpoForm, pincode: e.target.value })}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Fee (Paise / Quintal)</label>
                  <Input
                    type="number"
                    value={fpoForm.serviceFeePaisePerQtl || 150}
                    onChange={(e) =>
                      setFpoForm({ ...fpoForm, serviceFeePaisePerQtl: parseInt(e.target.value) || 0 })
                    }
                    className="text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">150 paise = ₹1.50 per quintal</span>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={fpoForm.status}
                    onChange={(e) => setFpoForm({ ...fpoForm, status: e.target.value as any })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Supported Crops (comma separated)
                </label>
                <Input
                  value={fpoForm.supportedCrops?.join(", ") || ""}
                  onChange={(e) =>
                    setFpoForm({
                      ...fpoForm,
                      supportedCrops: e.target.value.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
                    })
                  }
                  placeholder="Tomato, Onion, Soybean, Pomegranate"
                  className="text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddFPOOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                  {editingFPO ? "Save Changes" : "Register FPO"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== COLLECTION CENTERS MODAL ==================== */}
      {collectionCentersFPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Collection Centers: {collectionCentersFPO.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Manage aggregation centers and weighing yards in {collectionCentersFPO.district}.
                </p>
              </div>
              <button
                onClick={() => setCollectionCentersFPO(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Existing Centers List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">
                  Active Collection Hubs ({collectionCentersFPO.collectionCenters.length}):
                </h4>
                {collectionCentersFPO.collectionCenters.length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No collection centers configured yet. Add one below.
                  </p>
                ) : (
                  collectionCentersFPO.collectionCenters.map((cc) => (
                    <div
                      key={cc.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{cc.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {cc.village ? `${cc.village}, ` : ""}{cc.taluka} • Capacity: {(cc.capacityKg / 1000).toFixed(0)} MT
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          📍 {cc.lat.toFixed(4)}, {cc.lng.toFixed(4)} {cc.phone ? `• Contact: ${cc.phone}` : ""}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                        {cc.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Center Form */}
              <form onSubmit={handleAddCenter} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-emerald-900">+ Add New Collection Center</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Center Name *</label>
                    <Input
                      required
                      value={newCenterForm.name}
                      onChange={(e) => setNewCenterForm({ ...newCenterForm, name: e.target.value })}
                      placeholder="e.g. Indapur Weighing Point"
                      className="text-xs h-8 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Village / Landmark</label>
                    <Input
                      value={newCenterForm.village}
                      onChange={(e) => setNewCenterForm({ ...newCenterForm, village: e.target.value })}
                      placeholder="Bhigwan"
                      className="text-xs h-8 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Capacity (kg)</label>
                    <Input
                      type="number"
                      value={newCenterForm.capacityKg}
                      onChange={(e) =>
                        setNewCenterForm({ ...newCenterForm, capacityKg: parseInt(e.target.value) || 0 })
                      }
                      className="text-xs h-8 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Contact Person</label>
                    <Input
                      value={newCenterForm.contactPerson}
                      onChange={(e) => setNewCenterForm({ ...newCenterForm, contactPerson: e.target.value })}
                      placeholder="Supervisor"
                      className="text-xs h-8 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Phone</label>
                    <Input
                      value={newCenterForm.phone}
                      onChange={(e) => setNewCenterForm({ ...newCenterForm, phone: e.target.value })}
                      placeholder="9822345678"
                      className="text-xs h-8 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8">
                    Add Center
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MEMBER FARMERS ROSTER MODAL ==================== */}
      {rosterFPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Member Farmers Roster: {rosterFPO.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {rosterFPO.memberFarmerIds.length} farmers officially assigned to this aggregation hub.
                </p>
              </div>
              <button
                onClick={() => setRosterFPO(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Current Member List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Current Assigned Farmers:</h4>
                {users
                  .filter((u) => u.fpoId === rosterFPO.id || rosterFPO.memberFarmerIds.includes(u.id))
                  .map((farmer) => (
                    <div
                      key={farmer.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{farmer.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({farmer.id})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {farmer.village ? `${farmer.village}, ` : ""}{farmer.taluka}, {farmer.district} • {farmer.phone}
                        </div>
                        {farmer.primaryCrops && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            Crops: {farmer.primaryCrops.join(", ")}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Remove farmer "${farmer.name}" from ${rosterFPO.name}?`)) {
                            removeFarmerFromFPO(farmer.id, rosterFPO.id);
                            toast.success(`Removed farmer from roster.`);
                          }
                        }}
                        className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 h-8"
                      >
                        <UserMinus className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  ))}
              </div>

              {/* Assign New Farmer Search Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900">+ Assign Additional Farmer to this FPO</h4>
                <Input
                  value={assignFarmerSearch}
                  onChange={(e) => setAssignFarmerSearch(e.target.value)}
                  placeholder="Search registered farmers by name, phone or village..."
                  className="text-xs h-8 bg-white"
                />

                {assignFarmerSearch.trim() && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {users
                      .filter(
                        (u) =>
                          u.role === "farmer" &&
                          u.fpoId !== rosterFPO.id &&
                          !rosterFPO.memberFarmerIds.includes(u.id) &&
                          (u.name.toLowerCase().includes(assignFarmerSearch.toLowerCase()) ||
                            (u.phone && u.phone.includes(assignFarmerSearch)))
                      )
                      .map((f) => (
                        <div
                          key={f.id}
                          className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{f.name}</span>
                            <span className="text-slate-400 ml-1.5 font-mono text-[10px]">
                              ({f.phone})
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              assignFarmerToFPO(f.id, rosterFPO.id);
                              toast.success(`Assigned ${f.name} to ${rosterFPO.name}!`);
                              setAssignFarmerSearch("");
                            }}
                            className="text-[11px] h-7 bg-emerald-700 hover:bg-emerald-800 text-white"
                          >
                            <UserPlus className="w-3 h-3 mr-1" /> Assign
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Sub-modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelectLocation={handleLocationPicked}
        initialLocation={{
          village: fpoForm.village,
          taluka: fpoForm.taluka,
          district: fpoForm.district,
          state: fpoForm.state,
          pincode: fpoForm.pincode,
          lat: fpoForm.lat,
          lng: fpoForm.lng,
        }}
        language={language}
        title="Pinpoint FPO Headquarters on Map"
      />
    </div>
  );
}
