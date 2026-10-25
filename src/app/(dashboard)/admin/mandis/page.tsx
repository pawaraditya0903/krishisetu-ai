"use client";

import React, { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { MandiMaster } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Store,
  Search,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  ExternalLink,
  Phone,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import LocationPickerModal, { SelectedLocationData } from "@/components/location/LocationPickerModal";

export default function AdminMandisPage() {
  const {
    mandisMaster,
    addMandi,
    updateMandi,
    setMandiStatus,
    deleteMandi,
    bulkImportMandis,
    cropsCatalog,
    language,
  } = useAppStore();

  const isMr = language === "mr";

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMandi, setEditingMandi] = useState<MandiMaster | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Form state for Add/Edit Mandi
  const [mandiForm, setMandiForm] = useState<Partial<MandiMaster>>({
    mandi: "",
    marketCode: "",
    village: "",
    taluka: "",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411037",
    lat: 18.4975,
    lng: 73.8643,
    supportedCrops: ["Tomato", "Onion", "Potato"],
    dataSource: "Manual Admin",
    status: "Active",
    phone: "",
    contactPerson: "",
  });

  // Bulk Import state
  const [csvText, setCsvText] = useState("");
  const [importPreview, setImportPreview] = useState<Array<Partial<MandiMaster> & { error?: string; action: "Add" | "Update" | "Skip" }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Mandis
  const filteredMandis = mandisMaster.filter((m) => {
    const matchesSearch =
      m.mandi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.marketCode && m.marketCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.supportedCrops.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = stateFilter === "all" || m.state === stateFilter;
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesState && matchesStatus;
  });

  const uniqueStates = Array.from(new Set(mandisMaster.map((m) => m.state)));

  // Location Picker selection
  const handleLocationPicked = (loc: SelectedLocationData) => {
    setMandiForm((prev) => ({
      ...prev,
      village: loc.village || prev.village,
      taluka: loc.taluka || prev.taluka,
      district: loc.district,
      state: loc.state,
      pincode: loc.pincode || prev.pincode,
      lat: loc.lat,
      lng: loc.lng,
    }));
    toast.success(`Coordinates captured: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
  };

  // Submit Add / Edit Mandi
  const handleSaveMandi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandiForm.mandi?.trim() || !mandiForm.district?.trim()) {
      toast.error("Mandi Name and District are required.");
      return;
    }
    if (
      mandiForm.lat === undefined ||
      mandiForm.lng === undefined ||
      mandiForm.lat < -90 ||
      mandiForm.lat > 90 ||
      mandiForm.lng < -180 ||
      mandiForm.lng > 180
    ) {
      toast.error("Valid geographic coordinates (lat -90 to 90, lng -180 to 180) are required.");
      return;
    }

    if (editingMandi) {
      updateMandi(editingMandi.id, mandiForm);
      toast.success(`Mandi "${mandiForm.mandi}" updated successfully.`);
      setEditingMandi(null);
    } else {
      // Check duplicate
      const cleanName = mandiForm.mandi.trim().toLowerCase();
      if (mandisMaster.some((m) => m.mandi.toLowerCase().trim() === cleanName)) {
        toast.error("A Mandi with this name already exists in the registry.");
        return;
      }

      const newMandi = addMandi({
        mandi: mandiForm.mandi.trim(),
        marketCode: mandiForm.marketCode?.trim() || `MKT-${Date.now().toString().slice(-4)}`,
        village: mandiForm.village?.trim() || undefined,
        taluka: mandiForm.taluka?.trim() || undefined,
        district: mandiForm.district.trim(),
        state: mandiForm.state?.trim() || "Maharashtra",
        pincode: mandiForm.pincode?.trim() || undefined,
        lat: mandiForm.lat,
        lng: mandiForm.lng,
        supportedCrops: mandiForm.supportedCrops || ["Tomato", "Onion"],
        dataSource: mandiForm.dataSource || "Manual Admin",
        status: mandiForm.status || "Active",
        contactPerson: mandiForm.contactPerson?.trim() || undefined,
        phone: mandiForm.phone?.trim() || undefined,
        lastSyncAt: new Date().toISOString(),
      });

      toast.success(`Mandi "${newMandi.mandi}" created with ID ${newMandi.id}!`);
      setIsAddModalOpen(false);
    }
  };

  // Status toggle
  const handleToggleStatus = (mandi: MandiMaster) => {
    const nextStatus: MandiMaster["status"] =
      mandi.status === "Active" ? "Inactive" : mandi.status === "Inactive" ? "Active" : "Active";
    setMandiStatus(mandi.id, nextStatus);
    toast.success(`Mandi ${mandi.mandi} status set to ${nextStatus}`);
  };

  // Delete Mandi
  const handleDeleteMandi = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the Mandi registry?`)) {
      deleteMandi(id);
      toast.success(`Mandi "${name}" removed.`);
    }
  };

  // Parse CSV Content
  const handleParseCSV = (rawText: string) => {
    setCsvText(rawText);
    const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      setImportPreview([]);
      return;
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const mandiIdx = header.indexOf("mandi");
    const codeIdx = header.indexOf("marketcode");
    const distIdx = header.indexOf("district");
    const stateIdx = header.indexOf("state");
    const pinIdx = header.indexOf("pincode");
    const latIdx = header.indexOf("lat");
    const lngIdx = header.indexOf("lng");
    const cropsIdx = header.indexOf("crops");
    const sourceIdx = header.indexOf("source");

    if (mandiIdx === -1 || latIdx === -1 || lngIdx === -1) {
      toast.error("CSV must contain 'mandi', 'lat', and 'lng' column headers.");
      return;
    }

    const parsed: Array<Partial<MandiMaster> & { error?: string; action: "Add" | "Update" | "Skip" }> = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts.length < 3) continue;

      const mandiName = parts[mandiIdx] || "";
      const latVal = parseFloat(parts[latIdx]);
      const lngVal = parseFloat(parts[lngIdx]);
      const marketCode = codeIdx >= 0 ? parts[codeIdx] : undefined;
      const district = distIdx >= 0 ? parts[distIdx] : "Maharashtra";
      const state = stateIdx >= 0 ? parts[stateIdx] : "Maharashtra";
      const pincode = pinIdx >= 0 ? parts[pinIdx] : undefined;
      const cropsStr = cropsIdx >= 0 ? parts[cropsIdx] : "Tomato;Onion";
      const crops = cropsStr.split(";").map((c) => c.trim()).filter((c) => c.length > 0);
      const source = (sourceIdx >= 0 ? parts[sourceIdx] : "Manual Admin") as MandiMaster["dataSource"];

      let error: string | undefined = undefined;
      let action: "Add" | "Update" | "Skip" = "Add";

      if (!mandiName) {
        error = "Missing Mandi name";
        action = "Skip";
      } else if (isNaN(latVal) || isNaN(lngVal) || latVal < -90 || latVal > 90 || lngVal < -180 || lngVal > 180) {
        error = "Invalid coordinates";
        action = "Skip";
      } else {
        const clean = mandiName.toLowerCase();
        const existing = mandisMaster.find(
          (m) =>
            m.mandi.toLowerCase().trim() === clean ||
            (marketCode && m.marketCode && m.marketCode.toLowerCase() === marketCode.toLowerCase())
        );
        if (existing) {
          action = "Update";
        }
      }

      parsed.push({
        mandi: mandiName,
        marketCode,
        district,
        state,
        pincode,
        lat: latVal,
        lng: lngVal,
        supportedCrops: crops,
        dataSource: source || "Manual Admin",
        status: "Active",
        error,
        action,
      });
    }

    setImportPreview(parsed);
    toast.success(`Parsed ${parsed.length} rows from CSV`);
  };

  // Confirm Bulk Import
  const handleConfirmImport = () => {
    const validRows = importPreview.filter((r) => r.action !== "Skip");
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    const result = bulkImportMandis(validRows);
    toast.success(
      `Bulk Import Complete: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`
    );
    setIsBulkImportOpen(false);
    setImportPreview([]);
    setCsvText("");
  };

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const templateContent =
      `mandi,marketCode,district,state,pincode,lat,lng,crops,source\n` +
      `"Parbhani APMC","MH-PBN-001","Parbhani","Maharashtra","431401",19.2608,76.7748,"Soybean;Cotton;Wheat","Agmarknet (Govt of India)"\n` +
      `"Lasalgaon APMC","MH-NSK-003","Nashik","Maharashtra","422306",20.1464,74.2289,"Onion;Tomato;Soybean","Agmarknet (Govt of India)"\n` +
      `"Indore Krishi Mandi","MP-IND-001","Indore","Madhya Pradesh","452001",22.7196,75.8577,"Soybean;Wheat;Gram","e-NAM"\n` +
      `"Delhi Azadpur Mandi","DL-DEL-001","North Delhi","Delhi","110033",28.7126,77.1751,"Tomato;Onion;Potato;Apple","Agmarknet (Govt of India)"\n`;

    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "MANDI_IMPORT_TEMPLATE.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded MANDI_IMPORT_TEMPLATE.csv");
  };

  // Export Mandis to CSV
  const handleExportMandis = () => {
    const headers = [
      "ID",
      "Mandi",
      "MarketCode",
      "District",
      "State",
      "Pincode",
      "Lat",
      "Lng",
      "SupportedCrops",
      "DataSource",
      "Status",
      "LastSyncAt",
    ];

    const rows = mandisMaster.map((m) => [
      m.id,
      `"${m.mandi}"`,
      m.marketCode || "",
      `"${m.district}"`,
      `"${m.state}"`,
      m.pincode || "",
      m.lat,
      m.lng,
      `"${m.supportedCrops.join(";")}"`,
      `"${m.dataSource}"`,
      m.status,
      m.lastSyncAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `krishisetu_mandis_master_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${mandisMaster.length} mandis to CSV.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "अखिल भारतीय बाजार समिती (मंडी) मास्टर" : "National APMC Mandi Master Registry"}
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 font-mono text-xs">
              {mandisMaster.length} {isMr ? "नोंदणीकृत मंड्या" : "Mandis Master"}
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "संपूर्ण भारतातील कृषी बाजार समित्या जोडा, संपादित करा किंवा CSV द्वारे आयात करा."
              : "Manage and expand APMC mandis nationwide with GPS geocoding and bulk CSV import."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1 text-slate-600" /> CSV Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMandis} className="text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            className="text-xs border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100"
          >
            <Upload className="w-3.5 h-3.5 mr-1" /> Bulk CSV Import
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingMandi(null);
              setMandiForm({
                mandi: "",
                marketCode: "",
                district: "Pune",
                state: "Maharashtra",
                pincode: "411037",
                lat: 18.4975,
                lng: 73.8643,
                supportedCrops: ["Tomato", "Onion", "Potato"],
                dataSource: "Manual Admin",
                status: "Active",
              });
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {isMr ? "+ नवीन मंडी जोडा" : "+ Add Mandi"}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isMr ? "मंडीचे नाव, जिल्हा, कोड किंवा पिकाने शोधा..." : "Search by mandi name, district, market code, crop..."}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="h-9 text-xs px-3 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 text-xs px-3 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Mandis Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Mandi Name</th>
                <th className="p-3.5">Market Code</th>
                <th className="p-3.5">District &amp; State</th>
                <th className="p-3.5">GPS Coordinates</th>
                <th className="p-3.5">Supported Commodities</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMandis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No mandis found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredMandis.map((mandi) => (
                  <tr key={mandi.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{mandi.mandi}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {mandi.id}</div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600">
                      {mandi.marketCode || "—"}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{mandi.district}</div>
                      <div className="text-[10px] text-slate-500">{mandi.state} {mandi.pincode ? `• ${mandi.pincode}` : ""}</div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        📍 {mandi.lat.toFixed(4)}, {mandi.lng.toFixed(4)}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {mandi.supportedCrops.slice(0, 3).map((crop) => (
                          <span
                            key={crop}
                            className="bg-emerald-50 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded border border-emerald-200 font-medium"
                          >
                            {crop}
                          </span>
                        ))}
                        {mandi.supportedCrops.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{mandi.supportedCrops.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] bg-slate-50 font-normal">
                        {mandi.dataSource}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(mandi)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                          mandi.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : mandi.status === "Inactive"
                            ? "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                            : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                        }`}
                      >
                        {mandi.status}
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingMandi(mandi);
                          setMandiForm(mandi);
                          setIsAddModalOpen(true);
                        }}
                        title="Edit Mandi"
                        className="w-7 h-7 text-slate-500 hover:text-blue-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMandi(mandi.id, mandi.mandi)}
                        title="Delete Mandi"
                        className="w-7 h-7 text-slate-400 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ==================== ADD / EDIT MANDI MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingMandi ? `Edit Mandi: ${editingMandi.mandi}` : "Add New Mandi to Master Registry"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMandi} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mandi Name *</label>
                  <Input
                    required
                    value={mandiForm.mandi || ""}
                    onChange={(e) => setMandiForm({ ...mandiForm, mandi: e.target.value })}
                    placeholder="e.g. Parbhani APMC"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Market Code</label>
                  <Input
                    value={mandiForm.marketCode || ""}
                    onChange={(e) => setMandiForm({ ...mandiForm, marketCode: e.target.value })}
                    placeholder="e.g. MH-PBN-001"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Location Picker Quick Bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Coordinates &amp; Location
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-7"
                  >
                    📍 Pinpoint on Map / GPS
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">District *</label>
                    <Input
                      required
                      value={mandiForm.district || ""}
                      onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
                      placeholder="Parbhani"
                      className="text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">State *</label>
                    <Input
                      required
                      value={mandiForm.state || ""}
                      onChange={(e) => setMandiForm({ ...mandiForm, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Lat *</label>
                    <Input
                      type="number"
                      step="0.0001"
                      required
                      value={mandiForm.lat ?? 0}
                      onChange={(e) => setMandiForm({ ...mandiForm, lat: parseFloat(e.target.value) || 0 })}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Lng *</label>
                    <Input
                      type="number"
                      step="0.0001"
                      required
                      value={mandiForm.lng ?? 0}
                      onChange={(e) => setMandiForm({ ...mandiForm, lng: parseFloat(e.target.value) || 0 })}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Data Source</label>
                  <select
                    value={mandiForm.dataSource}
                    onChange={(e) => setMandiForm({ ...mandiForm, dataSource: e.target.value as any })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Agmarknet (Govt of India)">Agmarknet (Govt of India)</option>
                    <option value="MSAMB">MSAMB</option>
                    <option value="e-NAM">e-NAM</option>
                    <option value="APMC Direct">APMC Direct</option>
                    <option value="Manual Admin">Manual Admin</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={mandiForm.status}
                    onChange={(e) => setMandiForm({ ...mandiForm, status: e.target.value as any })}
                    className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Supported Commodities (comma separated)
                </label>
                <Input
                  value={mandiForm.supportedCrops?.join(", ") || ""}
                  onChange={(e) =>
                    setMandiForm({
                      ...mandiForm,
                      supportedCrops: e.target.value.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
                    })
                  }
                  placeholder="Tomato, Onion, Potato, Soybean"
                  className="text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  {editingMandi ? "Save Changes" : "Create Mandi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== BULK CSV IMPORT MODAL ==================== */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Bulk Mandi Import from CSV</h3>
                  <p className="text-xs text-slate-500">
                    Import multiple APMC mandis nationwide with coordinate validation and duplicate detection.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkImportOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* File upload trigger */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="font-semibold text-slate-800">Select CSV file from device:</div>
                  <div className="text-[11px] text-slate-500">Supports comma-separated UTF-8 CSVs.</div>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        handleParseCSV(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-white border-blue-300 text-blue-800"
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Browse File
                </Button>
              </div>

              {/* Text Area for pasting */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Or paste CSV text directly:
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => handleParseCSV(e.target.value)}
                  placeholder={`mandi,marketCode,district,state,pincode,lat,lng,crops,source\n"Nashik APMC","MH-NSK-001","Nashik","Maharashtra","422003",19.9975,73.7898,"Tomato;Onion","Agmarknet"`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preview Table */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Parsed Rows Preview ({importPreview.length}):</span>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-emerald-700 font-bold">
                        {importPreview.filter((r) => r.action === "Add").length} New
                      </span>
                      <span className="text-blue-700 font-bold">
                        {importPreview.filter((r) => r.action === "Update").length} Updates
                      </span>
                      <span className="text-red-600 font-bold">
                        {importPreview.filter((r) => r.action === "Skip").length} Errors
                      </span>
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <tr>
                          <th className="p-2">Action</th>
                          <th className="p-2">Mandi</th>
                          <th className="p-2">District</th>
                          <th className="p-2">Lat, Lng</th>
                          <th className="p-2">Error / Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.map((row, idx) => (
                          <tr key={idx} className={row.error ? "bg-red-50/50" : ""}>
                            <td className="p-2">
                              <Badge
                                variant="outline"
                                className={`text-[9px] py-0 ${
                                  row.action === "Add"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : row.action === "Update"
                                    ? "bg-blue-50 text-blue-800 border-blue-300"
                                    : "bg-red-50 text-red-800 border-red-300"
                                }`}
                              >
                                {row.action}
                              </Badge>
                            </td>
                            <td className="p-2 font-semibold text-slate-900">{row.mandi}</td>
                            <td className="p-2">{row.district}, {row.state}</td>
                            <td className="p-2 font-mono">
                              {row.lat ? `${row.lat.toFixed(2)}, ${row.lng?.toFixed(2)}` : "—"}
                            </td>
                            <td className="p-2 text-red-600 font-medium">
                              {row.error || "Valid record"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setIsBulkImportOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmImport}
                disabled={importPreview.filter((r) => r.action !== "Skip").length === 0}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Confirm &amp; Import Mandis
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelectLocation={handleLocationPicked}
        initialLocation={{
          district: mandiForm.district,
          state: mandiForm.state,
          lat: mandiForm.lat,
          lng: mandiForm.lng,
        }}
        language={language}
        title="Pinpoint Mandi Coordinates on Map"
      />
    </div>
  );
}
