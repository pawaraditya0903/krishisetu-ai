"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface BuyerRFQ {
  id: string;
  crop: string;
  variety: string;
  gradeRequired: string;
  quantityQuintal: number;
  maxPricePerQtl: number;
  deliveryHub: string;
  status: "Active RFQ" | "Matched with Pool" | "In Delivery" | "Fulfilled";
  createdAt: string;
  validTill: string;
}

const INITIAL_RFQS: BuyerRFQ[] = [
  {
    id: "RFQ-2026-081",
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    gradeRequired: "Grade A",
    quantityQuintal: 10,
    maxPricePerQtl: 2150,
    deliveryHub: "FreshMart Hadapsar Central Warehouse, Pune",
    status: "Matched with Pool",
    createdAt: "2026-09-07",
    validTill: "2026-09-10",
  },
  {
    id: "RFQ-2026-079",
    crop: "Tomato",
    variety: "Desi/Local",
    gradeRequired: "Grade A or B",
    quantityQuintal: 15,
    maxPricePerQtl: 1950,
    deliveryHub: "FreshMart Hadapsar Central Warehouse, Pune",
    status: "Active RFQ",
    createdAt: "2026-09-08",
    validTill: "2026-09-12",
  },
];

export default function BuyerOffersPage() {
  const [rfqs, setRfqs] = useState<BuyerRFQ[]>(INITIAL_RFQS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    gradeRequired: "Grade A",
    quantityQuintal: "12",
    maxPricePerQtl: "2100",
    deliveryHub: "FreshMart Hadapsar Central Warehouse, Pune",
  });

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    const newRfq: BuyerRFQ = {
      id: `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      crop: formData.crop,
      variety: formData.variety,
      gradeRequired: formData.gradeRequired,
      quantityQuintal: parseInt(formData.quantityQuintal) || 10,
      maxPricePerQtl: parseInt(formData.maxPricePerQtl) || 2000,
      deliveryHub: formData.deliveryHub,
      status: "Active RFQ",
      createdAt: new Date().toISOString().split("T")[0],
      validTill: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    };

    setRfqs([newRfq, ...rfqs]);
    setIsCreateOpen(false);
    toast.success("Purchase Request (RFQ) Broadcasted!", {
      description: `Sent to Baramati & Pune regional FPO clusters.`
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Procurement Orders &amp; RFQs</h1>
          <p className="text-slate-500 text-sm">
            Publish direct purchase requirements to FPOs or track existing contracts.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="bg-green-700 hover:bg-green-800">
          <Plus className="w-4 h-4 mr-1.5" /> Broadcast New RFQ
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleCreateRFQ}>
              <DialogHeader>
                <DialogTitle>Broadcast Purchase Request (RFQ)</DialogTitle>
                <DialogDescription>
                  Specify required crop volume, quality tolerance, and target procurement ceiling.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Crop</Label>
                    <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v || "Tomato" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tomato">Tomato</SelectItem>
                        <SelectItem value="Onion">Onion</SelectItem>
                        <SelectItem value="Pomegranate">Pomegranate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Variety</Label>
                    <Input
                      value={formData.variety}
                      onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Required Grade</Label>
                    <Select
                      value={formData.gradeRequired}
                      onValueChange={(v) => setFormData({ ...formData, gradeRequired: v || "Grade A" })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade A">Grade A Only</SelectItem>
                        <SelectItem value="Grade A or B">Grade A or B</SelectItem>
                        <SelectItem value="Grade B">Grade B (Processing)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Volume (Quintals)</Label>
                    <Input
                      type="number"
                      value={formData.quantityQuintal}
                      onChange={(e) => setFormData({ ...formData, quantityQuintal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Ceiling Offer Price (₹/Quintal)</Label>
                  <Input
                    type="number"
                    value={formData.maxPricePerQtl}
                    onChange={(e) => setFormData({ ...formData, maxPricePerQtl: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Delivery Destination Hub</Label>
                  <Input
                    value={formData.deliveryHub}
                    onChange={(e) => setFormData({ ...formData, deliveryHub: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-700 hover:bg-green-800">
                  Broadcast to FPOs
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {rfqs.map((rfq) => (
          <Card key={rfq.id} className="border-slate-200 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">
                      {rfq.crop} - {rfq.quantityQuintal} Quintals ({rfq.variety})
                    </h3>
                    <Badge
                      className={
                        rfq.status === "Matched with Pool"
                          ? "bg-purple-100 text-purple-800 border-none"
                          : "bg-blue-100 text-blue-800 border-none"
                      }
                    >
                      {rfq.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>RFQ ID: <strong className="font-mono text-slate-700">{rfq.id}</strong></span>
                    <span>Created: {rfq.createdAt}</span>
                    <span>Valid Till: {rfq.validTill}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Target Ceiling Price</div>
                  <div className="text-xl font-bold text-green-700">₹{rfq.maxPricePerQtl}<span className="text-xs font-normal text-slate-500">/qtl</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div className="bg-slate-50 p-3 rounded">
                  <span className="text-slate-500 block mb-1">Quality Tolerance</span>
                  <strong className="text-slate-800">{rfq.gradeRequired}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <span className="text-slate-500 block mb-1">Total Procurement Commitment</span>
                  <strong className="text-slate-800">₹{(rfq.quantityQuintal * rfq.maxPricePerQtl).toLocaleString()}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <span className="text-slate-500 block mb-1">Delivery Destination</span>
                  <strong className="text-slate-800 truncate block">{rfq.deliveryHub}</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
