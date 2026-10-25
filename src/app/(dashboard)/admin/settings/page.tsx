"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { PlatformSettings } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sliders,
  CheckCircle2,
  MapPin,
  IndianRupee,
  Clock,
  Mic,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDiscoverySettingsPage() {
  const { platformSettings, updatePlatformSettings, language } = useAppStore();
  const isMr = language === "mr";

  const [form, setForm] = useState<PlatformSettings>({ ...platformSettings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings(form);
    toast.success("Market Discovery & Platform Parameters updated successfully!");
  };

  const handleResetDefaults = () => {
    if (confirm("Reset settings to factory defaults?")) {
      const defaults: PlatformSettings = {
        defaultSearchRadiusKm: 100,
        minRadiusKm: 25,
        maxRadiusKm: 1000,
        radiusExpansionSteps: [25, 50, 100, 200, 300, 500, 1000],
        maxFarmerSelectableRadiusKm: 1000,
        allowFarmerCustomRadius: true,
        searchOnlyActiveMandis: true,
        searchOnlyWithLatestPrice: false,
        priceFreshnessThresholdHours: 24,
        stalePriceThresholdHours: 72,
        showMarketsWithoutLatestPrice: true,
        defaultCrop: "Tomato",
        defaultTransportCostPerKm: 2.2,
        defaultHandlingCostPaise: 15,
        defaultPackagingCostPaise: 35,
        defaultCommissionPct: 0,
        defaultExpectedSpoilagePct: 1.5,
        voiceAssistantModel: "gemini-2.5-flash",
        voiceAssistantSpeed: 1.0,
        enableLiveAgmarknetFeed: true,
      };
      setForm(defaults);
      updatePlatformSettings(defaults);
      toast.success("Settings reset to defaults.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "बाजार शोध आणि प्लॅटफॉर्म सेटिंग्ज" : "Market Discovery & Platform Parameter Settings"}
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
              Live Config
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "शोध त्रिज्या (२५ ते १००० किमी), वाहतूक व हाताळणी वजावटी, दर ताजेपणा आणि व्हॉईस असिस्टंट मॉडेल नियंत्रित करा."
              : "Fine-tune discovery radius bounds (up to 1000 km), Net Realization deduction engines, freshness thresholds, and AI models."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} className="text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Save Configuration
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Discovery Radius Bounds */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              1. Geographic Discovery &amp; Search Radius Controls
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Configure baseline and maximum search distances across India.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Default Search Radius (km)
                </label>
                <Input
                  type="number"
                  value={form.defaultSearchRadiusKm}
                  onChange={(e) =>
                    setForm({ ...form, defaultSearchRadiusKm: parseInt(e.target.value) || 50 })
                  }
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Default radius when farmer loads market</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Minimum Radius (km)
                </label>
                <Input
                  type="number"
                  value={form.minRadiusKm}
                  onChange={(e) =>
                    setForm({ ...form, minRadiusKm: parseInt(e.target.value) || 25 })
                  }
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Maximum Allowable Radius (km)
                </label>
                <Input
                  type="number"
                  value={form.maxRadiusKm}
                  onChange={(e) =>
                    setForm({ ...form, maxRadiusKm: parseInt(e.target.value) || 1000 })
                  }
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Supports up to 1000 km pan-India search</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.allowFarmerCustomRadius}
                  onChange={(e) => setForm({ ...form, allowFarmerCustomRadius: e.target.checked })}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span>Allow Farmers to use Custom Range Slider on /farmer/market</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Net Realization Deductions Engine */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              2. Net Realization Engine &amp; Post-Harvest Cost Deductions
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Formula: Net Price = Mandi Rate - (Freight + Handling + Packaging + Commission + Spoilage)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Base Freight Rate (₹ / km)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.defaultTransportCostPerKm}
                  onChange={(e) =>
                    setForm({ ...form, defaultTransportCostPerKm: parseFloat(e.target.value) || 2.2 })
                  }
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Handling Cost (Paise / kg)
                </label>
                <Input
                  type="number"
                  value={form.defaultHandlingCostPaise}
                  onChange={(e) =>
                    setForm({ ...form, defaultHandlingCostPaise: parseInt(e.target.value) || 15 })
                  }
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">15 paise = ₹0.15/kg</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Packaging Cost (Paise / kg)
                </label>
                <Input
                  type="number"
                  value={form.defaultPackagingCostPaise}
                  onChange={(e) =>
                    setForm({ ...form, defaultPackagingCostPaise: parseInt(e.target.value) || 35 })
                  }
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">35 paise = ₹0.35/kg</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  APMC Commission (%)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={form.defaultCommissionPct}
                  onChange={(e) =>
                    setForm({ ...form, defaultCommissionPct: parseFloat(e.target.value) || 0 })
                  }
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">0% for direct farm-gate &amp; FPO trade</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Expected Transit Spoilage (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.defaultExpectedSpoilagePct}
                  onChange={(e) =>
                    setForm({ ...form, defaultExpectedSpoilagePct: parseFloat(e.target.value) || 1.5 })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Data Freshness & Feeds */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              3. Mandi Data Freshness &amp; Official Feed Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Freshness Threshold (Hours)
                </label>
                <Input
                  type="number"
                  value={form.priceFreshnessThresholdHours}
                  onChange={(e) =>
                    setForm({ ...form, priceFreshnessThresholdHours: parseInt(e.target.value) || 24 })
                  }
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Reports within this window receive "Fresh (Today)" badge</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Stale Warning Threshold (Hours)
                </label>
                <Input
                  type="number"
                  value={form.stalePriceThresholdHours}
                  onChange={(e) =>
                    setForm({ ...form, stalePriceThresholdHours: parseInt(e.target.value) || 72 })
                  }
                  className="font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Reports older than this trigger a verification disclaimer</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.searchOnlyActiveMandis}
                  onChange={(e) => setForm({ ...form, searchOnlyActiveMandis: e.target.checked })}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span>Only include Mandis marked as "Active" in distance calculations</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.enableLiveAgmarknetFeed}
                  onChange={(e) => setForm({ ...form, enableLiveAgmarknetFeed: e.target.checked })}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span>Enable Live Agmarknet / MSAMB Data Feed Polling</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Voice Assistant & AI Models */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-700" />
              4. Voice Assistant &amp; Gemini AI Model Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  AI Model Architecture
                </label>
                <select
                  value={form.voiceAssistantModel}
                  onChange={(e) => setForm({ ...form, voiceAssistantModel: e.target.value })}
                  className="w-full h-9 text-xs px-3 rounded-md border border-slate-200 bg-white"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Trilingual Marathi/Hindi/English)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="indic-nlu-local">Local Indic NLU Engine (Offline Fallback)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Speech Synthesizer Speed (x)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.voiceAssistantSpeed}
                  onChange={(e) =>
                    setForm({ ...form, voiceAssistantSpeed: parseFloat(e.target.value) || 1.0 })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Changes persist immediately to local storage and sync with portal discovery engine.</span>
          </div>
          <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
