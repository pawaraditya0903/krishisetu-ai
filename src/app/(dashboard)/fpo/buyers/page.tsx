"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

interface VerifiedBuyer {
  id: string;
  name: string;
  category: "Retail Supermarket Chain" | "Agri-Processor" | "Wholesale Aggregator";
  gstin: string;
  location: string;
  reliabilityScore: number;
  paymentTerm: string;
  cropPreferences: string[];
  qualityRequirement: string;
  tradeVolumeQuintal: number;
}

const VERIFIED_BUYERS: VerifiedBuyer[] = [
  {
    id: "BUY-01",
    name: "FreshMart Foods Pvt. Ltd.",
    category: "Retail Supermarket Chain",
    gstin: "27AABCF1234F1Z8",
    location: "Hadapsar Hub, Pune",
    reliabilityScore: 98.4,
    paymentTerm: "RBI Nodal Escrow Instant Release on Acceptance",
    cropPreferences: ["Tomato (Grade A)", "Onion", "Capsicum"],
    qualityRequirement: "Strict Grade A, Breaker-to-turning ripeness, uniform crates",
    tradeVolumeQuintal: 4500,
  },
  {
    id: "BUY-02",
    name: "Sahyadri Fresh Direct",
    category: "Agri-Processor",
    gstin: "27AALCS9821K1ZP",
    location: "Daund Processing Unit, Pune",
    reliabilityScore: 95.8,
    paymentTerm: "Digital Delivery Acceptance within 12h",
    cropPreferences: ["Tomato (Grade A/B for Puree)", "Pomegranate"],
    qualityRequirement: "Grade A or B accepted with transparent Brix/ripeness grading",
    tradeVolumeQuintal: 12000,
  },
  {
    id: "BUY-03",
    name: "MahaKisan Wholesale Aggregators",
    category: "Wholesale Aggregator",
    gstin: "27AAECK5543D1ZT",
    location: "Vashi Navi Mumbai Yard",
    reliabilityScore: 92.1,
    paymentTerm: "Partner Regulated Bank Transfer",
    cropPreferences: ["Tomato", "Potato", "Green Chilli"],
    qualityRequirement: "Bulk crates, minimum 20 quintal lots",
    tradeVolumeQuintal: 28000,
  },
];

export default function FPOBuyersDirectoryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verified B2B Buyers Directory</h1>
          <p className="text-slate-500 text-sm">
            Partnered institutional procurers, food retailers, and processing units with pre-verified payment records.
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300 w-fit">
          <ShieldCheck className="w-4 h-4 mr-1.5 text-green-600" /> All Buyers KYC &amp; GSTIN Verified
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {VERIFIED_BUYERS.map((buyer) => (
          <Card key={buyer.id} className="border-slate-200 shadow-sm flex flex-col justify-between hover:border-green-300 transition-all">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <Badge variant="secondary" className="text-[10px] font-semibold mb-1">
                    {buyer.category}
                  </Badge>
                  <CardTitle className="text-lg font-bold text-slate-900">{buyer.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {buyer.reliabilityScore}%
                </div>
              </div>
              <CardDescription className="text-xs flex items-center gap-1 mt-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5" /> {buyer.location}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 font-medium">GSTIN:</span>
                <span className="ml-1.5 font-mono font-semibold text-slate-800">{buyer.gstin}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Quality Requirement:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{buyer.qualityRequirement}</p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Payment Settlement Term:</span>
                <p className="text-green-700 font-semibold mt-0.5">{buyer.paymentTerm}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">Target Commodities:</span>
                <div className="flex flex-wrap gap-1">
                  {buyer.cropPreferences.map((crop, idx) => (
                    <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 text-[10px]">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded text-[11px] text-slate-600 flex justify-between">
                <span>Verified Historical Volume:</span>
                <strong className="text-slate-900">{buyer.tradeVolumeQuintal.toLocaleString()} Quintals</strong>
              </div>
            </CardContent>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => toast.info(`Procurement Desk details for ${buyer.name}: +91 20 2426 8900`)}
              >
                <Phone className="w-3.5 h-3.5 mr-1" /> Contact
              </Button>
              <Button
                size="sm"
                className="w-full bg-green-700 hover:bg-green-800 text-xs"
                onClick={() => toast.success(`Direct bulk quote sent to ${buyer.name}`)}
              >
                Send Direct Quote
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
