"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Transporter, FleetVehicle } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  X,
  ThermometerSnowflake,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminLogisticsPage() {
  const { transporters, addTransporter, updateTransporter, addVehicle, updateVehicleStatus, language } = useAppStore();
  const isMr = language === "mr";

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddTransporterOpen, setIsAddTransporterOpen] = useState(false);
  const [activeTransporterForFleet, setActiveTransporterForFleet] = useState<Transporter | null>(null);

  // Form State for Transporter
  const [transporterForm, setTransporterForm] = useState<Partial<Transporter>>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    baseLocation: "Baramati, Pune",
    baseLat: 18.1517,
    baseLng: 74.5772,
    serviceDistricts: ["Pune", "Solapur", "Satara"],
    costPerKmInr: 2.2,
    status: "Active",
  });

  // Form State for Add Vehicle
  const [vehicleForm, setVehicleForm] = useState<Partial<FleetVehicle>>({
    regNumber: "",
    vehicleType: "Pickup Tempo",
    capacityKg: 1500,
    isRefrigerated: false,
    driverName: "",
    driverPhone: "",
    status: "Available",
  });

  const filteredTransporters = transporters.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.baseLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submit Add Transporter
  const handleSaveTransporter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transporterForm.name?.trim() || !transporterForm.phone?.trim()) {
      toast.error("Company Name and Phone are required.");
      return;
    }

    const created = addTransporter({
      name: transporterForm.name.trim(),
      contactPerson: transporterForm.contactPerson?.trim() || "Logistics Dispatcher",
      phone: transporterForm.phone.trim(),
      email: transporterForm.email?.trim() || undefined,
      baseLocation: transporterForm.baseLocation?.trim() || "Maharashtra",
      baseLat: transporterForm.baseLat || 18.5204,
      baseLng: transporterForm.baseLng || 73.8567,
      serviceDistricts: transporterForm.serviceDistricts || ["Pune"],
      costPerKmInr: Number(transporterForm.costPerKmInr) || 2.2,
      vehicles: [],
      status: "Active",
    });

    toast.success(`Transporter "${created.name}" registered successfully!`);
    setIsAddTransporterOpen(false);
  };

  // Submit Add Vehicle
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransporterForFleet || !vehicleForm.regNumber?.trim()) return;

    addVehicle(activeTransporterForFleet.id, {
      regNumber: vehicleForm.regNumber.trim().toUpperCase(),
      vehicleType: vehicleForm.vehicleType || "Pickup Tempo",
      capacityKg: Number(vehicleForm.capacityKg) || 2000,
      isRefrigerated: !!vehicleForm.isRefrigerated,
      driverName: vehicleForm.driverName?.trim() || undefined,
      driverPhone: vehicleForm.driverPhone?.trim() || undefined,
      status: vehicleForm.status || "Available",
    });

    toast.success(`Vehicle "${vehicleForm.regNumber}" added to fleet!`);
    setVehicleForm({
      regNumber: "",
      vehicleType: "Pickup Tempo",
      capacityKg: 1500,
      isRefrigerated: false,
      driverName: "",
      driverPhone: "",
      status: "Available",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "वाहतूकदार आणि कृषी वाहन ताफा" : "Logistics & Agricultural Fleet Directory"}
            </h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300 font-mono text-xs">
              {transporters.length} Transporters • {transporters.reduce((acc, t) => acc + t.vehicles.length, 0)} Vehicles
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "सामायिक पूल वाहतूकदार, वाहन क्षमता, ड्रायव्हर संपर्क आणि प्रति किमी दर व्यवस्थापित करा."
              : "Manage verified transporters, fleet capacities, reefer trucks, driver assignments, and per-km freight tariffs."}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setTransporterForm({
              name: "",
              contactPerson: "",
              phone: "",
              baseLocation: "Baramati, Pune",
              costPerKmInr: 2.2,
              serviceDistricts: ["Pune", "Solapur"],
              status: "Active",
            });
            setIsAddTransporterOpen(true);
          }}
          className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-md"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {isMr ? "+ नवीन वाहतूकदार जोडा" : "+ Register Transporter"}
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name, contact person, or base location..."
              className="pl-9 text-xs h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transporters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTransporters.map((tr) => (
          <Card key={tr.id} className="bg-white border-slate-200 shadow-xs hover:border-purple-400 transition-all flex flex-col justify-between">
            <div>
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>{tr.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{tr.baseLocation}</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-800 border-purple-200">
                  ₹{tr.costPerKmInr}/km
                </Badge>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-2 text-xs text-slate-600">
                <div className="bg-slate-50 p-2 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact:</span>
                    <span className="font-semibold text-slate-800">{tr.contactPerson}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Phone:</span>
                    <span>{tr.phone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Service Districts:</span>
                  <div className="flex flex-wrap gap-1">
                    {tr.serviceDistricts.map((d) => (
                      <span key={d} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Vehicles in Fleet ({tr.vehicles.length}):
                  </span>
                  <div className="space-y-1">
                    {tr.vehicles.slice(0, 2).map((v) => (
                      <div key={v.id} className="p-1.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-slate-800">{v.regNumber}</span>
                        <div className="flex items-center gap-1">
                          {v.isRefrigerated && <ThermometerSnowflake className="w-3 h-3 text-cyan-600" />}
                          <span className="text-slate-500">{v.vehicleType}</span>
                        </div>
                      </div>
                    ))}
                    {tr.vehicles.length > 2 && (
                      <div className="text-[10px] text-slate-400 italic">
                        +{tr.vehicles.length - 2} more vehicles
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTransporterForFleet(tr)}
                className="text-xs h-7 text-purple-800 border-purple-300 bg-white"
              >
                <Truck className="w-3 h-3 mr-1" /> Manage Fleet ({tr.vehicles.length})
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ==================== ADD TRANSPORTER MODAL ==================== */}
      {isAddTransporterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50">
              <h3 className="font-bold text-base text-slate-900">Register Transporter</h3>
              <button
                onClick={() => setIsAddTransporterOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransporter} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Transporter Name *</label>
                <Input
                  required
                  value={transporterForm.name || ""}
                  onChange={(e) => setTransporterForm({ ...transporterForm, name: e.target.value })}
                  placeholder="e.g. Kisan Express Logistics"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Person *</label>
                  <Input
                    required
                    value={transporterForm.contactPerson || ""}
                    onChange={(e) => setTransporterForm({ ...transporterForm, contactPerson: e.target.value })}
                    placeholder="e.g. Santosh Kadam"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone *</label>
                  <Input
                    required
                    value={transporterForm.phone || ""}
                    onChange={(e) => setTransporterForm({ ...transporterForm, phone: e.target.value })}
                    placeholder="9822398765"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Location</label>
                  <Input
                    value={transporterForm.baseLocation || ""}
                    onChange={(e) => setTransporterForm({ ...transporterForm, baseLocation: e.target.value })}
                    placeholder="Baramati, Pune"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Freight Rate (₹ / km)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={transporterForm.costPerKmInr || 2.2}
                    onChange={(e) =>
                      setTransporterForm({ ...transporterForm, costPerKmInr: parseFloat(e.target.value) || 2.2 })
                    }
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Districts (comma separated)</label>
                <Input
                  value={transporterForm.serviceDistricts?.join(", ") || ""}
                  onChange={(e) =>
                    setTransporterForm({
                      ...transporterForm,
                      serviceDistricts: e.target.value.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
                    })
                  }
                  placeholder="Pune, Solapur, Satara, Ahmednagar"
                  className="text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTransporterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white">
                  Register Transporter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== FLEET VEHICLES MODAL ==================== */}
      {activeTransporterForFleet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Fleet Management: {activeTransporterForFleet.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Manage registered transport vehicles, capacities, and driver details.
                </p>
              </div>
              <button
                onClick={() => setActiveTransporterForFleet(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Existing Vehicles */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">
                  Registered Vehicles ({activeTransporterForFleet.vehicles.length}):
                </h4>
                {activeTransporterForFleet.vehicles.length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No vehicles registered yet. Add one below.
                  </p>
                ) : (
                  activeTransporterForFleet.vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="font-mono">{v.regNumber}</span>
                          <Badge variant="outline" className="text-[10px]">{v.vehicleType}</Badge>
                          {v.isRefrigerated && (
                            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300 text-[10px]">
                              Reefer Cold Chain
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Payload Capacity: {(v.capacityKg / 1000).toFixed(1)} MT ({v.capacityKg} kg)
                          {v.driverName ? ` • Driver: ${v.driverName} (${v.driverPhone})` : ""}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          v.status === "Available"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        {v.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              {/* Add Vehicle Form */}
              <form onSubmit={handleAddVehicle} className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-purple-900">+ Add Vehicle to Fleet</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Reg Number *</label>
                    <Input
                      required
                      value={vehicleForm.regNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, regNumber: e.target.value })}
                      placeholder="MH-12-AB-1234"
                      className="text-xs h-8 bg-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Vehicle Type</label>
                    <select
                      value={vehicleForm.vehicleType}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value as any })}
                      className="w-full h-8 text-xs px-2 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="Pickup Tempo">Pickup Tempo (1.5 MT)</option>
                      <option value="Mini Truck (14ft)">Mini Truck 14ft (3.5 MT)</option>
                      <option value="Eicher 17ft">Eicher 17ft (7 MT)</option>
                      <option value="Reefer Truck">Reefer Truck (Cold Chain)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Payload Capacity (kg)</label>
                    <Input
                      type="number"
                      value={vehicleForm.capacityKg}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, capacityKg: parseInt(e.target.value) || 0 })}
                      className="text-xs h-8 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Driver Name</label>
                    <Input
                      value={vehicleForm.driverName}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                      placeholder="Driver Name"
                      className="text-xs h-8 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block">Driver Mobile</label>
                    <Input
                      value={vehicleForm.driverPhone}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                      placeholder="9822000000"
                      className="text-xs h-8 bg-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={vehicleForm.isRefrigerated}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, isRefrigerated: e.target.checked })}
                        className="accent-purple-600"
                      />
                      <span>Refrigerated</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white text-xs h-8">
                    Add Vehicle
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
